import os
import uuid
import tempfile
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import yt_dlp
import boto3
from botocore.config import Config

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "*")])

# ── Rate Limiting ─────────────────────────────────────────────────────────────
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=[],
    storage_uri="memory://"
)

DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# ── Cloudflare R2 Client ──────────────────────────────────────────────────────
r2 = boto3.client(
    "s3",
    endpoint_url=os.getenv("CLOUDFLARE_R2_ENDPOINT"),
    aws_access_key_id=os.getenv("CLOUDFLARE_R2_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("CLOUDFLARE_R2_SECRET_KEY"),
    config=Config(signature_version="s3v4"),
    region_name="auto",
)
BUCKET = os.getenv("CLOUDFLARE_R2_BUCKET", "toolshub-files")
PUBLIC_URL = os.getenv("CLOUDFLARE_R2_PUBLIC_URL", "")

SUPPORTED_HOSTS = [
    "youtube.com", "youtu.be",
    "instagram.com",
    "twitter.com", "x.com",
    "tiktok.com",
]

QUALITY_FORMAT_MAP = {
    "360p":  "bestvideo[height<=360]+bestaudio/best[height<=360]",
    "720p":  "bestvideo[height<=720]+bestaudio/best[height<=720]",
    "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
    "audio": "bestaudio/best",
}


def is_supported_url(url: str) -> bool:
    return any(host in url for host in SUPPORTED_HOSTS)


def upload_to_r2(file_path: str, content_type: str) -> str:
    """Upload file to Cloudflare R2 and return public URL."""
    key = f"downloads/{uuid.uuid4()}{os.path.splitext(file_path)[1]}"
    with open(file_path, "rb") as f:
        r2.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=f,
            ContentType=content_type,
        )
    if PUBLIC_URL:
        return f"{PUBLIC_URL}/{key}"
    return f"{os.getenv('CLOUDFLARE_R2_ENDPOINT')}/{BUCKET}/{key}"


# ── GET /health ───────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "ToolsHub Downloader"})


# ── POST /info ────────────────────────────────────────────────────────────────
@app.route("/info", methods=["POST"])
@limiter.limit("20 per hour")
def get_info():
    data = request.get_json()
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "URL is required"}), 400
    if not is_supported_url(url):
        return jsonify({"error": "Unsupported platform. Supported: YouTube, Instagram, Twitter/X"}), 400

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        available_formats = []
        formats = info.get("formats", [])
        heights = {f.get("height") for f in formats if f.get("height")}
        if 360 in heights or any(h and h <= 360 for h in heights):
            available_formats.append("360p")
        if 720 in heights or any(h and h <= 720 for h in heights):
            available_formats.append("720p")
        if 1080 in heights or any(h and h <= 1080 for h in heights):
            available_formats.append("1080p")
        available_formats.append("audio")

        return jsonify({
            "title": info.get("title", "Unknown"),
            "thumbnail": info.get("thumbnail", ""),
            "duration": info.get("duration", 0),
            "uploader": info.get("uploader", "Unknown"),
            "availableFormats": available_formats,
            "viewCount": info.get("view_count"),
        })
    except yt_dlp.utils.DownloadError as e:
        return jsonify({"error": f"Could not fetch video info: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": "Failed to fetch video info"}), 500


# ── POST /download ─────────────────────────────────────────────────────────────
@app.route("/download", methods=["POST"])
@limiter.limit("5 per hour")
def download():
    data = request.get_json()
    url = data.get("url", "").strip()
    quality = data.get("quality", "720p")
    fmt = data.get("format", "mp4")

    if not url:
        return jsonify({"error": "URL is required"}), 400
    if not is_supported_url(url):
        return jsonify({"error": "Unsupported platform"}), 400
    if quality not in QUALITY_FORMAT_MAP:
        return jsonify({"error": f"Invalid quality. Choose from: {list(QUALITY_FORMAT_MAP.keys())}"}), 400

    tmp_dir = tempfile.mkdtemp(dir=DOWNLOADS_DIR)
    output_template = os.path.join(tmp_dir, "%(title)s.%(ext)s")

    ydl_opts = {
        "format": QUALITY_FORMAT_MAP[quality],
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
        "merge_output_format": "mp4" if fmt == "mp4" else None,
        "postprocessors": [],
    }

    if fmt == "mp3" or quality == "audio":
        ydl_opts["postprocessors"] = [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }]

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_name = ydl.prepare_filename(info)
            if fmt == "mp3" or quality == "audio":
                file_name = os.path.splitext(file_name)[0] + ".mp3"

        # Find the actual downloaded file
        files = os.listdir(tmp_dir)
        if not files:
            return jsonify({"error": "Download failed — no file produced"}), 500

        actual_file = os.path.join(tmp_dir, files[0])
        file_size = os.path.getsize(actual_file)
        ext = os.path.splitext(actual_file)[1]
        content_type = "audio/mpeg" if ext == ".mp3" else "video/mp4"

        # Upload to R2
        public_url = upload_to_r2(actual_file, content_type)

        # Cleanup
        import shutil
        shutil.rmtree(tmp_dir, ignore_errors=True)

        from datetime import datetime, timedelta
        expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat() + "Z"

        return jsonify({
            "downloadUrl": public_url,
            "fileName": os.path.basename(actual_file),
            "fileSize": file_size,
            "format": fmt,
            "quality": quality,
            "expiresAt": expires_at,
        })

    except yt_dlp.utils.DownloadError as e:
        return jsonify({"error": f"Download failed: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
