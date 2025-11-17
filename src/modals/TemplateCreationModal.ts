import XoppPlugin from "main";
import { App, ButtonComponent, Modal, Notice, Setting } from "obsidian";

type TemplateBackgroundStyle =
	| "plain"
	| "lined"
	| "ruled"
	| "staves"
	| "graph"
	| "dotted"
	| "isodotted"
	| "isograph";

interface TemplateSpec {
	name: string;
	pageSizePreset:
		| "A3"
		| "A4"
		| "A5"
		| "US Letter"
		| "US Legal"
		| "16x9"
		| "4x3"
		| "Custom";
	customWidthMm?: number;
	customHeightMm?: number;
	orientation: "portrait" | "landscape";
	backgroundStyle: TemplateBackgroundStyle;
	backgroundColor: string;
	// spacingMm?: number;
	// marginMm?: number;
}

export default class TemplateCreationModal extends Modal {
	plugin: XoppPlugin;
	onCreated: (vaultPath: string) => void;

	constructor(
		app: App,
		plugin: XoppPlugin,
		onCreated: (vaultPath: string) => void
	) {
		super(app);
		this.plugin = plugin;
		this.onCreated = onCreated;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h3", { text: "Create Xournal++ template" });

		const spec: TemplateSpec = {
			name: "",
			pageSizePreset: "A4",
			orientation: "portrait",
			backgroundStyle: "plain",
			backgroundColor: "#ffffff",
			spacingMm: 8,
			marginMm: 20,
		};

		new Setting(contentEl)
			.setName("Template Name")
			.setDesc("Name of the new template file")
			.addText((text) =>
				text.onChange((value) => {
					spec.name = value.trim();
				})
			);

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
					.addOption("Isodotted", "Isometric dotted")
					.addOption("isograph", "Isometric graph")
					.onChange((value) => {
						spec.backgroundStyle =
							value as TemplateSpec["backgroundStyle"];
					});
			});

		new Setting(contentEl)
			.setName("Background Color")
			.setDesc("Hex color, e.g. #ffffff")
			.addText((text) =>
				text.setValue("#ffffff").onChange((value) => {
					spec.backgroundColor = value.trim();
				})
			);

		const buttonRow = contentEl.createDiv({
			cls: "xopp-template-button-row",
		});

		new ButtonComponent(buttonRow)
			.setButtonText("Create")
			.setCta()
			.onClick(async () => {
				try {
					if (!spec.name) {
						new Notice("Please enter a template name");
						return;
					}

					const folder =
						this.plugin.settings.templatesFolder?.trim() ||
						"XournalTemplates";

                        if (!this.plugin.settings.templatesFolder) {
						this.plugin.settings.templatesFolder = folder;
						await this.plugin.saveSettings();
					}

					const vaultPath = writeTemplateFile(
						this.app,
						folder,
						spec
					);
					new Notice(`Xournal++ template created: ${vaultPath}`);

					this.onCreated(vaultPath);
					this.close();
				} catch (e: any) {
					console.error(e);
					new Notice("Failed to create template: " + e.message);
				}
			});

		new ButtonComponent(buttonRow)
			.setButtonText("Cancel")
			.onClick(() => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

function writeTemplateFile(app: App, folder: any, spec: TemplateSpec) {
	throw new Error("Function not implemented.");
}
