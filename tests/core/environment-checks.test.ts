import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkXoppSetup } from "src/core/environment-checks";
import XoppPlugin from "src/main";
import { Platform } from "obsidian";
import { exec } from "child_process";

describe("checkXoppSetup", () => {
    let mockPlugin: XoppPlugin;

    beforeEach(() => {
        mockPlugin = {
            settings: {
                xournalppPath: "",
            },
        } as unknown as XoppPlugin;

        vi.mocked(exec).mockReset();
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

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(null, "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("/custom/xournalpp");
        expect(exec).toHaveBeenCalledWith("/custom/xournalpp --version", expect.any(Function));
    });

    it("should fall back to default alias path if user-defined path fails but alias succeeds", async () => {
        mockPlugin.settings.xournalppPath = "/custom/invalid-path";

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                if (cmd.includes("/custom/invalid-path")) {
                    callback(new Error("Not found"), "", "");
                } else {
                    callback(null, "", "");
                }
                return {} as ReturnType<typeof exec>;
            }
        );

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("xournalpp");
        expect(exec).toHaveBeenCalledTimes(2);
    });

    it("should check Windows path if user-path and alias fail, and platform is Windows", async () => {
        Platform.isWin = true;
        Platform.isMacOS = false;

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                if (cmd.includes("Program Files")) {
                    callback(null, "", "");
                } else {
                    callback(new Error("Command failed"), "", "");
                }
                return {} as ReturnType<typeof exec>;
            }
        );

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe('"c:/Program Files/Xournal++/bin/xournalpp.exe"');
    });

    it("should check macOS path if user-path and alias fail, and platform is macOS", async () => {
        Platform.isWin = false;
        Platform.isMacOS = true;

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                if (cmd.includes("Applications/Xournal++")) {
                    callback(null, "", "");
                } else {
                    callback(new Error("Command failed"), "", "");
                }
                return {} as ReturnType<typeof exec>;
            }
        );

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe('"/Applications/Xournal++.app/Contents/MacOS/xournalpp"');
    });

    it("should return 'error' if all paths fail to resolve", async () => {
        Platform.isWin = false;
        Platform.isMacOS = false;

        vi.mocked(exec).mockImplementation(
            (cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
                callback(new Error("Command failed"), "", "");
                return {} as ReturnType<typeof exec>;
            }
        );

        const result = await checkXoppSetup(mockPlugin);
        expect(result).toBe("error");
    });
});
