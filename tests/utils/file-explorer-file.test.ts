import { describe, expect, it, vi } from "vitest";
import { createDiv, createSpan } from "obsidian";
import { addOpenInXournalpp } from "src/utils/file-explorer-file";
import { findCorrespondingXoppToPdf } from "src/utils/xopp-actions";
import XoppPlugin from "src/main";

vi.mock("src/utils/xopp-actions", () => ({
    findCorrespondingXoppToPdf: vi.fn(),
    openXournalppFile: vi.fn(),
}));

describe("file explorer Xournal++ tags", () => {
    it("removes the plugin-managed X++ tag after the corresponding journal is deleted", () => {
        const tagEl = createSpan();
        tagEl.innerText = "X++";
        tagEl.classList.add("clickable-tag");
        tagEl.onclick = vi.fn();

        const fileExplorer = {
            view: {
                containerEl: createDiv(),
                fileItems: {
                    "sample.pdf": { tagEl },
                },
            },
        };
        const onLayoutReady = (callback: () => void) => callback();
        const plugin = {
            app: {
                workspace: {
                    onLayoutReady,
                    getLeavesOfType: vi.fn().mockReturnValue([fileExplorer]),
                },
            },
        } as unknown as XoppPlugin;
        vi.mocked(findCorrespondingXoppToPdf).mockReturnValue(undefined);

        addOpenInXournalpp(plugin);

        expect(tagEl.innerText).toBe("PDF");
        expect(tagEl.classList.contains("clickable-tag")).toBe(false);
        expect(tagEl.onclick).toBeNull();
    });
});
