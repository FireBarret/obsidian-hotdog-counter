# 🌭 Hotdog Counter

Have you ever wondered how many *succulent* meat sacs you have hidden throughout your text?

No? Well here's a plugin I made that counts how many glizzies you've got in your .mds

## What counts as a hotdog

- The classics: `hotdog`, `Hotdog`, `HOTDOG`
- The sloppy ones: `hottodoggu`, `ho t dawg`, `h o t d o g`, `hawtdog`
- The cousins: `glizzy`, `wiener`, `weenie`, `frankfurter`, `bratwurst`, `sausage`, `meat sac`
- The sneaky ones: letters of nearby words that spell it out, like **HO**w many **T**imes have you **DO**ne para**G**liding? Works in lowercase too (`how many times have you done paragliding`). Capitals alone count at any distance. Turn this off with **Hidden hotdogs** in settings if it gets too keen.

## Using it

- The status bar shows the hotdog count for the note you're in, live.
- Click the counter to highlight every hotdog in the note. Click again to turn it off. The note itself is never changed, and it shows in editing view (not reading view).
- Run **Count hotdogs in current note** from the command palette for a popup.
- **Settings → Hotdog Counter** has: **Case sensitive** (sloppy spellings lowercase only), **Hidden hotdogs** and **Hidden hotdog reach** (how many characters a hidden hotdog may stretch over, default 45), and **Highlight color**.

## Install

1. Download `hotdog-counter.zip` from the [latest release](../../releases/latest).
2. Unzip it into `<YourVault>/.obsidian/plugins/` so you end up with a `hotdog-counter` folder.
3. Reload Obsidian, then enable **Hotdog Counter** in **Settings → Community plugins**.
