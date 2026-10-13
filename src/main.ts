import { Plugin, MarkdownView, Notice, debounce } from 'obsidian';
import { DEFAULT_SETTINGS, HotdogSettings, HotdogSettingTab } from './settings';

const CASE_SENSITIVE = /hotdog/g;
const CASE_INSENSITIVE = /hotdog/gi;

export default class HotdogPlugin extends Plugin {
  settings: HotdogSettings;
  statusBarItem: HTMLElement;

  // Typing bursts collapse into one count shortly after the last keystroke
  private scheduleUpdate = debounce(() => this.updateCount(), 400, true);

  async onload() {
    await this.loadSettings();

    this.statusBarItem = this.addStatusBarItem();
    this.updateCount();

    this.addCommand({
      id: 'count-hotdogs',
      name: 'Count hotdogs in current note',
      callback: () => this.showHotdogCount(),
    });

    this.registerEvent(this.app.workspace.on('editor-change', this.scheduleUpdate));
    this.registerEvent(this.app.workspace.on('active-leaf-change', this.scheduleUpdate));

    this.addSettingTab(new HotdogSettingTab(this.app, this));
  }

  onunload() {
    this.scheduleUpdate.cancel();
  }

  countHotdogs(text: string): number {
    const pattern = this.settings.caseSensitive ? CASE_SENSITIVE : CASE_INSENSITIVE;
    pattern.lastIndex = 0;
    let count = 0;
    while (pattern.test(text)) count++;
    return count;
  }

  private getText(): string | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view ? view.editor.getValue() : null;
  }

  updateCount() {
    const text = this.getText();
    if (text === null) {
      this.statusBarItem.setText('');
      return;
    }
    const count = this.countHotdogs(text);
    const emoji = count > 0 ? '🌭' : '📄';
    this.statusBarItem.setText(`${emoji} ${count} hotdog${count !== 1 ? 's' : ''}`);
  }

  showHotdogCount() {
    const text = this.getText();
    if (text === null) {
      new Notice('No active note!');
      return;
    }
    const count = this.countHotdogs(text);
    new Notice(`🌭 This note contains ${count} hotdog${count !== 1 ? 's' : ''}!`);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
