# Git Over Here

`Git Over Here` is a self-contained training application for the GPS AI Practice Lab. It teaches Git fundamentals through a guided workshop experience with lesson navigation, timers, progress tracking, knowledge checks, and a final combined HTML file for hosting.

## What This Project Contains

This project is maintained in modular source files during development, then rebuilt into a single hosted output file.

### Source files you edit

- `main_shell.html`: the main app shell, shared page structure, and non-lesson markup
- `lessons/01-intro.html` through `lessons/08-recap.html`: one source HTML file per lesson
- `styles.css`: all app styling
- `head-init.js`: small startup script that runs in the document `<head>`
- `app.js`: application behavior and interactivity

### Generated file

- `Rise_Project/index.html`: the combined single-file output used for hosting

## How To Work On The App

1. Edit the lesson you own inside the `lessons/` folder, or edit shared files like `main_shell.html`, `styles.css`, `head-init.js`, and `app.js` when needed.
2. Open a terminal and change into the project root:

```bash
cd "/Users/lsimpson/Dev Projects/AI UpSkilling Plan/Applications/gps-ai-practice-lab/Git-Over-Here"
```

3. Start a small local server from that folder:

```bash
python3 -m http.server 8000
```

4. Keep that terminal window running, then open `http://localhost:8000/main_shell.html` in your browser.
5. When you are ready to update the hosted single-file output, run the rebuild script.

## Rebuild The Combined File

From the project root, run:

```bash
bash scripts/update_git_over_here_course.sh
```

This script rebuilds `Rise_Project/index.html` by inlining the HTML, CSS, and JavaScript from the modular source files.

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

- treats `main_shell.html`, `lessons/*.html`, `styles.css`, `head-init.js`, and `app.js` as the source of truth
- rebuilds `Rise_Project/index.html`
- supports `--bootstrap` if you ever need to regenerate the modular files from the single-file HTML
- includes a small migration step for older legacy filenames

Example:

```bash
python3 scripts/sync_git_over_here_course.py --bootstrap
```

## Recommended Workflow

1. Make changes in the lesson file you own under `lessons/`, or update shared files when necessary.
2. In a terminal, change into the project root if you are not already there:

```bash
cd "/Users/lsimpson/Dev Projects/AI UpSkilling Plan/Applications/gps-ai-practice-lab/Git-Over-Here"
```

3. Start a local server if needed:

```bash
python3 -m http.server 8000
```

4. Open or refresh `http://localhost:8000/main_shell.html`.
5. When you want to refresh the hosted deliverable, run `bash scripts/update_git_over_here_course.sh`.
6. Confirm the changes look right before publishing or copying the combined file into the host application.

## Notes

- Do not make long-term edits directly in `Rise_Project/index.html` unless you intentionally want them overwritten later.
- `main_shell.html` is the local preview entry point. When served from the project root, it loads lesson content from `lessons/*.html` at runtime.
- If you stop the Python server, `main_shell.html` will no longer load lesson content correctly until you start the server again.
- The rebuild step should be run any time you change files in `lessons/`, `main_shell.html`, `styles.css`, `head-init.js`, or `app.js`.
- The project also includes image assets in `Rise_Project/resource_icons/` used by the course content.
