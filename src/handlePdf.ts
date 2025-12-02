import {App, TFile} from "obsidian";
import {PDFDocument} from "pdf-lib";
import {PDFSpec} from "src/types";

export async function getPageCount(file: TFile, app: App): Promise<number> {
    const arrayBuffer = await app.vault.readBinary(file);
    const pdfDoc = await PDFDocument.load(arrayBuffer);
	return pdfDoc.getPageCount();
}

async function getFirstPagePdfDimensions(
	file: TFile,
	app: App
): Promise<{ width: number; height: number }> {
	const arrayBuffer = await app.vault.readBinary(file);
	const pdfDoc = await PDFDocument.load(arrayBuffer);
	const page = pdfDoc.getPage(0);
	const { width, height } = page.getSize();
	return { width, height };
}

export async function getPDFSpec(file: TFile, app: App): Promise<PDFSpec> {
	const dimensions = await getFirstPagePdfDimensions(file, app);

	return {
		width: dimensions.width,
		height: dimensions.height,
		pdfPage: await getPageCount(file, app)
	};
}
