import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(__dirname, '..', '..', 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function tempPath(ext: string) {
  return path.join(TEMP_DIR, `${uuidv4()}.${ext}`);
}

function readPdf(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

function checkBinary(binary: string): boolean {
  try {
    const cmd = process.platform === 'win32' ? `where.exe ${binary}` : `which ${binary}`;
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ─── Merge PDFs ────────────────────────────────────────────────────────────────
async function mergePdfs(filePaths: string[]): Promise<string> {
  const merged = await PDFDocument.create();
  for (const fp of filePaths) {
    const doc = await PDFDocument.load(readPdf(fp));
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  const outPath = tempPath('pdf');
  fs.writeFileSync(outPath, await merged.save());
  return outPath;
}

// ─── Split PDF ─────────────────────────────────────────────────────────────────
async function splitPdf(filePath: string, ranges?: number[][]): Promise<string[]> {
  const src = await PDFDocument.load(readPdf(filePath));
  const pageCount = src.getPageCount();

  const effectiveRanges: number[][] = ranges ||
    Array.from({ length: pageCount }, (_, i) => [i]);

  const outputPaths: string[] = [];
  for (const range of effectiveRanges) {
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(src, range);
    pages.forEach((p) => newDoc.addPage(p));
    const outPath = tempPath('pdf');
    fs.writeFileSync(outPath, await newDoc.save());
    outputPaths.push(outPath);
  }
  return outputPaths;
}

// ─── Compress PDF ─────────────────────────────────────────────────────────────
async function compressPdf(filePath: string): Promise<string> {
  if (checkBinary('gs')) {
    try {
      const outPath = tempPath('pdf');
      execSync(
        `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outPath}" "${filePath}"`,
        { timeout: 60000 }
      );
      return outPath;
    } catch (e) {
      console.warn('[PDF] Ghostscript compression failed, falling back to pdf-lib');
    }
  }
  
  // Fallback: just re-save with pdf-lib
  const doc = await PDFDocument.load(readPdf(filePath));
  const outPath = tempPath('pdf');
  fs.writeFileSync(outPath, await doc.save({ useObjectStreams: true }));
  return outPath;
}

// ─── PDF to Word (LibreOffice) ────────────────────────────────────────────────
async function pdfToWord(filePath: string): Promise<string> {
  if (!checkBinary('libreoffice') && !checkBinary('soffice')) {
    throw new Error('PDF to Word conversion requires LibreOffice to be installed on the server.');
  }
  const binary = checkBinary('libreoffice') ? 'libreoffice' : 'soffice';
  const outDir = TEMP_DIR;
  execSync(`"${binary}" --headless --convert-to docx "${filePath}" --outdir "${outDir}"`, {
    timeout: 120000,
  });
  const baseName = path.basename(filePath, '.pdf');
  return path.join(outDir, `${baseName}.docx`);
}

// ─── Word to PDF (LibreOffice) ────────────────────────────────────────────────
async function wordToPdf(filePath: string): Promise<string> {
  if (!checkBinary('libreoffice') && !checkBinary('soffice')) {
    throw new Error('Word to PDF conversion requires LibreOffice to be installed on the server.');
  }
  const binary = checkBinary('libreoffice') ? 'libreoffice' : 'soffice';
  const outDir = TEMP_DIR;
  execSync(`"${binary}" --headless --convert-to pdf "${filePath}" --outdir "${outDir}"`, {
    timeout: 120000,
  });
  const baseName = path.basename(filePath, path.extname(filePath));
  return path.join(outDir, `${baseName}.pdf`);
}

// ─── PDF to JPG (pdftoppm via poppler) ───────────────────────────────────────
async function pdfToJpg(filePath: string): Promise<string[]> {
  if (!checkBinary('pdftoppm')) {
    throw new Error('PDF to Image conversion requires Poppler (pdftoppm) to be installed on the server.');
  }
  const outPrefix = path.join(TEMP_DIR, uuidv4());
  execSync(`pdftoppm -jpeg -r 150 "${filePath}" "${outPrefix}"`, { timeout: 60000 });
  const files = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(path.basename(outPrefix)));
  return files.map((f) => path.join(TEMP_DIR, f)).sort();
}

// ─── JPG to PDF ───────────────────────────────────────────────────────────────
async function jpgToPdf(imagePaths: string[]): Promise<string> {
  const doc = await PDFDocument.create();
  for (const imgPath of imagePaths) {
    const imgBytes = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).toLowerCase();
    const img = ext === '.png'
      ? await doc.embedPng(imgBytes)
      : await doc.embedJpg(imgBytes);
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const outPath = tempPath('pdf');
  fs.writeFileSync(outPath, await doc.save());
  return outPath;
}

// ─── Rotate PDF ───────────────────────────────────────────────────────────────
async function rotatePdf(filePath: string, deg: number, pageIndices?: number[]): Promise<string> {
  const doc = await PDFDocument.load(readPdf(filePath));
  const pages = doc.getPages();
  const targets = pageIndices || pages.map((_, i) => i);
  targets.forEach((i) => pages[i]?.setRotation(degrees(deg)));
  const outPath = tempPath('pdf');
  fs.writeFileSync(outPath, await doc.save());
  return outPath;
}

// ─── Add Watermark ────────────────────────────────────────────────────────────
async function addWatermark(
  filePath: string,
  opts: { text: string; opacity: number; color: string; fontSize: number }
): Promise<string> {
  const doc = await PDFDocument.load(readPdf(filePath));
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  };
  const color = hexToRgb(opts.color || '#FF0000');
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(opts.text, {
      x: width / 2 - (opts.text.length * opts.fontSize) / 4,
      y: height / 2,
      size: opts.fontSize,
      font,
      color,
      opacity: opts.opacity,
      rotate: degrees(45),
    });
  });
  const outPath = tempPath('pdf');
  fs.writeFileSync(outPath, await doc.save());
  return outPath;
}

// ─── Protect PDF ──────────────────────────────────────────────────────────────
async function protectPdf(filePath: string, password: string): Promise<string> {
  if (!checkBinary('qpdf')) {
    throw new Error('PDF protection requires qpdf to be installed on the server.');
  }
  const outPath = tempPath('pdf');
  execSync(
    `qpdf --encrypt "${password}" "${password}" 256 -- "${filePath}" "${outPath}"`,
    { timeout: 30000 }
  );
  return outPath;
}

// ─── Unlock PDF ───────────────────────────────────────────────────────────────
async function unlockPdf(filePath: string, password?: string): Promise<string> {
  const outPath = tempPath('pdf');
  if (checkBinary('qpdf')) {
    try {
      const passFlag = password ? `--password="${password}"` : '';
      execSync(`qpdf --decrypt ${passFlag} "${filePath}" "${outPath}"`, { timeout: 30000 });
      return outPath;
    } catch (e) {
      console.warn('[PDF] qpdf decryption failed');
    }
  }
  
  // Try pdf-lib as fallback
  const doc = await PDFDocument.load(readPdf(filePath));
  fs.writeFileSync(outPath, await doc.save());
  return outPath;
}

// ─── Reorder Pages ────────────────────────────────────────────────────────────
async function reorderPages(filePath: string, order: number[]): Promise<string> {
  const src = await PDFDocument.load(readPdf(filePath));
  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(src, order);
  pages.forEach((p) => newDoc.addPage(p));
  const outPath = tempPath('pdf');
  fs.writeFileSync(outPath, await newDoc.save());
  return outPath;
}

export const pdfService = {
  mergePdfs,
  splitPdf,
  compressPdf,
  pdfToWord,
  wordToPdf,
  pdfToJpg,
  jpgToPdf,
  rotatePdf,
  addWatermark,
  protectPdf,
  unlockPdf,
  reorderPages,
};
