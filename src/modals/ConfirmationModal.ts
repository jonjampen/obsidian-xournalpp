import { App, Modal } from "obsidian";

export default class ConfirmationModal extends Modal {
    onConfirm: () => Promise<void>;
    onReject: () => Promise<void>;

    constructor(app: App, onConfirm: () => Promise<void>, onReject: () => Promise<void>) { 
        super(app);
        this.onConfirm = onConfirm;
        this.onReject = onReject;
    }

    onOpen() {
        super.onOpen();
        const { contentEl } = this;

        this.modalEl.focus();
        this.modalEl.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                this.onReject();
                this.close();
            }
        });

        contentEl.createEl("h2", { text: "Enable Auto Export?" });
        contentEl.createEl("p", {
            text: "Enabling auto export might automatically overwrite any same-named files. Do you want to proceed?",
        });

        const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });

        const confirmButton = buttonContainer.createEl("button", { text: "Yes" });
        confirmButton.addEventListener("click", async () => {
            await this.onConfirm();
            this.close();
        });

        const cancelButton = buttonContainer.createEl("button", { text: "No" });
        cancelButton.addEventListener("click", () => {
            this.onReject();
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
