import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    findCorrespondingXoppToPdf,
    getTemplateFilePath,
    createTemplate,
    renameXoppFile,
    deleteXoppAndPdf,
} from "src/utils/xopp-actions";
import XoppPlugin from "src/main";
import { TFile, TFolder, DataAdapter } from "obsidian";

describe("xopp-actions", () => {
    let mockPlugin: XoppPlugin;
    let mockVault: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let mockFileManager: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
        mockVault = {
            getFileByPath: vi.fn(),
            getFolderByPath: vi.fn(),
            createBinary: vi.fn(),
        };

        mockFileManager = {
            renameFile: vi.fn(),
            trashFile: vi.fn(),
        };

        mockPlugin = {
            app: {
                vault: mockVault,
                fileManager: mockFileManager,
            },
            settings: {
                defaultTemplatePath: "",
            },
            manifest: {
                id: "obsidian-xournalpp",
            },
        } as unknown as XoppPlugin;
    });

    describe("findCorrespondingXoppToPdf", () => {
        it("should return the matching XOPP file from the parent folder children", () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const xoppFile = new TFile("test.xopp", "folder/test.xopp");

            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile, xoppFile];
            pdfFile.parent = parentFolder;

            mockVault.getFileByPath.mockReturnValue(pdfFile);

            const result = findCorrespondingXoppToPdf("folder/test.pdf", mockPlugin);
            expect(result).toBe(xoppFile);
        });

        it("should return undefined if no matching XOPP file exists", () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile];
            pdfFile.parent = parentFolder;

            mockVault.getFileByPath.mockReturnValue(pdfFile);

            const result = findCorrespondingXoppToPdf("folder/test.pdf", mockPlugin);
            expect(result).toBeUndefined();
        });
    });

    describe("getTemplateFilePath", () => {
        let mockFs: DataAdapter;

        beforeEach(() => {
            mockFs = {
                exists: vi.fn(),
                copy: vi.fn(),
                write: vi.fn(),
                read: vi.fn(),
            } as unknown as DataAdapter;
            mockPlugin.app.vault.configDir = ".obsidian";
        });

        it("should return custom template path if specified and exists", async () => {
            mockPlugin.settings.defaultTemplatePath = "templates/custom.xopp";
            vi.mocked(mockFs.exists).mockResolvedValue(true);

            const result = await getTemplateFilePath(mockPlugin, mockFs);
            expect(result).toBe("templates/custom.xopp");
            expect(mockFs.exists).toHaveBeenCalledWith("templates/custom.xopp");
        });

        it("should throw an error if custom template path does not exist", async () => {
            mockPlugin.settings.defaultTemplatePath = "templates/missing.xopp";
            vi.mocked(mockFs.exists).mockResolvedValue(false);

            await expect(getTemplateFilePath(mockPlugin, mockFs)).rejects.toThrow(
                "Could not find the given template file."
            );
        });

        it("should return default template path and create template if missing", async () => {
            mockPlugin.settings.defaultTemplatePath = "";
            const expectedDefaultPath = ".obsidian/plugins/obsidian-xournalpp/template.xopp";

            vi.mocked(mockFs.exists).mockResolvedValue(false);
            mockVault.createBinary.mockResolvedValue({} as TFile);

            const result = await getTemplateFilePath(mockPlugin, mockFs);
            expect(result).toBe(expectedDefaultPath);
            expect(mockFs.exists).toHaveBeenCalledWith(expectedDefaultPath);
            expect(mockVault.createBinary).toHaveBeenCalledWith(expectedDefaultPath, expect.any(ArrayBuffer));
        });
    });

    describe("createTemplate", () => {
        it("should create binary file with decoded base64 default template", async () => {
            mockVault.createBinary.mockResolvedValue({} as TFile);
            await createTemplate(mockPlugin, "some/path/template.xopp");

            expect(mockVault.createBinary).toHaveBeenCalledWith("some/path/template.xopp", expect.any(ArrayBuffer));
        });
    });

    describe("renameXoppFile", () => {
        it("should invoke fileManager rename for both xopp and pdf files", async () => {
            const xoppFile = new TFile("old.xopp", "folder/old.xopp");
            const pdfFile = new TFile("old.pdf", "folder/old.pdf");

            await renameXoppFile(mockPlugin, xoppFile, pdfFile, "new");

            expect(mockFileManager.renameFile).toHaveBeenCalledTimes(2);
            expect(mockFileManager.renameFile).toHaveBeenNthCalledWith(1, xoppFile, "folder/new.xopp");
            expect(mockFileManager.renameFile).toHaveBeenNthCalledWith(2, pdfFile, "folder/new.pdf");
        });
    });

    describe("deleteXoppAndPdf", () => {
        it("should delete both xopp and pdf files from vault", async () => {
            const xoppFile = new TFile("note.xopp", "note.xopp");
            const pdfFile = new TFile("note.pdf", "note.pdf");

            await deleteXoppAndPdf(mockPlugin, xoppFile, pdfFile);

            expect(mockFileManager.trashFile).toHaveBeenCalledTimes(2);
            expect(mockFileManager.trashFile).toHaveBeenNthCalledWith(1, xoppFile);
            expect(mockFileManager.trashFile).toHaveBeenNthCalledWith(2, pdfFile);
        });
    });
});
