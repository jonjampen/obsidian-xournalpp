import XoppPlugin from "main";
import { App, Setting, PluginSettingTab } from "obsidian";

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
                toggle
                    .setValue(this.plugin.settings.autoExport)
                    .onChange(async (value) => {
                        this.plugin.settings.autoExport = value;
                        await this.plugin.saveSettings();
                    })
            });

        new Setting(containerEl)
            .setName("Xournal++ installation path")
            .setDesc("The path where Xournal++ is installed (leave empty for system default).")
            .addText((toggle) => {
                toggle
                    .setValue(this.plugin.settings.xournalppPath)
                    .onChange(async (value) => {
                        this.plugin.settings.xournalppPath = value;
                        await this.plugin.saveSettings();
                    })
            });
    }
  
}
