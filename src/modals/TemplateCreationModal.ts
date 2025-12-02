import XoppPlugin from "main";
import { App, ButtonComponent, FuzzySuggestModal, Modal, Setting, TFile, TextComponent } from "obsidian";
import { createTemplate } from "src/TemplateCreationModalManager";
import { TemplateSpec } from "../types";

export default class TemplateCreationModal extends Modal {
	plugin: XoppPlugin;
	onCreated: (vaultPath: string) => void;

	constructor(
		app: App,
		plugin: XoppPlugin,
		onCreated: (vaultPath: string) => void
	) {
		super(app);
		this.app = app;
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
			gzip: false,
			pdfPage: 1,
		};

		const doCreate = async () => {
			try {
				const vaultPath = await createTemplate(this.plugin, spec);
				this.onCreated(vaultPath);
				this.close();
			} catch (e) {
				console.error(e);
			}
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
					refreshBackgroundSectionVisibility();
				});
		});

		let customPageDimensions: Setting;

		customPageDimensions = new Setting(contentEl)
			.setName("Custom Page Dimensions (in mm)")
			.addText((text) =>
				text
					.setPlaceholder("Width")
					.setValue(
						spec.customWidthMm ? String(spec.customWidthMm) : ""
					)
					.onChange((value) => {
						spec.customWidthMm = Number(value.trim());
					})
			)
			.addText((text) =>
				text
					.setPlaceholder("Height")
					.setValue(
						spec.customHeightMm ? String(spec.customHeightMm) : ""
					)
					.onChange((value) => {
						spec.customHeightMm = Number(value.trim());
					})
			);

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

		let backgroundColorSetting: Setting;
		let pdfSourceSetting: Setting;
		let pdfAbsolutePathSetting: Setting;
		let pdfVaultFileSetting: Setting;
		let pdfVaultFileText: TextComponent;
		let useAbsolutePath = true;

		const refreshBackgroundSectionVisibility = () => {
			const isPdf = spec.backgroundStyle === "pdf";
			const customDimensions = spec.pageSizePreset === "Custom";

			if (backgroundColorSetting) {
				backgroundColorSetting.settingEl.toggle(!isPdf);
			}
			if (pdfSourceSetting) {
				pdfSourceSetting.settingEl.toggle(isPdf);
			}
			if (pdfAbsolutePathSetting) {
				pdfAbsolutePathSetting.settingEl.toggle(isPdf && useAbsolutePath);
			}
			if (pdfVaultFileSetting) {
				pdfVaultFileSetting.settingEl.toggle(isPdf && !useAbsolutePath);
			}
			if (customPageDimensions) {
				customPageDimensions.settingEl.toggle(customDimensions);
			}
		};

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
					.addOption("pdf", "PDF")
					.setValue(spec.backgroundStyle)
					.onChange((value) => {
						spec.backgroundStyle =
							value as TemplateSpec["backgroundStyle"];
						refreshBackgroundSectionVisibility();
					});
			});

		backgroundColorSetting = new Setting(contentEl)
			.setName("Background Color")
			.setDesc("Hex color, e.g. #ffffff")
			.addText((text) =>
				text.setValue(spec.backgroundColor).onChange((value) => {
					spec.backgroundColor = value.trim();
				})
			);

		pdfSourceSetting = new Setting(contentEl)
			.setName("PDF Source")
			.setDesc("Choose between an absolute path or a vault file")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("absolute", "Absolute Path")
					.addOption("vault", "Vault File")
					.setValue(useAbsolutePath ? "absolute" : "vault")
					.onChange((value) => {
						useAbsolutePath = value === "absolute";
						refreshBackgroundSectionVisibility();
					})
			);

		pdfAbsolutePathSetting = new Setting(contentEl)
			.setName("Absolute Path")
			.setDesc("Enter the absolute path to the PDF file")
			.addText((text) =>
				text
					.setPlaceholder("/path/to/file.pdf")
					.setValue(spec.pdfPathAbs ?? "")
					.onChange((value) => {
						const v = value.trim();
						spec.pdfPathAbs = v || undefined;
					})
			);

		pdfVaultFileSetting = new Setting(contentEl)
			.setName("Vault File")
			.setDesc("Choose a PDF file from the vault")
			.addText((text) => {
				pdfVaultFileText = text;
				text
					.setPlaceholder("path/to/file.pdf in vault")
					.setValue(spec.pdfPathAbs ?? "")
					.onChange((value) => {
						const v = value.trim();
						spec.pdfPathAbs = v || undefined;
					});
			})
			.addButton((button) =>
				button
					.setButtonText("Choose File")
					.onClick(async () => {
						const file = await openFuzzySuggestionModal(this.app);
						if (file) {
							spec.pdfPathAbs = file.path;
							if (pdfVaultFileText) {
								pdfVaultFileText.setValue(file.path);
							}
						}
					})
			);

		new Setting(contentEl)
			.setName("Compress as gzipped .xopp")
			.setDesc("Whether to gzip compress the template file")
			.addToggle((toggle) =>
				toggle.setValue(!!spec.gzip).onChange((value) => {
					spec.gzip = value;
				})
			);

		refreshBackgroundSectionVisibility();

		const buttonRow = contentEl.createDiv({
			cls: "xopp-creation-editing-template-button-row",
		});

		new ButtonComponent(buttonRow)
			.setButtonText("Create")
			.setCta()
			.onClick(async () => {
				await doCreate();
				this.close();
			});

		new ButtonComponent(buttonRow)
			.setButtonText("Cancel")
			.onClick(() => this.close());

		this.modalEl.addEventListener("keydown", async (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();

				if (!e.shiftKey) {
					await doCreate();
					this.close();
				}
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

function openFuzzySuggestionModal(app: App): Promise<TFile | null> {
	return new Promise((resolve) => {
		let resolved = false;

		class PdfFileSuggestModal extends FuzzySuggestModal<TFile> {
			private pdfFiles: TFile[];

			constructor(app: App) {
				super(app);
				this.pdfFiles = app.vault
					.getFiles()
					.filter((f) => f.extension.toLowerCase() === "pdf");
				this.setPlaceholder("Search PDF files...");
			}

			getItems(): TFile[] {
				return this.pdfFiles;
			}

			getItemText(file: TFile): string {
				return file.path;
			}

			onChooseItem(file: TFile): void {
				if (!resolved) {
					resolved = true;
					resolve(file);
				}
			}

			onClose(): void {
				if (!resolved) {
					resolved = true;
					resolve(null);
				}
				super.onClose();
			}
		}

		new PdfFileSuggestModal(app).open();
	});
}
