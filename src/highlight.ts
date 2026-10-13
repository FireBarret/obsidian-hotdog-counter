import { RangeSetBuilder, StateEffect } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { CountOptions, findHotdogs } from './count';

/** Dispatch to an editor to recompute its highlights now. */
export const refreshHighlights = StateEffect.define<null>();

const mark = Decoration.mark({ class: 'hotdog-highlight' });

interface Source {
  enabled: () => boolean;
  options: () => CountOptions;
}

/** Highlights hotdogs in the editor view only; the note text is never changed. */
export function highlightExtension(source: Source) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;
      timer: number | undefined;

      constructor(view: EditorView) {
        this.compute(view);
      }

      update(update: ViewUpdate) {
        if (update.transactions.some(tr => tr.effects.some(e => e.is(refreshHighlights)))) {
          this.compute(update.view);
        } else if (update.docChanged && source.enabled()) {
          // Keep highlights attached while typing, then recount shortly after
          this.decorations = this.decorations.map(update.changes);
          window.clearTimeout(this.timer);
          const view = update.view;
          this.timer = window.setTimeout(() => {
            view.dispatch({ effects: refreshHighlights.of(null) });
          }, 400);
        }
      }

      compute(view: EditorView) {
        if (!source.enabled()) {
          this.decorations = Decoration.none;
          return;
        }
        const builder = new RangeSetBuilder<Decoration>();
        const spans = findHotdogs(view.state.doc.toString(), source.options())
          .flat()
          .sort((a, b) => a[0] - b[0]);
        for (const [from, to] of spans) builder.add(from, to, mark);
        this.decorations = builder.finish();
      }

      destroy() {
        window.clearTimeout(this.timer);
      }
    },
    { decorations: v => v.decorations },
  );
}
