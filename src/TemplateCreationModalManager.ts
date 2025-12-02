import XoppPlugin from "main";
import {App, normalizePath, Notice, TFile} from "obsidian";
import {MM_TO_PT, PAGE_PRESETS, TemplateSpec} from "src/types";
import * as pako from "pako";
import {getPageCount} from "src/handlePdf";

function escapeXml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function getPageSizeToPt(spec: TemplateSpec): {
	widthPt: number;
	heightPt: number;
} {
	let widthMm: number;
	let heightMm: number;

	if (spec.pageSizePreset === "Custom") {
		if (spec.customWidthMm && spec.customHeightMm) {
			widthMm = spec.customWidthMm;
			heightMm = spec.customHeightMm;
		} else {
			const fallback = PAGE_PRESETS.A4;
			widthMm = fallback.widthMm;
			heightMm = fallback.heightMm;
		}
	} else {
		const preset = PAGE_PRESETS[spec.pageSizePreset];
		widthMm = preset.widthMm;
		heightMm = preset.heightMm;
	}

	if (spec.orientation === "landscape") {
		[widthMm, heightMm] = [heightMm, widthMm];
	}

	return {
		widthPt: widthMm * MM_TO_PT,
		heightPt: heightMm * MM_TO_PT,
	};
}

function normalizeColor(raw: string | undefined | null): string {
	if (!raw) return "#000000ff";

	let c = raw.trim();
	if (!c.startsWith("#")) c = "#" + c;

	if (c.length === 4) {
		const r = c[1],
			g = c[2],
			b = c[3];
		c = `#${r}${r}${g}${g}${b}${b}`;
	}

	if (c.length === 7) {
		c = c + "ff";
	}

	return c;
}

function buildBackgroundTag(spec: TemplateSpec): string {
    const color = normalizeColor(spec.backgroundColor || "#FFFFFF");

    if (spec.backgroundStyle === "pdf") {
        return `<background type="solid" color="${color}" style="plain"/>`;
    }

    const styleMap: Record<TemplateSpec["backgroundStyle"], string> = {
        plain: "plain",
        lined: "lined",
        ruled: "ruled",
        staves: "staves",
        graph: "graph",
        dotted: "dots",
        isodotted: "isodots",
        isograph: "isograph",
        pdf: "plain",
    };

    const style = styleMap[spec.backgroundStyle];

    return `<background type="solid" color="${color}" style="${style}"/>`;
}

function buildTemplateXML(spec: TemplateSpec): string {
    const { widthPt, heightPt } = getPageSizeToPt(spec);

    if (spec.backgroundStyle === "pdf") {
        const filename = spec.pdfPathAbs ?? "";
        const page = spec.pdfPage ?? 1;
		console.log(spec);

		const pageElements = Array.from({ length: page }, (_, pageIndex) => {
			return `<page width="${widthPt}" height="${heightPt}">
    <background type="pdf" domain="absolute" filename="${escapeXml(
        filename
    )}" pageno="${pageIndex+1}"/>
    <layer/>
</page>`;
		}).join("\n");


        return `<?xml version="1.0" standalone="no"?>
<xournal creator="xournalpp 1.2.5" fileversion="4">
<title>Xournal++ document - see https://xournalpp.github.io/</title>
${pageElements}
</xournal>`;
    }

    const backgroundTag = buildBackgroundTag(spec);

    return `<?xml version="1.0" standalone="no"?>
<xournal creator="xournalpp 1.2.5" fileversion="4">
<title>Xournal++ document - see https://xournalpp.github.io/</title>
<page width="${widthPt}" height="${heightPt}">
    ${backgroundTag}
    <layer/>
</page>
</xournal>`;
}

export async function writeTemplateFile(
	app: App,
	folder: string,
	spec: TemplateSpec
): Promise<string> {
	const safeFolder = folder.replace(/^\/+/, "");
	const fileName = spec.name.replace(/\.xopp$/i, "") + ".xopp";
	const vaultPath = normalizePath(
		safeFolder ? `${safeFolder}/${fileName}` : fileName
	);

	if (safeFolder && !app.vault.getAbstractFileByPath(safeFolder)) {
		await app.vault.createFolder(safeFolder);
	}

	const xml = buildTemplateXML(spec);

	if(spec.gzip) {
		const gzipped = pako.gzip(xml);
		const arrayBuffer = gzipped.buffer.slice(
			gzipped.byteOffset,
			gzipped.byteOffset + gzipped.byteLength
		);
		await app.vault.adapter.writeBinary(vaultPath, arrayBuffer);
	} else {
		await app.vault.adapter.write(vaultPath, xml);
	}

	return vaultPath;
}

export async function createTemplate(
	plugin: XoppPlugin,
	spec: TemplateSpec
): Promise<string> {
	if (!spec.name) {
		new Notice("Please enter a template name");
		throw new Error("Missing template name");
	}

	const folder =
		plugin.settings.templatesFolder?.trim() || "XournalTemplates";

	if (!plugin.settings.templatesFolder) {
		plugin.settings.templatesFolder = folder;
		await plugin.saveSettings();
	}

	const vaultPath = await writeTemplateFile(plugin.app, folder, spec);

	new Notice(`Xournal++ template created: ${vaultPath}`);

	return vaultPath;
}

export async function createAnnotationFromPdf(
    plugin: XoppPlugin,
    pdfFile: TFile
): Promise<string> {
    const pdfPath = pdfFile.path;

    const baseName = pdfFile.name.replace(/\.pdf$/i, "");
    const xoppFileName = baseName + "-annotated";
    const xoppVaultPath = pdfPath.replace(/\.pdf$/i, "-annotated.xopp");

    const adapter: any = plugin.app.vault.adapter;
    const absPdfPath: string =
        typeof adapter.getFullPath === "function"
            ? adapter.getFullPath(pdfPath)
            : pdfPath;

	const pageCount = await getPageCount(pdfFile, plugin.app);

    const spec: TemplateSpec = {
        name: xoppFileName,
        pageSizePreset: "A4",
        orientation: "portrait",
        backgroundStyle: "pdf",
        backgroundColor: "#ffffff",
        pdfPathAbs: absPdfPath,
        pdfPage: pageCount,
        gzip: false,
    };

    const folder = pdfPath.contains("/")
        ? pdfPath.substring(0, pdfPath.lastIndexOf("/"))
        : "";

    await writeTemplateFile(plugin.app, folder, spec);

    new Notice(`Xournal++ annotation created: ${xoppVaultPath}`);

    return xoppVaultPath;
}
