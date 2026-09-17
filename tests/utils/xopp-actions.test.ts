import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import {
    createAnnotatedXoppFromPdf,
    findCorrespondingXoppToPdf,
    getAnnotatedPdfPath,
    getAnnotatedXoppPath,
    openXournalppFile,
    getTemplateFilePath,
    createTemplate,
    renameXoppFile,
    deleteXoppAndPdf,
} from "src/utils/xopp-actions";
import XoppPlugin from "src/main";
import { spawn } from "child_process";
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
        mockVault.adapter.exists = vi.fn().mockResolvedValue(false);
        vi.mocked(spawn).mockReset();

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

            expect(getAnnotatedXoppPath(sourcePath)).toBe("数学/第一章.函数 极限-annotated.xopp");
            expect(getAnnotatedPdfPath(sourcePath)).toBe("数学/第一章.函数 极限-annotated.pdf");
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
        it("does not start a duplicate Attach process while creation is in flight", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationPath = getAnnotatedXoppPath(pdfFile.path);
            const annotationFile = new TFile(annotationPath.split("/").pop()!, annotationPath);
            let created = false;
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile];
            pdfFile.parent = parentFolder;
            mockVault.getFileByPath.mockImplementation((path: string) => {
                if (path === pdfFile.path) return pdfFile;
                if (path === annotationPath && created) return annotationFile;
                return undefined;
            });
            vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

            let releaseAttach: (() => void) | undefined;
            const attachExit = new Promise<void>((resolve) => {
                releaseAttach = resolve;
            });
            const spawnMock = vi.mocked(spawn);
            spawnMock.mockImplementation(((command: string, args: string[]) => {
                const child = new EventEmitter();
                if (args.includes("--attach-mode")) {
                    created = true;
                    void attachExit.then(() => child.emit("close", 0));
                } else {
                    queueMicrotask(() => child.emit("close", 0));
                }
                return child as never;
            }) as unknown as typeof spawn);

            const first = createAnnotatedXoppFromPdf(pdfFile, mockPlugin);
            await new Promise((resolve) => window.setTimeout(resolve, 0));
            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(spawnMock).toHaveBeenCalledTimes(1);
            releaseAttach?.();
            await first;
            expect(spawnMock).toHaveBeenCalledTimes(2);
        });

        it("launches Xournal++ with argv and shell disabled", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationPath = getAnnotatedXoppPath(pdfFile.path);
            const annotationFile = new TFile(annotationPath.split("/").pop()!, annotationPath);
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

            const spawnMock = vi.mocked(spawn);
            spawnMock.mockImplementation(((command: string, args: string[]) => {
                if (args.includes("--attach-mode")) {
                    created = true;
                    parentFolder.children.push(annotationFile);
                }
                const child = new EventEmitter();
                queueMicrotask(() => child.emit("close", 0));
                return child as never;
            }) as unknown as typeof spawn);

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(spawnMock).toHaveBeenNthCalledWith(
                1,
                "xournalpp",
                ["--attach-mode", `--save=/mocked/vault/path/${annotationPath}`, `/mocked/vault/path/${pdfFile.path}`],
                { shell: false }
            );
            expect(spawnMock).toHaveBeenNthCalledWith(2, "xournalpp", [`/mocked/vault/path/${annotationPath}`], {
                shell: false,
            });
        });

        it("does not launch when the annotation output already exists on disk", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationPath = getAnnotatedXoppPath(pdfFile.path);
            const annotationFile = new TFile(annotationPath.split("/").pop()!, annotationPath);
            const launched = false;
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile];
            pdfFile.parent = parentFolder;
            mockVault.getFileByPath.mockImplementation((path: string) => {
                if (path === pdfFile.path) return pdfFile;
                if (path === annotationPath && launched) return annotationFile;
                return undefined;
            });
            mockVault.adapter.exists.mockImplementation(
                async (path: string) => path === getAnnotatedXoppPath(pdfFile.path)
            );
            vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(spawn).not.toHaveBeenCalled();
        });

        it("creates and opens a same-folder attached journal with the annotation suffix", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationPath = getAnnotatedXoppPath(pdfFile.path);
            const annotationFile = new TFile(annotationPath.split("/").pop()!, annotationPath);
            let created = false;

            mockVault.getFileByPath.mockImplementation((path: string) => {
                if (path === pdfFile.path) return pdfFile;
                if (path === annotationFile.path && created) return annotationFile;
                return undefined;
            });
            vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

            const spawnMock = vi.mocked(spawn);
            spawnMock.mockImplementation(((command: string, args: string[]) => {
                if (args.includes("--attach-mode")) created = true;
                const child = new EventEmitter();
                queueMicrotask(() => child.emit("close", 0));
                return child as never;
            }) as unknown as typeof spawn);

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(spawnMock).toHaveBeenNthCalledWith(
                1,
                "xournalpp",
                ["--attach-mode", `--save=/mocked/vault/path/${annotationPath}`, "/mocked/vault/path/folder/test.pdf"],
                { shell: false }
            );
            expect(spawnMock).toHaveBeenNthCalledWith(
                2,
                "xournalpp",
                ["/mocked/vault/path/folder/test-annotated.xopp"],
                { shell: false }
            );
            expect(spawnMock).toHaveBeenCalledTimes(2);
        });

        it("waits for the attach process before opening the journal", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationPath = getAnnotatedXoppPath(pdfFile.path);
            const annotationFile = new TFile(annotationPath.split("/").pop()!, annotationPath);
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

            let releaseAttach: (() => void) | undefined;
            const attachExit = new Promise<void>((resolve) => {
                releaseAttach = resolve;
            });
            const spawnMock = vi.mocked(spawn);
            spawnMock.mockImplementation(((command: string, args: string[]) => {
                const child = new EventEmitter();
                if (args.includes("--attach-mode")) {
                    created = true;
                    void attachExit.then(() => child.emit("close", 0));
                } else {
                    queueMicrotask(() => child.emit("close", 0));
                }
                return child as never;
            }) as unknown as typeof spawn);

            const operation = createAnnotatedXoppFromPdf(pdfFile, mockPlugin);
            await new Promise((resolve) => window.setTimeout(resolve, 0));

            expect(spawnMock).toHaveBeenCalledTimes(1);
            releaseAttach?.();
            await operation;
            expect(spawnMock).toHaveBeenCalledTimes(2);
        });

        it("does not overwrite an existing annotation journal", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotationFile = new TFile("test-批注.xopp", "folder/test-批注.xopp");
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile, annotationFile];
            pdfFile.parent = parentFolder;
            mockVault.getFileByPath.mockReturnValue(pdfFile);

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(spawn).not.toHaveBeenCalled();
        });

        it("does not create a journal when the annotated PDF output already exists", async () => {
            const pdfFile = new TFile("test.pdf", "folder/test.pdf");
            const annotatedPdfPath = getAnnotatedPdfPath(pdfFile.path);
            const annotatedPdfFile = new TFile("test-annotated.pdf", annotatedPdfPath);
            const parentFolder = new TFolder("folder", "folder");
            parentFolder.children = [pdfFile, annotatedPdfFile];
            pdfFile.parent = parentFolder;
            mockVault.getFileByPath.mockImplementation((path: string) => {
                if (path === pdfFile.path) return pdfFile;
                if (path === getAnnotatedPdfPath(pdfFile.path)) return annotatedPdfFile;
                return undefined;
            });
            vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

            await createAnnotatedXoppFromPdf(pdfFile, mockPlugin);

            expect(spawn).not.toHaveBeenCalled();
        });
    });

    it("reports a non-zero Xournal++ open exit", async () => {
        const xoppFile = new TFile("test.xopp", "folder/test.xopp");
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.mocked(spawn).mockImplementation(((_command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 1));
            return child as never;
        }) as unknown as typeof spawn);

        await openXournalppFile(xoppFile, mockPlugin);
        await Promise.resolve();

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Error opening file in Xournal++"));
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
