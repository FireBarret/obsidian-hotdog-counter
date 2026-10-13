import { App, PluginSettingTab, Setting } from 'obsidian';
import type HotdogPlugin from './main';

export interface HotdogSettings {
  caseSensitive: boolean;
  hiddenHotdogs: boolean;
}

export const DEFAULT_SETTINGS: HotdogSettings = {
  caseSensitive: false,
  hiddenHotdogs: true
};

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
      .setDesc('Only count lowercase spellings')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.caseSensitive)
        .onChange(async (value) => {
          this.plugin.settings.caseSensitive = value;
          await this.plugin.saveSettings();
          this.plugin.updateCount();
        }));

    new Setting(containerEl)
      .setName('Hidden hotdogs')
      .setDesc('Count hotdogs spelled out by the letters of nearby words, like "how many times have you done paragliding"')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.hiddenHotdogs)
        .onChange(async (value) => {
          this.plugin.settings.hiddenHotdogs = value;
          await this.plugin.saveSettings();
          this.plugin.updateCount();
        }));
  }
}
