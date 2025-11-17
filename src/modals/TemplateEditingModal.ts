import XoppPlugin from "main";
import { App, ButtonComponent, Modal, Setting } from "obsidian";
import {
	parseTemplateFile,
	fetchTemplates,
} from "src/TemplateEditingModalManager";
import { TemplateSpec } from "./TemplateCreationModal";
import { createTemplate } from "src/TemplateCreationModalManager";

export default class TemplateEditingModal extends Modal {
	plugin: XoppPlugin;

	constructor(app: App, plugin: XoppPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h3", { text: "Edit Xournal++ templates" });

		new Setting(contentEl)
			.setName("Choose a template")
			.addDropdown(async (dropdown) => {
				const templates = await fetchTemplates(this.plugin);

				if (templates.length === 0) {
					dropdown.addOption("", "No templates found");
				} else {
					templates.forEach((template) => {
						dropdown.addOption(template.path, template.name);
					});
				}

                dropdown.setValue("");

				dropdown.onChange(async (value) => {
					await parseTemplateFile(this.plugin, value, () => { this.close()});
				});
			});
	}
}

export class ParsedTemplateEditing extends Modal {
	plugin: XoppPlugin;
	initialSpec: TemplateSpec;
    onFinished: () => void;

	constructor(app: App, plugin: XoppPlugin, templateSpec: TemplateSpec, onFinished: () => void) {
		super(app);
		this.plugin = plugin;
		this.initialSpec = templateSpec;
        this.onFinished = onFinished;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h3", {
			text: `Editing template: ${this.initialSpec.name}`,
		});

		const spec: TemplateSpec = { ...this.initialSpec };

		new Setting(contentEl).setName("Page Size").addDropdown((dropdown) => {
			dropdown
				.addOption("A3", "A3")
				.addOption("A4", "A4")
				.addOption("A5", "A5")
				.addOption("US Letter", "US Letter")
				.addOption("US Legal", "US Legal")
				.addOption("16x9", "16x9")
				.addOption("4x3", "4x3")
				.addOption("Custom", "Custom")
				.setValue(this.initialSpec.pageSizePreset)
				.onChange((value) => {
					spec.pageSizePreset =
						value as TemplateSpec["pageSizePreset"];
				});
		});

		new Setting(contentEl)
			.setName("Orientation")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("portrait", "Portrait")
					.addOption("landscape", "Landscape")
					.setValue(this.initialSpec.orientation)
					.onChange((value) => {
						spec.orientation = value as TemplateSpec["orientation"];
					});
			});

		new Setting(contentEl)
			.setName("Background Style")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("plain", "Plain")
					.addOption("lined", "Lined")
					.addOption("ruled", "Ruled")
					.addOption("staves", "Staves")
					.addOption("graph", "Graph")
					.addOption("dotted", "Dotted")
					.addOption("isodotted", "Isometric dotted")
					.addOption("isograph", "Isometric graph")
					.setValue(this.initialSpec.backgroundStyle)
					.onChange((value) => {
						spec.backgroundStyle =
							value as TemplateSpec["backgroundStyle"];
					});
			});

		new Setting(contentEl).setName("Background color").addText((text) => {
			text.setPlaceholder("#ffffffff")
				.setValue(spec.backgroundColor || "")
				.onChange((value) => {
					spec.backgroundColor = value.trim();
				});
		});

		const buttonRow = contentEl.createDiv({
			cls: "xopp-creation-editing-template-button-row",
		});

		new ButtonComponent(buttonRow)
			.setButtonText("Confirm Edits")
			.setCta()
			.onClick(async () => {
				await createTemplate(this.plugin, spec);
				this.close();
                this.onFinished();
			});

		new ButtonComponent(buttonRow)
			.setButtonText("Cancel")
			.onClick(() => this.close());

		this.modalEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();

				if (!e.shiftKey) {
					createTemplate(this.plugin, spec);
                    this.close();
                    this.onFinished();
				}
			}
		});
	}
}
