import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import parseFileName from "src/utils/file-name-parser";
import XoppPlugin from "src/main";
import { TFile } from "obsidian";

describe("parseFileName", () => {
    let mockPlugin: XoppPlugin;
    let mockActiveFile: TFile | null = null;

    beforeEach(() => {
        mockPlugin = {
            app: {
                workspace: {
                    getActiveFile: () => mockActiveFile,
                },
            },
            settings: {},
        } as unknown as XoppPlugin;

        // Set system time to August 12, 2026, 15:45:30
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 7, 12, 15, 45, 30));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return the original string if no placeholders are present", () => {
        const result = parseFileName("my-normal-file-name", mockPlugin);
        expect(result.text).toBe("my-normal-file-name");
        expect(result.cursorIndex).toBeUndefined();
    });

    it("should substitute ${fname} with the active file basename", () => {
        mockActiveFile = new TFile("ActiveNote.md", "folder/ActiveNote.md");
        const result = parseFileName("prefix-${fname}-suffix", mockPlugin);
        expect(result.text).toBe("prefix-ActiveNote-suffix");
    });

    it("should substitute ${fname} with empty string if no active file is present", () => {
        mockActiveFile = null;
        const result = parseFileName("prefix-${fname}-suffix", mockPlugin);
        expect(result.text).toBe("prefix--suffix");
    });

    it("should parse date placeholders correctly", () => {
        const result = parseFileName("notes-${YYYY}-${MM}-${DD}", mockPlugin);
        expect(result.text).toBe("notes-2026-08-12");
    });

    it("should parse time placeholders correctly", () => {
        const result = parseFileName("notes-${HH}-${mm}-${ss}", mockPlugin);
        expect(result.text).toBe("notes-15-45-30");
    });

    it("should handle cursor placeholders without showing cursor", () => {
        const result = parseFileName("prefix-${cursor}-suffix", mockPlugin, false);
        expect(result.text).toBe("prefix--suffix");
        expect(result.cursorIndex).toBe(7);
    });

    it("should handle cursor placeholders with showing cursor", () => {
        const result = parseFileName("prefix-${cursor}-suffix", mockPlugin, true);
        expect(result.text).toBe("prefix-\u275A-suffix");
        expect(result.cursorIndex).toBe(7);
    });
});
