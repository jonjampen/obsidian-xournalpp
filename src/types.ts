export type TemplateBackgroundStyle =
	| "plain"
	| "lined"
	| "ruled"
	| "staves"
	| "graph"
	| "dotted"
	| "isodotted"
	| "isograph"
	| "pdf";

export interface PDFSpec {
	width: number,
	height: number,
	pdfPage: number
}

export interface TemplateSpec {
	name: string;
	pageSizePreset:
		| "A3"
		| "A4"
		| "A5"
		| "US Letter"
		| "US Legal"
		| "16x9"
		| "4x3"
		| "Custom";
	customWidthMm?: number;
	customHeightMm?: number;
	orientation: "portrait" | "landscape";
	backgroundStyle: TemplateBackgroundStyle;
	backgroundColor: string;
	gzip? : boolean;

	pdfPathAbs?: string;
    pdfPage?: number;
}

export const PT_TO_MM = 25.4 / 72;

export const MM_TO_PT = 72 / 25.4;

export const PAGE_PRESETS = {
	A3: { widthMm: 297, heightMm: 420 },
	A4: { widthMm: 210, heightMm: 297 },
	A5: { widthMm: 148, heightMm: 210 },
	"US Legal": { widthMm: 215.9, heightMm: 355.6 },
	"US Letter": { widthMm: 215.9, heightMm: 279.4 },
	"16x9": { widthMm: 180, heightMm: 320 },
	"4x3": { widthMm: 240, heightMm: 320 },
};

export type PagePresetName = keyof typeof PAGE_PRESETS;
