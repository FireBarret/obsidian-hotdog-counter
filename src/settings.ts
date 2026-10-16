import { App, PluginSettingTab, Setting } from 'obsidian';
import type HotdogPlugin from './main';

export interface HotdogSettings {
  caseSensitive: boolean;
  hiddenHotdogs: boolean;
  hiddenWindow: number;
  highlightColor: string;
}

export const DEFAULT_SETTINGS: HotdogSettings = {
  caseSensitive: false,
  hiddenHotdogs: true,
  hiddenWindow: 45,
  highlightColor: '#ffcc00'
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
          this.plugin.refreshEditor();
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
          this.plugin.refreshEditor();
        }));

    new Setting(containerEl)
      .setName('Hidden hotdog reach')
      .setDesc('How many characters a hidden hotdog can stretch over. Longer finds more, and also more by accident')
      .addSlider(slider => slider
        .setLimits(10, 200, 1)
        .setValue(this.plugin.settings.hiddenWindow)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.hiddenWindow = value;
          await this.plugin.saveSettings();
          this.plugin.updateCount();
          this.plugin.refreshEditor();
        }));

    new Setting(containerEl)
      .setName('Highlight color')
      .setDesc('Color used when you click the counter to highlight hotdogs')
      .addColorPicker(picker => picker
        .setValue(this.plugin.settings.highlightColor)
        .onChange(async (value) => {
          this.plugin.settings.highlightColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyColor();
        }));
  }
}
