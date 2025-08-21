import XoppPlugin from "main";
import { App, Setting, PluginSettingTab, addIcon, getIcon } from "obsidian";
import ConfirmationModal from "./modals/ConfirmationModal";
import { exportAllXoppToPDF } from "src/xopp2pdf";
import parseFileName from "./fileNameParser";
import { shorthands } from "./shorthands";
import { ShorthandHelpModal } from "./modals/ShorthandHelpModal";

export class XoppSettingsTab extends PluginSettingTab {
    plugin: XoppPlugin;

    constructor(app: App, plugin: XoppPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Auto export Xournal++ files")
            .setDesc("Automatically export Xournal++ files to PDF upon modification.")
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.autoExport).onChange(async (value) => {
                    if (value) {
                        const initialValue = this.plugin.settings.autoExport;
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
            .setDesc("The path where Xournal++ is installed (leave empty for system default).")
            .addText((toggle) => {
                toggle.setValue(this.plugin.settings.xournalppPath).onChange(async (value) => {
                    this.plugin.settings.xournalppPath = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Xournal++ template path")
            .setDesc(
                "The relative path of the template for any new Xournal++ file (leave empty to use the default template)."
            )
            .addText((toggle) => {
                toggle
                    .setValue(this.plugin.settings.templatePath)
                    .setPlaceholder("e.g. templates/template.xopp")
                    .onChange(async (value) => {
                        this.plugin.settings.templatePath = value;
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

        // Default Name
        let defaultNameSetting = new Setting(containerEl)
            .setName("Default name for new Xournal++ files")
            .addText((toggle) => {
                toggle
                    .setValue(this.plugin.settings.defaultNewFileName)
                    .setPlaceholder("e.g. ${MM}-${cursor}-note")
                    .onChange(async (value) => {
                        this.plugin.settings.defaultNewFileName = value;
                        await this.plugin.saveSettings();

                        descEl.setText(
                            `The default name for new Xournal++ files. Example: "${
                                parseFileName(value, this.plugin, true).text
                            }"`
                        );
                    });
            });

        const descEl = defaultNameSetting.setDesc(
            `The default name for new Xournal++ files. Example: "${
                parseFileName(this.plugin.settings.defaultNewFileName, this.plugin, true).text
            }"`
        ).descEl;

        const titleEl = defaultNameSetting.nameEl;
        const helpIcon = titleEl.createEl("span");
        helpIcon.appendChild(getIcon("help-circle")!);
        helpIcon.addClass("xopp-help-icon");
        helpIcon.onclick = () => {
            new ShorthandHelpModal(this.app, shorthands).open();
        };
    }
}
