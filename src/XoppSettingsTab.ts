import XoppPlugin from "main";
import { App, Setting, PluginSettingTab, addIcon, getIcon, TFile } from "obsidian";
import ConfirmationModal from "./modals/ConfirmationModal";
import { exportAllXoppToPDF } from "src/xopp2pdf";
import parseFileName from "./fileNameParser";
import { newFilePlaceholders } from "./newFilePlaceholders";
import { NewFilePlacholderHelpModal } from "./modals/NewFilePlacholderHelpModal";
import TemplateCreationModal from "src/modals/TemplateCreationModal";
import TemplateEditingModal from "./modals/TemplateEditingModal";

export class XoppSettingsTab extends PluginSettingTab {
	plugin: XoppPlugin;
  
	constructor(app: App, plugin: XoppPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

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
				const templatesFolder =
					this.plugin.settings.templatesFolder?.trim();
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
			.setName("Create a new Xournal++ template")
			.setDesc(
				"Create a new Xournal++ template file in the templates folder."
			)
			.addButton((button) => {
				button
					.setButtonText("Create Template")
					.setCta()
					.onClick(async () => {
						new TemplateCreationModal(
							this.app,
							this.plugin,
							async (createdPath) => {
								if (!this.plugin.settings.defaultTemplatePath) {
									this.plugin.settings.defaultTemplatePath =
										createdPath;
								}

								await this.plugin.saveSettings();
								this.display();
							}
						).open();
					});
			});

		new Setting(containerEl)
			.setName("Edit existing Xournal++ templates")
			.setDesc("A GUI to edit or delete existing Xournal++ templates.")
			.addButton((button) => {
				button
					.setButtonText("Manage Templates")
					.setCta()
					.onClick(async () => {
						new TemplateEditingModal(this.app, this.plugin).open();
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
  
    // Default Name
    let defaultNameDesc =
        "The default name for new Xournal++ files. Use placeholders `${}` to insert dynamic values. Preview: ";
    let defaultNameSetting = new Setting(containerEl)
        .setName("Default name for new Xournal++ files")
        .addText((toggle) => {
            toggle
                .setValue(this.plugin.settings.defaultNewFileName)
                .setPlaceholder("e.g. ${MM}-${cursor}-note")
                .onChange(async (value) => {
                    this.plugin.settings.defaultNewFileName = value;
                    await this.plugin.saveSettings();

                    descEl.setText(defaultNameDesc + parseFileName(value, this.plugin, true).text);
                });
        });

    const descEl = defaultNameSetting.setDesc(
        defaultNameDesc + parseFileName(this.plugin.settings.defaultNewFileName, this.plugin, true).text
    ).descEl;

    const titleEl = defaultNameSetting.nameEl;
    const helpIcon = titleEl.createEl("span");
    helpIcon.appendChild(getIcon("help-circle")!);
    helpIcon.addClass("xopp-help-icon");
    helpIcon.onclick = () => {
        new NewFilePlacholderHelpModal(this.app, newFilePlaceholders).open();
    };
  }
}
