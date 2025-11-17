import XoppPlugin from "main";
import { App, normalizePath, Notice } from "obsidian";
import type { TemplateSpec } from "src/modals/TemplateCreationModal";

const MM_TO_PT = 72 / 25.4;

export const PAGE_PRESETS = {
	A3: { widthMm: 297, heightMm: 420 },
	A4: { widthMm: 210, heightMm: 297 },
	A5: { widthMm: 148, heightMm: 210 },
	"US Legal": { widthMm: 215.9, heightMm: 355.6 },
	"US Letter": { widthMm: 215.9, heightMm: 279.4 },
	"16x9": { widthMm: 180, heightMm: 320 },
	"4x3": { widthMm: 240, heightMm: 320 },
};

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

	const tag = `<background type="solid" color="${color}" style="${spec.backgroundStyle}"/>`;
	return tag;
}

function buildTemplateXML(spec: TemplateSpec): string {
	const { widthPt, heightPt } = getPageSizeToPt(spec);
	const backgroundTag = buildBackgroundTag(spec);

	return `<?xml version="1.0" standalone="no"?>
<xournal creator="xournalpp 1.2.5" fileversion="1">
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
	await app.vault.adapter.write(vaultPath, xml);
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

	// use the same key as in settings: templatesFolderPath
	const folder =
		plugin.settings.templatesFolder?.trim() || "XournalTemplates";

	// if folder not set yet, initialize it
	if (!plugin.settings.templatesFolder) {
		plugin.settings.templatesFolder = folder;
		await plugin.saveSettings();
	}

	const vaultPath = await writeTemplateFile(plugin.app, folder, spec);

	new Notice(`Xournal++ template created: ${vaultPath}`);

	return vaultPath;
}
