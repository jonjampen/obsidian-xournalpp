import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import { exportXoppToPDF, exportAllXoppToPDF } from "src/utils/xopp-to-pdf";
import { checkXoppSetup } from "src/core/environment-checks";
import { spawn } from "child_process";
import * as obsidian from "obsidian";
import XoppPlugin from "src/main";

vi.mock("src/core/environment-checks", () => ({
    checkXoppSetup: vi.fn(),
}));

vi.mock("fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("fs/promises")>();
    return {
        ...actual,
        rename: vi.fn().mockResolvedValue(undefined),
        unlink: vi.fn().mockResolvedValue(undefined),
    };
});

describe("xopp-to-pdf", () => {
    let mockPlugin: XoppPlugin;
    let mockAdapter: obsidian.FileSystemAdapter;
    let mockVault: any;
    let noticeSpy: any;

    beforeEach(() => {
        mockAdapter = new obsidian.FileSystemAdapter();
        mockVault = {
            adapter: mockAdapter,
            getFiles: vi.fn(),
        };

        mockPlugin = {
            app: {
                vault: mockVault,
            },
        } as unknown as XoppPlugin;

        vi.mocked(checkXoppSetup).mockReset();
        vi.mocked(spawn).mockReset();

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
        vi.mocked(checkXoppSetup).mockResolvedValue("error");

        await exportXoppToPDF(mockPlugin, ["file1.xopp"]);
        expect(noticeSpy).toHaveBeenCalledWith(expect.stringContaining("Xournal++ path not setup correctly"), 10000);
    });

    it("should execute conversion command with base paths", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        vi.mocked(spawn).mockImplementation(((_command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 0));
            return child as never;
        }) as unknown as typeof spawn);

        await exportXoppToPDF(mockPlugin, ["notes/lecture.xopp"]);

        expect(spawn).toHaveBeenCalledWith(
            "xournalpp",
            ["--create-pdf=/mocked/vault/path/notes/lecture.pdf.tmp", "/mocked/vault/path/notes/lecture.xopp"],
            { shell: false }
        );
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });

    it("should process conversions concurrently", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        const runningSpawns: Array<[string, string[]]> = [];
        vi.mocked(spawn).mockImplementation(((command: string, args: string[]) => {
            runningSpawns.push([command, args]);
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 0));
            return child as never;
        }) as unknown as typeof spawn);

        const filePaths = Array.from({ length: 12 }, (_, i) => `note${i}.xopp`);

        await exportXoppToPDF(mockPlugin, filePaths);

        expect(spawn).toHaveBeenCalledTimes(12);
        expect(runningSpawns.length).toBe(12);
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });

    it("should handle conversion errors gracefully and notify user", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        vi.mocked(spawn).mockImplementation(((_command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 1));
            return child as never;
        }) as unknown as typeof spawn);

        await exportXoppToPDF(mockPlugin, ["note.xopp"]);

        expect(console.error).toHaveBeenCalled();
        expect(noticeSpy).toHaveBeenCalledWith(
            "Error converting some Xournal++ files to PDF. Check the console for details."
        );
    });

    it("should filter vault files for XOPP and export all of them", async () => {
        vi.mocked(checkXoppSetup).mockResolvedValue("xournalpp");

        vi.mocked(spawn).mockImplementation(((_command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 0));
            return child as never;
        }) as unknown as typeof spawn);

        const files = [
            new obsidian.TFile("note1.xopp", "note1.xopp"),
            new obsidian.TFile("note2.pdf", "note2.pdf"),
            new obsidian.TFile("note3.xopp", "folder/note3.xopp"),
        ];
        mockVault.getFiles.mockReturnValue(files);

        await exportAllXoppToPDF(mockPlugin);

        expect(spawn).toHaveBeenCalledTimes(2);
        expect(spawn).toHaveBeenCalledWith(
            "xournalpp",
            ["--create-pdf=/mocked/vault/path/note1.pdf.tmp", "/mocked/vault/path/note1.xopp"],
            { shell: false }
        );
        expect(spawn).toHaveBeenCalledWith(
            "xournalpp",
            ["--create-pdf=/mocked/vault/path/folder/note3.pdf.tmp", "/mocked/vault/path/folder/note3.xopp"],
            { shell: false }
        );
        expect(noticeSpy).toHaveBeenCalledWith("Exported all Xournal++ notes successfully.");
    });
});
