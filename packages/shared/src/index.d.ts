export * from './types';
/** Format bytes to human-readable string */
export declare function formatBytes(bytes: number, decimals?: number): string;
/** Generate a UUID v4 */
export declare function generateId(): string;
/** Get expiry timestamp (default 1 hour) */
export declare function getExpiryTimestamp(hoursFromNow?: number): string;
/** Validate URL */
export declare function isValidUrl(url: string): boolean;
/** Count words in a string */
export declare function countWords(text: string): number;
/** Supported video platforms */
export declare const SUPPORTED_PLATFORMS: string[];
export declare function isSupportedUrl(url: string): boolean;
/** PDF tool metadata */
export declare const PDF_TOOLS: readonly [{
    readonly id: "merge-pdf";
    readonly title: "Merge PDF";
    readonly description: "Combine multiple PDFs into one";
    readonly icon: "🔗";
    readonly color: "from-red-500 to-orange-500";
}, {
    readonly id: "split-pdf";
    readonly title: "Split PDF";
    readonly description: "Extract pages or split by range";
    readonly icon: "✂️";
    readonly color: "from-orange-500 to-yellow-500";
}, {
    readonly id: "compress-pdf";
    readonly title: "Compress PDF";
    readonly description: "Reduce file size";
    readonly icon: "🗜️";
    readonly color: "from-yellow-500 to-green-500";
}, {
    readonly id: "pdf-to-word";
    readonly title: "PDF to Word";
    readonly description: "Convert PDF to .docx";
    readonly icon: "📝";
    readonly color: "from-blue-500 to-indigo-500";
}, {
    readonly id: "word-to-pdf";
    readonly title: "Word to PDF";
    readonly description: "Convert .docx to PDF";
    readonly icon: "📄";
    readonly color: "from-indigo-500 to-purple-500";
}, {
    readonly id: "pdf-to-jpg";
    readonly title: "PDF to JPG";
    readonly description: "Extract pages as images";
    readonly icon: "🖼️";
    readonly color: "from-purple-500 to-pink-500";
}, {
    readonly id: "jpg-to-pdf";
    readonly title: "JPG to PDF";
    readonly description: "Images to PDF";
    readonly icon: "📸";
    readonly color: "from-pink-500 to-red-500";
}, {
    readonly id: "rotate-pdf";
    readonly title: "Rotate PDF";
    readonly description: "Rotate pages";
    readonly icon: "🔄";
    readonly color: "from-teal-500 to-cyan-500";
}, {
    readonly id: "watermark-pdf";
    readonly title: "Add Watermark";
    readonly description: "Text/image watermark";
    readonly icon: "💧";
    readonly color: "from-cyan-500 to-blue-500";
}, {
    readonly id: "protect-pdf";
    readonly title: "Protect PDF";
    readonly description: "Add password protection";
    readonly icon: "🔒";
    readonly color: "from-green-500 to-teal-500";
}, {
    readonly id: "unlock-pdf";
    readonly title: "Unlock PDF";
    readonly description: "Remove password";
    readonly icon: "🔓";
    readonly color: "from-amber-500 to-orange-500";
}, {
    readonly id: "reorder-pdf";
    readonly title: "Reorder Pages";
    readonly description: "Drag to reorder pages";
    readonly icon: "📋";
    readonly color: "from-violet-500 to-purple-500";
}, {
    readonly id: "compress-all";
    readonly title: "Compress All Files";
    readonly description: "Batch compress multiple PDFs at once";
    readonly icon: "🗜️";
    readonly color: "from-emerald-500 to-teal-600";
}, {
    readonly id: "create-zip";
    readonly title: "Create ZIP Folder";
    readonly description: "Package multiple files into a single ZIP archive";
    readonly icon: "📦";
    readonly color: "from-blue-600 to-indigo-700";
}];
