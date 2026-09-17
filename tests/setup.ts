import { vi } from "vitest";

const mockExec = vi.fn();
const mockSpawn = vi.fn();

vi.mock("child_process", () => ({
    exec: mockExec,
    spawn: mockSpawn,
    default: {
        exec: mockExec,
        spawn: mockSpawn,
    },
}));
