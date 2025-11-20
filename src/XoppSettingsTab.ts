import XoppPlugin from "main";
import { App, Setting, PluginSettingTab, TFile } from "obsidian";
import ConfirmationModal from "./modals/ConfirmationModal";
import { exportAllXoppToPDF } from "src/xopp2pdf";

export class XoppSettingsTab extends PluginSettingTab {
	plugin: XoppPlugin;

	constructor(app: App, plugin: XoppPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const templatesFolder = this.plugin.settings.templatesFolder?.trim();
		let templateFiles: TFile[] = [];
		if (templatesFolder) {
			templateFiles = this.app.vault
				.getFiles()
				.filter(
					(f: TFile) =>
						f.path.startsWith(templatesFolder + "/") &&
						f.extension === "xopp"
				);
		}

		new Setting(containerEl)
			.setName("Auto export Xournal++ files")
			.setDesc(
				"Automatically export Xournal++ files to PDF upon modification."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoExport)
					.onChange(async (value) => {
						if (value) {
							const initialValue =
								this.plugin.settings.autoExport;
							const confirmationModal = new ConfirmationModal(
								this.app,
								async () => {
									this.plugin.settings.autoExport = true;
									await this.plugin.saveSettings();
									toggle.setValue(true);

									exportAllXoppToPDF(this.plugin);
								},
								async () => {
									this.plugin.settings.autoExport = false;
									await this.plugin.saveSettings();
									toggle.setValue(false);
								},
								initialValue,
								toggle
							);
							confirmationModal.onClose = () => {
								if (!confirmationModal.confirmed) {
									toggle.setValue(false);
								}
							};
							confirmationModal.open();
						} else {
							this.plugin.settings.autoExport = false;
							await this.plugin.saveSettings();
							toggle.setValue(false);
						}
					});
			});

		new Setting(containerEl)
			.setName("Xournal++ installation path")
			.setDesc(
				"The path where Xournal++ is installed (leave empty for system default)."
			)
			.addText((toggle) => {
				toggle
					.setValue(this.plugin.settings.xournalppPath)
					.onChange(async (value) => {
						this.plugin.settings.xournalppPath = value;
						await this.plugin.saveSettings();
					});
			});

		// new Setting(containerEl)
		//     .setName("Xournal++ template path")
		//     .setDesc(
		//         "The relative path of the template for any new Xournal++ file (leave empty to use the default template)."
		//     )
		//     .addText((toggle) => {
		//         toggle
		//             .setValue(this.plugin.settings.templatePath)
		//             .setPlaceholder("e.g. templates/template.xopp")
		//             .onChange(async (value) => {
		//                 this.plugin.settings.templatePath = value;
		//                 await this.plugin.saveSettings();
		//             });
		//     });

		new Setting(containerEl)
			.setName("Xournal++ templates folder")
			.setDesc(
				"Relative path to the folder that contains your Xournal++ .xopp templates."
			)
			.addText((text) => {
				text.setValue(this.plugin.settings.templatesFolder)
					.setPlaceholder("e.g. templates/xournalpp")
					.onChange(async (value) => {
						this.plugin.settings.templatesFolder = value;
						await this.plugin.saveSettings();
					});

				text.inputEl.addEventListener("blur", () => {
					this.display();
				});

				text.inputEl.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						text.inputEl.blur();
					}
				});
			});

		new Setting(containerEl)
			.setName("Default Xournal++ template")
			.setDesc(
				"The default template to use when creating new Xournal++ files from the templates folder."
			)
			.addDropdown((dropdown) => {
				if (templateFiles.length === 0) {
					dropdown.addOption("", "No templates found");
				} else {
					templateFiles.forEach((file) =>
						dropdown.addOption(file.path, file.path)
					);
				}
				dropdown
					.setValue(this.plugin.settings.defaultTemplatePath || "")
					.onChange(async (value) => {
						this.plugin.settings.defaultTemplatePath = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Default path for new Xournal++ files")
			.setDesc(
				"The relative path for new Xournal++ files. This folder will be used unless a full path is specified during file creation (leave empty to use root folder)."
			)
			.addText((toggle) => {
				toggle
					.setValue(this.plugin.settings.defaultNewFilePath)
					.setPlaceholder("e.g. Notes")
					.onChange(async (value) => {
						this.plugin.settings.defaultNewFilePath = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
