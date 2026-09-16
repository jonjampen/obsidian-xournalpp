import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    createAnnotatedXoppFromPdf,
    findCorrespondingXoppToPdf,
    getAnnotatedPdfPath,
    getAnnotatedXoppPath,
    getTemplateFilePath,
    createTemplate,
    renameXoppFile,
    deleteXoppAndPdf,
} from "src/utils/xopp-actions";
import XoppPlugin from "src/main";
import { exec } from "child_process";
import { checkXoppSetup } from "src/core/environment-checks";
import { TFile, TFolder, DataAdapter, FileSystemAdapter } from "obsidian";

vi.mock("src/core/environment-checks", () => ({
    checkXoppSetup: vi.fn(),
}));

describe("xopp-actions", () => {
    let mockPlugin: XoppPlugin;
    let mockVault: any;
    let mockFileManager: any;

    beforeEach(() => {
        mockVault = {
            getFileByPath: vi.fn(),
            getFolderByPath: vi.fn(),
            createBinary: vi.fn(),
            adapter: new FileSystemAdapter(),
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

    describe("annotation paths", () => {
        it("replaces only the final PDF suffix and preserves folder, spaces, and earlier dots", () => {
            const sourcePath = "数学/第一章.函数 极限.pdf";

            expect(getAnnotatedXoppPath(sourcePath)).toBe("数学/第一章.函数 极限-批注.xopp");
            expect(getAnnotatedPdfPath(sourcePath)).toBe("数学/第一章.函数 极限-批注.pdf");
        });
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

        it("should return the annotation journal when the regular matching journal is absent", () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationFile = new TFile("test-批注.xopp", "folder/test-批注.xopp");
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile, annotationFile];
            pdfFile.parent = parentFolder;

            mockVault.getFileByPath.mockReturnValue(pdfFile);

            const result = findCorrespondingXoppToPdf("folder/test.pdf", mockPlugin);
            expect(result).toBe(annotationFile);
        });

        it("should prefer the regular matching journal over the annotation journal", () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationFile = new TFile("test-批注.xopp", "folder/test-批注.xopp");
            const regularFile = new TFile("test.xopp", "folder/test.xopp");
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile, annotationFile, regularFile];
            pdfFile.parent = parentFolder;

            mockVault.getFileByPath.mockReturnValue(pdfFile);

            const result = findCorrespondingXoppToPdf("folder/test.pdf", mockPlugin);
            expect(result).toBe(regularFile);
        });
    });

    describe("createAnnotatedXoppFromPdf", () => {
        it("creates and opens a same-folder attached journal with the annotation suffix", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationFile = new TFile("test-批注.xopp", "folder/test-批注.xopp");
            let created = false;

            mockVault.getFileByPath.mockImplementation((path: string) => {
                if (path === pdfFile.path) return pdfFile;
                if (path === annotationFile.path && created) return annotationFile;
                return undefined;
            });
            vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

            const execMock = vi.mocked(exec);
            execMock.mockClear();
            execMock.mockImplementation(((command: string, callback?: (error: Error | null) => void) => {
                if (command.includes("--attach-mode")) created = true;
                callback?.(null);
                return undefined;
            }) as unknown as typeof exec);

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(execMock).toHaveBeenNthCalledWith(
                1,
                "xournalpp --attach-mode --save='/mocked/vault/path/folder/test-批注.xopp' '/mocked/vault/path/folder/test.pdf'",
                expect.any(Function)
            );
            expect(execMock).toHaveBeenCalledTimes(1);
        });

        it("launches Xournal++ without waiting for the process to exit", async () => {
            vi.useFakeTimers();
            try {
                const pdfFile = new TFile("test.pdf", "folder/test.pdf");
                const annotationFile = new TFile("test-批注.xopp", "folder/test-批注.xopp");
                let created = false;
                const parentFolder = new TFolder("folder", "folder");
                parentFolder.children = [pdfFile];
                pdfFile.parent = parentFolder;

                mockVault.getFileByPath.mockImplementation((path: string) => {
                    if (path === pdfFile.path) return pdfFile;
                    if (path === annotationFile.path && created) return annotationFile;
                    return undefined;
                });
                vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

                const execMock = vi.mocked(exec);
                execMock.mockClear();
                execMock.mockImplementation(((command: string, callback?: (error: Error | null) => void) => {
                    if (command.includes("--attach-mode")) {
                        created = true;
                        window.setTimeout(() => callback?.(null), 1000);
                    } else {
                        callback?.(null);
                    }
                    return undefined;
                }) as unknown as typeof exec);

                const operation = createAnnotatedXoppFromPdf(pdfFile, mockPlugin);
                await Promise.resolve();
                await Promise.resolve();
                await Promise.resolve();
                await Promise.resolve();

                expect(execMock).toHaveBeenCalledTimes(1);
                vi.runOnlyPendingTimers();
                await operation;
                expect(execMock).toHaveBeenCalledTimes(1);
            } finally {
                vi.useRealTimers();
            }
        });

        it("does not overwrite an existing annotation journal", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationFile = new TFile("test-批注.xopp", "folder/test-批注.xopp");
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile, annotationFile];
            pdfFile.parent = parentFolder;
            mockVault.getFileByPath.mockReturnValue(pdfFile);

            const execMock = vi.mocked(exec);
            execMock.mockClear();

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(execMock).not.toHaveBeenCalled();
        });

        it("does not create a journal when the annotated PDF output already exists", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotatedPdfFile = new TFile("test-批注.pdf", "folder/test-批注.pdf");
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile, annotatedPdfFile];
            pdfFile.parent = parentFolder;
            mockVault.getFileByPath.mockImplementation((path: string) => {
                if (path === pdfFile.path) return pdfFile;
                if (path === getAnnotatedPdfPath(pdfFile.path)) return annotatedPdfFile;
                return undefined;
            });
            vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

            const execMock = vi.mocked(exec);
            execMock.mockClear();
            execMock.mockImplementation(((command: string, callback?: (error: Error | null) => void) => {
                callback?.(null);
                return undefined;
            }) as unknown as typeof exec);

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(execMock).not.toHaveBeenCalled();
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
