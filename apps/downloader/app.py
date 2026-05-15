import os
import uuid
import json
import shutil
import tempfile
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import yt_dlp

load_dotenv()

app = Flask(__name__)

# CORS: Allow any localhost port in dev
CORS(app, origins=re.compile(r"http://localhost(:\d+)?$") if os.getenv("FLASK_ENV") != "production"
     else [os.getenv("FRONTEND_URL", "")], supports_credentials=True)

# Rate Limiting
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=[],
    storage_uri="memory://"
)

# Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# Optional Cloudflare R2
r2 = None
endpoint_url = os.getenv("CLOUDFLARE_R2_ENDPOINT", "")
if endpoint_url and not endpoint_url.startswith("https://YOUR_ACCOUNT_ID"):
    try:
        import boto3
        from botocore.config import Config
        r2 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv("CLOUDFLARE_R2_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("CLOUDFLARE_R2_SECRET_KEY"),
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
        print("[INFO] Cloudflare R2 client initialized.")
    except Exception as e:
        print(f"[WARNING] Could not initialize R2 client: {e}")

BUCKET = os.getenv("CLOUDFLARE_R2_BUCKET", "toolshub-files")
PUBLIC_URL = os.getenv("CLOUDFLARE_R2_PUBLIC_URL", "")

SUPPORTED_HOSTS = [
    "youtube.com", "youtu.be",
    "instagram.com",
    "twitter.com", "x.com",
    "tiktok.com",
    "facebook.com",
    "vimeo.com"
]

# Improved format selectors for better compatibility without FFmpeg
QUALITY_FORMAT_MAP = {
    "360p":  "best[height<=360][ext=mp4]/best[height<=360]/best",
    "720p":  "best[height<=720][ext=mp4]/best[height<=720]/best",
    "1080p": "best[height<=1080][ext=mp4]/best[height<=1080]/best",
    "audio": "bestaudio[ext=m4a]/bestaudio/best",
}

def _get_ffmpeg_path() -> str | None:
    """Return path to FFmpeg binary (from imageio-ffmpeg if available)."""
    try:
        import imageio_ffmpeg
        path = imageio_ffmpeg.get_ffmpeg_exe()
        print(f"[INFO] Found FFmpeg via imageio-ffmpeg: {path}")
        return path
    except Exception:
        pass
    return None

def is_supported_url(url: str) -> bool:
    return any(host in url.lower() for host in SUPPORTED_HOSTS)

def upload_to_r2(file_path: str, content_type: str) -> str | None:
    if not r2: return None
    key = f"downloads/{uuid.uuid4()}{os.path.splitext(file_path)[1]}"
    try:
        with open(file_path, "rb") as f:
            r2.put_object(Bucket=BUCKET, Key=key, Body=f, ContentType=content_type)
        if PUBLIC_URL: return f"{PUBLIC_URL.rstrip('/')}/{key}"
        return f"{endpoint_url.rstrip('/')}/{BUCKET}/{key}"
    except Exception as e:
        print(f"[ERROR] R2 upload failed: {e}")
        return None

def serve_locally(file_path: str) -> str:
    port = int(os.getenv("PORT", 5000))
    dest_name = uuid.uuid4().hex + os.path.splitext(file_path)[1]
    dest = os.path.join(DOWNLOADS_DIR, dest_name)
    shutil.move(file_path, dest)
    # Note: This assumes the frontend can reach the downloader directly or via proxy
    # If proxying via Express, this URL might need to be adjusted
    return f"http://localhost:{port}/files/{dest_name}"

@app.route("/files/<path:filename>")
def serve_file(filename):
    return send_from_directory(DOWNLOADS_DIR, filename, as_attachment=True)

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "ToolsHub Downloader",
        "r2_configured": r2 is not None,
        "ffmpeg_detected": _get_ffmpeg_path() is not None
    })

@app.route("/info", methods=["POST"])
@limiter.limit("30 per hour")
def get_info():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "URL is required"}), 400
    if not is_supported_url(url):
        return jsonify({"error": "Unsupported platform"}), 400

    ydl_opts = {
        "format": "best",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        formats = info.get("formats", [])
        heights = sorted(list({f.get("height") for f in formats if f.get("height")}))

        available_formats = []
        if heights:
            if any(h <= 360 for h in heights): available_formats.append("360p")
            if any(h <= 720 for h in heights): available_formats.append("720p")
            if any(h <= 1080 for h in heights): available_formats.append("1080p")
        else:
            available_formats = ["360p", "720p", "1080p"]
        available_formats.append("audio")

        return jsonify({
            "title": info.get("title", "Unknown"),
            "thumbnail": info.get("thumbnail", ""),
            "duration": info.get("duration", 0),
            "uploader": info.get("uploader") or info.get("channel", "Unknown"),
            "availableFormats": available_formats,
            "viewCount": info.get("view_count"),
            "platform": info.get("extractor_key", "Unknown"),
        })

    except Exception as e:
        print(f"[ERROR] /info: {e}")
        return jsonify({"error": str(e)}), 400

@app.route("/download", methods=["POST"])
@limiter.limit("10 per hour")
def download():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()
    quality = data.get("quality", "720p")
    fmt = data.get("format", "mp4")

    if not url: return jsonify({"error": "URL is required"}), 400
    
    is_audio = (fmt == "mp3" or quality == "audio")
    tmp_dir = tempfile.mkdtemp(dir=DOWNLOADS_DIR)
    
    ffmpeg_path = _get_ffmpeg_path()
    
    ydl_opts = {
        "format": QUALITY_FORMAT_MAP.get(quality, "best"),
        "outtmpl": os.path.join(tmp_dir, "%(title)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }
    
    if ffmpeg_path:
        ydl_opts["ffmpeg_location"] = ffmpeg_path
        if is_audio:
            ydl_opts["postprocessors"] = [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }]
    elif is_audio:
        # Fallback for no ffmpeg: just get best audio and keep original ext (m4a usually)
        ydl_opts["format"] = "bestaudio/best"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
        files = [f for f in os.listdir(tmp_dir) if os.path.isfile(os.path.join(tmp_dir, f))]
        if not files:
            return jsonify({"error": "Download produced no file"}), 500

        actual_file = os.path.join(tmp_dir, files[0])
        ext = os.path.splitext(actual_file)[1].lower()
        content_type = "audio/mpeg" if ext == ".mp3" else "video/mp4"
        file_size = os.path.getsize(actual_file)

        public_url = upload_to_r2(actual_file, content_type)
        if not public_url:
            public_url = serve_locally(actual_file)
        
        shutil.rmtree(tmp_dir, ignore_errors=True)

        return jsonify({
            "downloadUrl": public_url,
            "fileName": os.path.basename(actual_file),
            "fileSize": file_size,
            "format": ext.lstrip("."),
            "quality": quality,
            "expiresAt": (import_datetime().utcnow() + import_timedelta()(hours=1)).isoformat() + "Z"
        })

    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        print(f"[ERROR] /download: {e}")
        return jsonify({"error": str(e)}), 500

def import_datetime():
    from datetime import datetime
    return datetime

def import_timedelta():
    from datetime import timedelta
    return timedelta

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
