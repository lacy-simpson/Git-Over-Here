# Git Over Here

`Git Over Here` is a self-contained training application for the GPS AI Practice Lab. It teaches Git fundamentals through a guided workshop experience with lesson navigation, timers, progress tracking, knowledge checks, and a final combined HTML file for hosting.

## What This Project Contains

This project is maintained in modular source files during development, then rebuilt into a single hosted output file.

### Source files you edit

- `main_index.html`: main HTML structure and lesson content
- `styles.css`: all app styling
- `head-init.js`: small startup script that runs in the document `<head>`
- `app.js`: application behavior and interactivity

### Generated file

- `Rise_Project/index.html`: the combined single-file output used for hosting

## How To Work On The App

1. Edit the modular source files: `main_index.html`, `styles.css`, `head-init.js`, and `app.js`.
2. If you want to preview the modular version locally, open `main_index.html` in a browser.
3. When you are ready to refresh the hosted single-file output, run the rebuild script.

## Rebuild The Combined File

From the project root, run:

```bash
bash scripts/update_git_over_here_course.sh
```

This rebuilds `Rise_Project/index.html` by inlining the HTML, CSS, and JavaScript from the modular source files.

If you are not already in the repo folder, run:

```bash
cd "/Users/lsimpson/Dev Projects/AI UpSkilling Plan/Applications/gps-ai-practice-lab/Git-Over-Here"
bash scripts/update_git_over_here_course.sh
```

You can also run the Python script directly:

```bash
python3 scripts/sync_git_over_here_course.py
```

## Scripts

### `scripts/update_git_over_here_course.sh`

This is the simplest command to use day to day. It changes into the project root and runs the Python rebuild script for you.

### `scripts/sync_git_over_here_course.py`

This script:

- treats `main_index.html`, `styles.css`, `head-init.js`, and `app.js` as the source of truth
- rebuilds `Rise_Project/index.html`
- supports `--bootstrap` if you ever need to regenerate the modular files from the single-file HTML
- includes a small migration step for older legacy filenames

Example:

```bash
python3 scripts/sync_git_over_here_course.py --bootstrap
```

## Recommended Workflow

1. Make changes in the modular files.
2. Run `bash scripts/update_git_over_here_course.sh`.
3. Open or refresh `Rise_Project/index.html`.
4. Confirm the changes look right before publishing or copying the combined file into the host application.

## Notes

- Do not make long-term edits directly in `Rise_Project/index.html` unless you intentionally want them overwritten later.
- The rebuild step should be run any time you change `main_index.html`, `styles.css`, `head-init.js`, or `app.js`.
- The project also includes image assets in `Rise_Project/resource_icons/` used by the course content.
