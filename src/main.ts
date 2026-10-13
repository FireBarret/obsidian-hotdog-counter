import { Plugin, MarkdownView, Notice, debounce } from 'obsidian';
import { DEFAULT_SETTINGS, HotdogSettings, HotdogSettingTab } from './settings';

// Fuzzy "hotdog": allows spaces/dots/dashes between letters, o/a swaps,
// extra t's, a stray "w", and a skipped "o" (hotdog, hottodog, ho t dawg, h o t d o g, hawtdog)
const SEP = '[\\s._-]{0,3}';
const FUZZY = `h${SEP}[oa]w?${SEP}t+${SEP}o?${SEP}d${SEP}[oa]w?${SEP}g`;
const CASE_SENSITIVE = new RegExp(FUZZY, 'g');
const CASE_INSENSITIVE = new RegExp(FUZZY, 'gi');

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
    const saved = (await this.loadData()) as Partial<HotdogSettings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
