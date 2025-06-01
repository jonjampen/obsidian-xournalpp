import { App, Modal } from "obsidian";

export default class ConfirmationModal extends Modal {
    onConfirm: () => Promise<void>;
    onReject: () => Promise<void>;
    private initialValue: boolean;
    private toggle: any;
    public confirmed: boolean = false;

    constructor(app: App, onConfirm: () => Promise<void>, onReject: () => Promise<void>, initialValue: boolean, toggle: any) {
        super(app);
        this.onConfirm = onConfirm;
        this.onReject = onReject;
        this.initialValue = initialValue;
        this.toggle = toggle
    }

    onOpen() {
        super.onOpen();
        const { contentEl } = this;

        contentEl.createEl("h2", { text: "Enable Auto Export?" });
        contentEl.createEl("p", {
            text: "Enabling auto export might automatically overwrite any same-named files. Do you want to proceed?",
        });

        const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });

        const confirmButton = buttonContainer.createEl("button", { text: "Yes" });
        confirmButton.addEventListener("click", async () => {
            this.confirmed = true;
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
        super.onClose();
        const { contentEl } = this;
        contentEl.empty();
    }
}