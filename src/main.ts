import { App, Plugin, PluginSettingTab, Setting, MarkdownView, Notice } from 'obsidian';

interface HotdogSettings {
  caseSensitive: boolean;
}

const DEFAULT_SETTINGS: HotdogSettings = {
  caseSensitive: false
};

export default class HotdogPlugin extends Plugin {
  settings: HotdogSettings;
  statusBarItem: HTMLElement;

  async onload() {
    await this.loadSettings();

    // Status bar shows live count
    this.statusBarItem = this.addStatusBarItem();
    this.updateCount();

    // Command: show count in a notice popup
    this.addCommand({
      id: 'count-hotdogs',
      name: 'Count hotdogs in current note',
      callback: () => this.showHotdogCount(),
    });

    // Re-count whenever the file changes
    this.registerEvent(
      this.app.workspace.on('editor-change', () => this.updateCount())
    );
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => this.updateCount())
    );

    // Settings tab
    this.addSettingTab(new HotdogSettingTab(this.app, this));
  }

  countHotdogs(text: string): number {
    const pattern = this.settings.caseSensitive ? /hotdog/g : /hotdog/gi;
    return (text.match(pattern) || []).length;
  }

  updateCount() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      const text = view.getViewData();
      const count = this.countHotdogs(text);
      const emoji = count > 0 ? '🌭' : '📄';
      this.statusBarItem.setText(`${emoji} ${count} hotdog${count !== 1 ? 's' : ''}`);
    } else {
      this.statusBarItem.setText('');
    }
  }

  showHotdogCount() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice('No active note!');
      return;
    }
    const count = this.countHotdogs(view.getViewData());
    new Notice(`🌭 This note contains ${count} hotdog${count !== 1 ? 's' : ''}!`);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class HotdogSettingTab extends PluginSettingTab {
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