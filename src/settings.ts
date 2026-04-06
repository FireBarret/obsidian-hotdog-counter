import { App, PluginSettingTab, Setting } from 'obsidian';
import HotdogPlugin from './main';

export class HotdogSettingTab extends PluginSettingTab {
  plugin: HotdogPlugin;

  constructor(app: App, plugin: HotdogPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Case sensitive')
      .setDesc('Count "Hotdog" and "HOTDOG" separately from "hotdog"')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.caseSensitive)
        .onChange(async (value) => {
          this.plugin.settings.caseSensitive = value;
          await this.plugin.saveSettings();
          this.plugin.updateCount();
        }));
  }
}