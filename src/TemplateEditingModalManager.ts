import { Notice, TFile, TFolder } from "obsidian";
import { ParsedTemplateEditing } from "./modals/TemplateEditingModal";
import { PAGE_PRESETS } from "./TemplateCreationModalManager";
import { TemplateBackgroundStyle, TemplateSpec } from "./modals/TemplateCreationModal";
import XoppPlugin from "main";
import * as pako from "pako";

type PagePresetName = keyof typeof PAGE_PRESETS;

const PT_TO_MM = 25.4 / 72;

async function readXoppXml (plugin: XoppPlugin, file: TFile): Promise<{ xml: string; isGzipped: boolean }> {
    const buffer = await plugin.app.vault.adapter.readBinary(file.path);
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

    const isGzipped = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;

    if (isGzipped) {
        const xmlBytes = pako.ungzip(bytes);
        const xml = new TextDecoder("utf-8").decode(xmlBytes);
        return { xml, isGzipped: true };
    } else {
        const xml = new TextDecoder("utf-8").decode(bytes);
        return { xml, isGzipped: false };
    }
}

function detectPageSizePreset(widthPt: number, heightPt: number) : {
    preset: PagePresetName | "Custom";
    widthMm: number;
    heightMm: number;
    orientation: "portrait" | "landscape";
} {

    const widthMm  = widthPt * PT_TO_MM;
    const heightMm = heightPt * PT_TO_MM;

    const presets = PAGE_PRESETS;

    const orientation: "portrait" | "landscape" =
        widthMm >= heightMm ? "landscape" : "portrait";

    const w = Math.min(widthMm, heightMm);
    const h = Math.max(widthMm, heightMm);
    
    const toleranceMm = 1;

    for (const [name, preset] of Object.entries(presets) as [PagePresetName, {widthMm:number;heightMm:number}][]) {
        const pw = preset.widthMm;
        const ph = preset.heightMm;

        if (Math.abs(w - Math.min(pw, ph)) <= toleranceMm && Math.abs(h - Math.max(pw, ph)) <= toleranceMm) {
            return { preset: name, widthMm, heightMm, orientation };
        }
    }

    return { preset: "Custom", widthMm, heightMm, orientation };
}

function parseBackground(el: Element): {
    backgroundStyle: TemplateBackgroundStyle;
    backgroundColor: string;
    spacingMm?: number;
    marginMm?: number;
} {
    const style = el.getAttribute("style") ?? "";

    const backgroundStyle: TemplateBackgroundStyle = style as TemplateBackgroundStyle;

    const rawColor = el.getAttribute("color") || "#ffffffff";

    return {
        backgroundStyle,
        backgroundColor: rawColor
    };
}

function parseXoppTemplateSpec(xml: string, fileName: string): TemplateSpec {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");

    const pageEl = doc.querySelector("page");
    if (!pageEl) throw new Error("Invalid template: missing <page> element.");

    const widthPt = parseFloat(pageEl.getAttribute("width") ?? "0");
    const heightPt = parseFloat(pageEl.getAttribute("height") ?? "0");

    const { preset: pageSizePreset, widthMm, heightMm, orientation } = detectPageSizePreset(widthPt, heightPt);

    const bgEl = pageEl.querySelector("background");
    const bg = bgEl
        ? parseBackground(bgEl)
        : {
              backgroundStyle: "plain" as TemplateBackgroundStyle,
              backgroundColor: "#ffffffff",
              spacingMm: undefined,
              marginMm: undefined,
          };
    
    const baseName = fileName.replace(/^.*\//, "").replace(/\.xopp$/i, "");

    const spec: TemplateSpec = {
        name: baseName,
        pageSizePreset,
        orientation,
        backgroundStyle: bg.backgroundStyle,
        backgroundColor: bg.backgroundColor,
    };

    if (pageSizePreset === "Custom") {
        spec.customWidthMm  = widthMm;
        spec.customHeightMm = heightMm;
    }

    return spec; 
}

export async function parseTemplateFile(
    plugin: XoppPlugin,
    templatePath: string,
    onFinished: () => void
): Promise<void> {
    const file = plugin.app.vault.getAbstractFileByPath(templatePath);
    if (!file || !(file instanceof TFile)) {
        new Notice("Template file not found.");
        console.error("Template file not found:", templatePath);
        return;
    }

    const { xml, isGzipped } = await readXoppXml(plugin, file);

    const spec: TemplateSpec = parseXoppTemplateSpec(xml, file.name);
    spec.gzip = isGzipped;

    new ParsedTemplateEditing(plugin.app, plugin, spec, onFinished).open();
}

export async function fetchTemplates(plugin: XoppPlugin): Promise<TFile[]> {
    const folderPath = plugin.settings.templatesFolder?.trim();
    if (!folderPath) {
        return [];
    }

    const folder = plugin.app.vault.getAbstractFileByPath(folderPath);
    if (!folder || !(folder instanceof TFolder)) {
        return [];
    }

    const templates = folder.children.filter(
        (child) => child instanceof TFile && child.name.endsWith(".xopp")
    ) as TFile[];

    return templates;
}