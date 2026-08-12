import { vi } from "vitest";

export class TFile {
    path: string;
    name: string;
    basename: string;
    extension: string;
    stat: { mtime: number; size: number; ctime: number };
    parent: TFolder | null;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.basename = name.replace(/\.[^/.]+$/, "");
        this.extension = name.split(".").pop() || "";
        this.stat = { mtime: Date.now(), size: 0, ctime: Date.now() };
        this.parent = null;
    }
}

export class TFolder {
    name: string;
    path: string;
    children: Array<TFile | TFolder>;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.children = [];
    }
}

export class Plugin {
    app: any;
    manifest: any;
    constructor(app: any, manifest: any) {
        this.app = app;
        this.manifest = manifest;
    }
    onload() {}
    onunload() {}
    registerEvent() {}
    addSettingTab() {}
    addCommand() {}
}

export class Notice {
    message: string;
    duration?: number;
    constructor(message: string, duration?: number) {
        this.message = message;
        this.duration = duration;
    }
}

export const Platform = {
    isWin: false,
    isMacOS: false,
    isLinux: true,
    isMobile: false,
};

export class FileSystemAdapter {
    getBasePath() {
        return "/mocked/vault/path";
    }
}
