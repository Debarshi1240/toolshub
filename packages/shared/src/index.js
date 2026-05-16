"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDF_TOOLS = exports.SUPPORTED_PLATFORMS = void 0;
exports.formatBytes = formatBytes;
exports.generateId = generateId;
exports.getExpiryTimestamp = getExpiryTimestamp;
exports.isValidUrl = isValidUrl;
exports.countWords = countWords;
exports.isSupportedUrl = isSupportedUrl;
__exportStar(require("./types"), exports);
// ─── Utility Functions ────────────────────────────────────────────────────────
/** Format bytes to human-readable string */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/** Generate a UUID v4 */
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/** Get expiry timestamp (default 1 hour) */
function getExpiryTimestamp(hoursFromNow = 1) {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hoursFromNow);
    return expiry.toISOString();
}
/** Validate URL */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/** Count words in a string */
function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}
/** Supported video platforms */
exports.SUPPORTED_PLATFORMS = ['youtube.com', 'youtu.be', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com'];
function isSupportedUrl(url) {
    try {
        const { hostname } = new URL(url);
        return exports.SUPPORTED_PLATFORMS.some((p) => hostname.includes(p));
    }
    catch {
        return false;
    }
}
/** PDF tool metadata */
exports.PDF_TOOLS = [
    { id: 'merge-pdf', title: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: '🔗', color: 'from-red-500 to-orange-500' },
    { id: 'split-pdf', title: 'Split PDF', description: 'Extract pages or split by range', icon: '✂️', color: 'from-orange-500 to-yellow-500' },
    { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce file size', icon: '🗜️', color: 'from-yellow-500 to-green-500' },
    { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDF to .docx', icon: '📝', color: 'from-blue-500 to-indigo-500' },
    { id: 'word-to-pdf', title: 'Word to PDF', description: 'Convert .docx to PDF', icon: '📄', color: 'from-indigo-500 to-purple-500' },
    { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Extract pages as images', icon: '🖼️', color: 'from-purple-500 to-pink-500' },
    { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Images to PDF', icon: '📸', color: 'from-pink-500 to-red-500' },
    { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Rotate pages', icon: '🔄', color: 'from-teal-500 to-cyan-500' },
    { id: 'watermark-pdf', title: 'Add Watermark', description: 'Text/image watermark', icon: '💧', color: 'from-cyan-500 to-blue-500' },
    { id: 'protect-pdf', title: 'Protect PDF', description: 'Add password protection', icon: '🔒', color: 'from-green-500 to-teal-500' },
    { id: 'unlock-pdf', title: 'Unlock PDF', description: 'Remove password', icon: '🔓', color: 'from-amber-500 to-orange-500' },
    { id: 'reorder-pdf', title: 'Reorder Pages', description: 'Drag to reorder pages', icon: '📋', color: 'from-violet-500 to-purple-500' },
    { id: 'compress-all', title: 'Compress All Files', description: 'Batch compress multiple PDFs at once', icon: '🗜️', color: 'from-emerald-500 to-teal-600' },
    { id: 'create-zip', title: 'Create ZIP Folder', description: 'Package multiple files into a single ZIP archive', icon: '📦', color: 'from-blue-600 to-indigo-700' },
];
//# sourceMappingURL=index.js.map