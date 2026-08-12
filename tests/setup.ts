import { vi } from "vitest";

const mockExec = vi.fn();

vi.mock("child_process", () => ({
    exec: mockExec,
    default: {
        exec: mockExec,
    },
}));
