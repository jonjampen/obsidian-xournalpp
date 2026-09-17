import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkXoppSetup } from "src/core/environment-checks";
import XoppPlugin from "src/main";
import { Platform } from "obsidian";
import { EventEmitter } from "events";
import { spawn } from "child_process";

describe("checkXoppSetup", () => {
    let mockPlugin: XoppPlugin;

    beforeEach(() => {
        mockPlugin = {
            settings: {
                xournalppPath: "",
            },
        } as unknown as XoppPlugin;

        vi.mocked(spawn).mockReset();
        Platform.isWin = false;
        Platform.isMacOS = false;

        // Spy on console.error to suppress expected stderr logs during testing
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return user-defined path if command execution succeeds", async () => {
        mockPlugin.settings.xournalppPath = "/custom/xournalpp";

        vi.mocked(spawn).mockImplementation(((_command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 0));
            return child as never;
        }) as unknown as typeof spawn);

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("/custom/xournalpp");
        expect(spawn).toHaveBeenCalledWith("/custom/xournalpp", ["--version"], { shell: false });
    });

    it("should fall back to default alias path if user-defined path fails but alias succeeds", async () => {
        mockPlugin.settings.xournalppPath = "/custom/invalid-path";

        vi.mocked(spawn).mockImplementation(((command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", command.includes("invalid") ? 1 : 0));
            return child as never;
        }) as unknown as typeof spawn);

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("xournalpp");
        expect(spawn).toHaveBeenCalledTimes(2);
    });

    it("should check Windows path if user-path and alias fail, and platform is Windows", async () => {
        Platform.isWin = true;
        Platform.isMacOS = false;

        vi.mocked(spawn).mockImplementation(((command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", command.includes("Program Files") ? 0 : 1));
            return child as never;
        }) as unknown as typeof spawn);

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("c:/Program Files/Xournal++/bin/xournalpp.exe");
    });

    it("should check macOS path if user-path and alias fail, and platform is macOS", async () => {
        Platform.isWin = false;
        Platform.isMacOS = true;

        vi.mocked(spawn).mockImplementation(((command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", command.includes("Applications/Xournal++") ? 0 : 1));
            return child as never;
        }) as unknown as typeof spawn);

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("/Applications/Xournal++.app/Contents/MacOS/xournalpp");
    });

    it("should return 'error' if all paths fail to resolve", async () => {
        Platform.isWin = false;
        Platform.isMacOS = false;

        vi.mocked(spawn).mockImplementation(((_command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 1));
            return child as never;
        }) as unknown as typeof spawn);

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("error");
    });

    it("parses a quoted executable path without invoking a shell", async () => {
        mockPlugin.settings.xournalppPath = '"C:/Program Files/Xournal++/bin/xournalpp.exe"';
        vi.mocked(spawn).mockImplementation(((_command: string, _args: string[]) => {
            const child = new EventEmitter();
            queueMicrotask(() => child.emit("close", 0));
            return child as never;
        }) as unknown as typeof spawn);

        await checkXoppSetup(mockPlugin);

        expect(spawn).toHaveBeenCalledWith("C:/Program Files/Xournal++/bin/xournalpp.exe", ["--version"], {
            shell: false,
        });
    });
});
