import { describe, expect, it, vi } from "vitest";
import { Menu, TFile, TFolder } from "obsidian";
import { addXournalppOptionsToFileMenu } from "src/utils/file-menu";
import { createAnnotatedXoppFromPdf, findCorrespondingXoppToPdf } from "src/utils/xopp-actions";
import XoppPlugin from "src/main";

vi.mock("src/utils/xopp-actions", () => ({
    createAnnotatedXoppFromPdf: vi.fn(),
    deleteXoppAndPdf: vi.fn(),
    findCorrespondingXoppToPdf: vi.fn().mockReturnValue(undefined),
    openXournalppFile: vi.fn(),
    renameXoppFile: vi.fn(),
}));

vi.mock("src/ui/managers/create-xopp-modal-manager", () => ({
    default: class CreateXoppModalManager {},
}));

vi.mock("src/ui/modals/rename-modal", () => ({
    default: class RenameModal {},
}));

type MenuItemStub = {
    title?: string;
    click?: () => void;
    setTitle: (title: string) => MenuItemStub;
    setIcon: (icon: string) => MenuItemStub;
    setSection: (section: string) => MenuItemStub;
    onClick: (handler: () => void) => MenuItemStub;
};

function createMenu(): { items: MenuItemStub[]; addItem: (callback: (item: MenuItemStub) => void) => void } {
    const items: MenuItemStub[] = [];

    return {
        items,
        addItem(callback: (item: MenuItemStub) => void) {
            const item = {} as MenuItemStub;
            item.setTitle = (title: string) => {
                item.title = title;
                return item;
            };
            item.setIcon = (_icon: string) => item;
            item.setSection = (_section: string) => item;
            item.onClick = (handler: () => void) => {
                item.click = handler;
                return item;
            };
            callback(item);
            items.push(item);
        },
    };
}

describe("PDF file menu", () => {
    it("offers creating an attached annotation journal when the PDF has no journal", () => {
        const pdfFile = new TFile("chapter.pdf", "math/chapter.pdf");
        const folder = new TFolder("math", "math");
        folder.children = [pdfFile];
        pdfFile.parent = folder;

        const plugin = {
            app: {
                vault: {
                    getFileByPath: vi.fn().mockReturnValue(pdfFile),
                    getFolderByPath: vi.fn().mockReturnValue(folder),
                },
            },
        } as unknown as XoppPlugin;
        const menu = createMenu();

        addXournalppOptionsToFileMenu(menu as unknown as Menu, pdfFile, plugin);

        const annotateItem = menu.items.find((item) => item.title === "Annotate PDF in Xournal++");
        expect(annotateItem).toBeDefined();

        annotateItem?.click?.();
        expect(createAnnotatedXoppFromPdf).toHaveBeenCalledWith(pdfFile, plugin);
    });

    it("does not offer rename or delete when opening an annotation journal from the clean PDF", () => {
        const pdfFile = new TFile("chapter.pdf", "math/chapter.pdf");
        const annotationFile = new TFile("chapter-批注.xopp", "math/chapter-批注.xopp");
        const plugin = { app: { vault: {} } } as unknown as XoppPlugin;
        const menu = createMenu();
        vi.mocked(findCorrespondingXoppToPdf).mockReturnValue(annotationFile);

        addXournalppOptionsToFileMenu(menu as unknown as Menu, pdfFile, plugin);

        expect(menu.items.map((item) => item.title)).toEqual(["Open in Xournal++", "Update from Xournal++"]);
    });

    it("keeps rename and delete for an official exact PDF-XOPP pair", () => {
        const pdfFile = new TFile("chapter.pdf", "math/chapter.pdf");
        const regularFile = new TFile("chapter.xopp", "math/chapter.xopp");
        const plugin = { app: { vault: {} } } as unknown as XoppPlugin;
        const menu = createMenu();
        vi.mocked(findCorrespondingXoppToPdf).mockReturnValue(regularFile);

        addXournalppOptionsToFileMenu(menu as unknown as Menu, pdfFile, plugin);

        expect(menu.items.map((item) => item.title)).toEqual([
            "Open in Xournal++",
            "Update from Xournal++",
            "Rename PDF & Xournal++...",
            "Delete PDF & Xournal++",
        ]);
    });
});
