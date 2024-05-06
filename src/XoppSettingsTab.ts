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
            .setDesc("Automatically export Xournal++ files to PDF upon modification")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.autoExport)
                    .onChange(async (value) => {
                        console.log(value);
                        this.plugin.settings.autoExport = value;
                        await this.plugin.saveSettings();
                        console.log("saved")
                    })
            });
    }
  
}
