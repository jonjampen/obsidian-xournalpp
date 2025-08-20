import { App, Modal } from "obsidian";

export class ShorthandHelpModal extends Modal {
    shorthands: { title: string; shorthands: { shorthand: string; example: string; description: string }[] }[];

    constructor(
        app: App,
        shorthands: { title: string; shorthands: { shorthand: string; example: string; description: string }[] }[]
    ) {
        super(app);
        this.shorthands = shorthands;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h2", { text: "Supported Shorthands" });

        this.shorthands.forEach((group) => {
            contentEl.createEl("h3", { text: group.title });
            const table = contentEl.createEl("table", { cls: "shorthand-table" });

            const headerRow = table.createEl("tr");
            ["Shorthand", "Example", "Description"].forEach((title) => {
                headerRow.createEl("th", { text: title });
            });

            group.shorthands.forEach((s) => {
                const row = table.createEl("tr");
                row.createEl("td", { text: s.shorthand });
                row.createEl("td", { text: s.example });
                row.createEl("td", { text: s.description });
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
