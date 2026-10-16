import { Plugin, MarkdownView, Notice, debounce } from 'obsidian';
import type { EditorView } from '@codemirror/view';
import { CountOptions, countHotdogs } from './count';
import { highlightExtension, refreshHighlights } from './highlight';
import { DEFAULT_SETTINGS, HotdogSettings, HotdogSettingTab } from './settings';

export default class HotdogPlugin extends Plugin {
  settings: HotdogSettings;
  statusBarItem: HTMLElement;
  private highlighting = false;

  // Typing bursts collapse into one count shortly after the last keystroke
  private scheduleUpdate = debounce(() => this.updateCount(), 400, true);

  async onload() {
    await this.loadSettings();
    this.applyColor();

    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.addClass('hotdog-status');
    this.statusBarItem.setAttribute('aria-label', 'Click to highlight hotdogs');
    this.registerDomEvent(this.statusBarItem, 'click', () => this.toggleHighlight());
    this.updateCount();

    this.registerEditorExtension(highlightExtension({
      enabled: () => this.highlighting,
      options: () => this.options(),
    }));

    this.addCommand({
      id: 'count-hotdogs',
      name: 'Count hotdogs in current note',
      callback: () => this.showHotdogCount(),
    });

    this.addCommand({
      id: 'toggle-hotdog-highlight',
      name: 'Toggle hotdog highlighting',
      callback: () => this.toggleHighlight(),
    });

    this.registerEvent(this.app.workspace.on('editor-change', this.scheduleUpdate));
    this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
      this.scheduleUpdate();
      this.refreshEditor();
    }));

    this.addSettingTab(new HotdogSettingTab(this.app, this));
  }

  onunload() {
    this.scheduleUpdate.cancel();
    document.body.style.removeProperty('--hotdog-highlight');
  }

  options(): CountOptions {
    return {
      caseSensitive: this.settings.caseSensitive,
      hidden: this.settings.hiddenHotdogs,
      window: this.settings.hiddenWindow,
    };
  }

  applyColor() {
    document.body.style.setProperty('--hotdog-highlight', this.settings.highlightColor);
  }

  /** Recompute highlights in the active editor (after a toggle or a setting change). */
  refreshEditor() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const cm = (view?.editor as unknown as { cm?: EditorView } | undefined)?.cm;
    cm?.dispatch({ effects: refreshHighlights.of(null) });
  }

  toggleHighlight() {
    this.highlighting = !this.highlighting;
    this.statusBarItem.toggleClass('is-highlighting', this.highlighting);
    this.refreshEditor();
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
    const count = countHotdogs(text, this.options());
    const emoji = count > 0 ? '🌭' : '📄';
    this.statusBarItem.setText(`${emoji} ${count} hotdog${count !== 1 ? 's' : ''}`);
  }

  showHotdogCount() {
    const text = this.getText();
    if (text === null) {
      new Notice('No active note!');
      return;
    }
    const count = countHotdogs(text, this.options());
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
