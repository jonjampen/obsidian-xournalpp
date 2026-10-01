import { beforeEach, describe, expect, it, vi } from "vitest";
import { TFile } from "obsidian";
import { createCommands } from "src/core/commands";
import { createAnnotatedXoppFromPdf, findCorrespondingXoppToPdf } from "src/utils/xopp-actions";
import XoppPlugin from "src/main";

vi.mock("src/utils/xopp-actions", () => ({
    createAnnotatedXoppFromPdf: vi.fn(),
    deleteXoppAndPdf: vi.fn(),
    findCorrespondingXoppToPdf: vi.fn(),
    openXournalppFile: vi.fn(),
    renameXoppFile: vi.fn(),
}));

vi.mock("src/utils/xopp-to-pdf", () => ({
    exportAllXoppToPDF: vi.fn(),
    exportXoppToPDF: vi.fn(),
}));

vi.mock("src/ui/managers/create-xopp-modal-manager", () => ({ default: class CreateXoppModalManager {} }));
vi.mock("src/ui/modals/rename-modal", () => ({ default: class RenameModal {} }));
vi.mock("src/ui/modals/search-xopp-modal", () => ({ default: class SearchXoppModal {} }));

describe("Xournal++ commands", () => {
    let activeFile: TFile | null;
    let registeredCommands: any[];
    let plugin: XoppPlugin;

    beforeEach(() => {
        vi.clearAllMocks();
        activeFile = null;
        registeredCommands = [];
        vi.mocked(findCorrespondingXoppToPdf).mockReturnValue(undefined);
        plugin = {
            settings: {},
            app: { workspace: { getActiveFile: () => activeFile } },
            addCommand: (command: any) => registeredCommands.push(command),
        } as unknown as XoppPlugin;
    });

    it("exposes the annotation action for an eligible active PDF and runs it", () => {
        const pdfFile = new TFile("chapter.pdf", "math/chapter.pdf");
        activeFile = pdfFile;

        createCommands(plugin);

        const command = registeredCommands.find(({ id }) => id === "annotate-pdf-in-xournalpp");
        expect(command?.checkCallback(true)).toBe(true);
        command?.checkCallback(false);
        expect(createAnnotatedXoppFromPdf).toHaveBeenCalledWith(pdfFile, plugin);
    });

    it("keeps annotation available for a source PDF with an existing derived journal", () => {
        activeFile = new TFile("chapter.pdf", "math/chapter.pdf");

        createCommands(plugin);

        const command = registeredCommands.find(({ id }) => id === "annotate-pdf-in-xournalpp");
        expect(command?.checkCallback(true)).toBe(true);
    });

    it("does not expose annotation for a PDF already paired with its same-basename journal", () => {
        const pdfFile = new TFile("chapter-annotated.pdf", "math/chapter-annotated.pdf");
        activeFile = pdfFile;
        vi.mocked(findCorrespondingXoppToPdf).mockReturnValue(
            new TFile("chapter-annotated.xopp", "math/chapter-annotated.xopp")
        );

        createCommands(plugin);

        const command = registeredCommands.find(({ id }) => id === "annotate-pdf-in-xournalpp");
        expect(command?.checkCallback(true)).toBe(false);
    });
});
