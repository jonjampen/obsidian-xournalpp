import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportXoppToPDF, exportAllXoppToPDF } from "src/utils/xopp-to-pdf";
import { checkXoppSetup } from "src/core/environment-checks";
import { exec } from "child_process";
import * as obsidian from "obsidian";
import XoppPlugin from "src/main";

vi.mock("src/core/environment-checks", () => ({
    checkXoppSetup: vi.fn(),
}));

function createMockFile(name: string, path: string): obsidian.TFile {
    const file = new obsidian.TFile();
    file.name = name;
    file.path = path;
    file.basename = name.replace(/\.[^/.]+$/, "");
    file.extension = name.split(".").pop() || "";
    file.stat = { mtime: Date.now(), size: 0, ctime: Date.now() };
    return file;
}

describe("xopp-to-pdf", () => {
    let mockPlugin: XoppPlugin;
    let mockAdapter: obsidian.FileSystemAdapter & {
        exists: any;
        remove: any;
        readBinary: any;
        writeBinary: any;
    };
    let mockVault: any;
    let noticeSpy: any;

    beforeEach(() => {
        mockAdapter = new obsidian.FileSystemAdapter() as any;
        mockAdapter.exists = vi.fn().mockResolvedValue(false);
        mockAdapter.rename = vi.fn().mockResolvedValue(undefined);
        mockAdapter.remove = vi.fn().mockResolvedValue(undefined);
        mockAdapter.readBinary = vi.fn().mockResolvedValue(new ArrayBuffer(0));
        mockAdapter.writeBinary = vi.fn().mockResolvedValue(undefined);

        mockVault = {
            adapter: mockAdapter,
            getFiles: vi.fn(),
            getFileByPath: vi.fn().mockReturnValue(null),
            modifyBinary: vi.fn().mockResolvedValue(undefined),
            createBinary: vi.fn().mockResolvedValue(undefined),
        };

        mockPlugin = {
            app: {
                vault: mockVault,
            },
        } as unknown as XoppPlugin;

        vi.mocked(checkXoppSetup).mockReset();
        vi.mocked(exec).mockReset();

        // Spy on the Notice class constructor from our obsidian mock
        noticeSpy = vi.spyOn(obsidian, "Notice");
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should abort if the vault adapter is not FileSystemAdapter", async () => {
        mockVault.adapter = {} as any;

        await exportXoppToPDF(mockPlugin, ["file1.xopp"]);
        expect(checkXoppSetup).not.toHaveBeenCalled();
    });

    it("should show notice and abort if checkXoppSetup returns error", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue(null);

        await exportXoppToPDF(mockPlugin, ["file1.xopp"]);
        expect(noticeSpy).toHaveBeenCalledWith(expect.stringContaining("Xournal++ path not setup correctly"), 10000);
    });

    it("should execute conversion command with base paths and create binary file", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(null, "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        await exportXoppToPDF(mockPlugin, ["notes/lecture.xopp"]);

        expect(exec).toHaveBeenCalledWith(
            'xournalpp --create-pdf="/mocked/vault/path/notes/lecture.pdf.tmp" "/mocked/vault/path/notes/lecture.xopp"',
            expect.any(Function)
        );
        expect(mockAdapter.readBinary).toHaveBeenCalledWith("notes/lecture.pdf.tmp");
        expect(mockVault.createBinary).toHaveBeenCalledWith("notes/lecture.pdf", expect.any(ArrayBuffer));
        expect(mockAdapter.remove).toHaveBeenCalledWith("notes/lecture.pdf.tmp");
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });

    it("should process conversions concurrently", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        const runningExecs: string[] = [];
        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                runningExecs.push(cmd);
                callback(null, "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        const filePaths = Array.from({ length: 12 }, (_, i) => `note${i}.xopp`);

        await exportXoppToPDF(mockPlugin, filePaths);

        expect(exec).toHaveBeenCalledTimes(12);
        expect(runningExecs.length).toBe(12);
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });

    it("should handle conversion errors gracefully and notify user", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(new Error("Command failed"), "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        await exportXoppToPDF(mockPlugin, ["note.xopp"]);

        expect(console.error).toHaveBeenCalled();
        expect(noticeSpy).toHaveBeenCalledWith(
            "Error converting some Xournal++ files to PDF. Check the console for details."
        );
    });

    it("should filter vault files for XOPP and export all of them", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(null, "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        const files = [
            createMockFile("note1.xopp", "note1.xopp"),
            createMockFile("note2.pdf", "note2.pdf"),
            createMockFile("note3.xopp", "folder/note3.xopp"),
        ];
        mockVault.getFiles.mockReturnValue(files);

        await exportAllXoppToPDF(mockPlugin);

        expect(exec).toHaveBeenCalledTimes(2);
        expect(exec).toHaveBeenCalledWith(
            'xournalpp --create-pdf="/mocked/vault/path/note1.pdf.tmp" "/mocked/vault/path/note1.xopp"',
            expect.any(Function)
        );
        expect(exec).toHaveBeenCalledWith(
            'xournalpp --create-pdf="/mocked/vault/path/folder/note3.pdf.tmp" "/mocked/vault/path/folder/note3.xopp"',
            expect.any(Function)
        );
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });

    it("should update open target PDF in-place via modifyBinary if TFile exists in vault", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");
        const existingFile = createMockFile("lecture.pdf", "notes/lecture.pdf");
        mockVault.getFileByPath.mockReturnValue(existingFile);

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(null, "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        await exportXoppToPDF(mockPlugin, ["notes/lecture.xopp"]);

        expect(mockVault.getFileByPath).toHaveBeenCalledWith("notes/lecture.pdf");
        expect(mockVault.modifyBinary).toHaveBeenCalledWith(existingFile, expect.any(ArrayBuffer));
        expect(mockAdapter.remove).toHaveBeenCalledWith("notes/lecture.pdf.tmp");
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });

    it("should write binary file in-place if target file exists on disk but not in vault cache", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");
        mockVault.getFileByPath.mockReturnValue(null);
        mockAdapter.exists.mockResolvedValue(true);

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(null, "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        await exportXoppToPDF(mockPlugin, ["notes/lecture.xopp"]);

        expect(mockAdapter.writeBinary).toHaveBeenCalledWith("notes/lecture.pdf", expect.any(ArrayBuffer));
        expect(mockAdapter.remove).toHaveBeenCalledWith("notes/lecture.pdf.tmp");
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });

    it("should remove temp file and report error if modifyBinary fails", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");
        const existingFile = createMockFile("note.pdf", "note.pdf");
        mockVault.getFileByPath.mockReturnValue(existingFile);
        mockVault.modifyBinary.mockRejectedValue(new Error("Modify failed"));

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(null, "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        await exportXoppToPDF(mockPlugin, ["note.xopp"]);

        expect(mockAdapter.remove).toHaveBeenCalledWith("note.pdf.tmp");
        expect(console.error).toHaveBeenCalled();
        expect(noticeSpy).toHaveBeenCalledWith(
            "Error converting some Xournal++ files to PDF. Check the console for details."
        );
    });
});
