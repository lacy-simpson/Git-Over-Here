#!/usr/bin/env python3
"""Split and rebuild the Git Over Here course files.

Usage:
  python3 scripts/sync_git_over_here_course.py

What it does:
  - If the modular source files do not exist yet, it bootstraps them from the
    current single-file `index.html`.
  - It then rebuilds `index.html` by inlining the modular HTML, CSS, and
    JavaScript sources.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "Rise_Project"

FINAL_HTML = OUTPUT_DIR / "index.html"
SOURCE_HTML = ROOT / "git_over_here.html"
SOURCE_CSS = ROOT / "styles.css"
SOURCE_BOOT_JS = ROOT / "head-init.js"
SOURCE_APP_JS = ROOT / "app.js"
FINAL_ICONS_DIR = OUTPUT_DIR / "resource_icons"
SOURCE_ICON_PREFIX = "./Rise_Project/resource_icons/"
FINAL_ICON_PREFIX = "./resource_icons/"

LEGACY_FILES = {
    ROOT / "git_over_here_.html": SOURCE_HTML,
    ROOT / "git_over_here_course.source.html": SOURCE_HTML,
    ROOT / "git_over_here_course.css": SOURCE_CSS,
    ROOT / "git_over_here_course.boot.js": SOURCE_BOOT_JS,
    ROOT / "git_over_here_course.js": SOURCE_APP_JS,
}
LEGACY_FINAL_HTMLS = [
    ROOT / "index.html",
    ROOT / "git_over_here_course.html",
]
LEGACY_ICON_DIRS = [
    ROOT / "icons",
    OUTPUT_DIR / "icons",
]


def script_src_pattern(path: Path) -> re.Pattern[str]:
    return re.compile(
        rf'<script\s+src=["\'](?:\./)?{re.escape(path.name)}["\']\s*>\s*</script>',
        re.IGNORECASE,
    )


def css_link_pattern(path: Path) -> re.Pattern[str]:
    return re.compile(
        rf'<link\s+rel=["\']stylesheet["\']\s+href=["\'](?:\./)?{re.escape(path.name)}["\']\s*/?>',
        re.IGNORECASE,
    )


BOOT_SCRIPT_TAG_PATTERN = script_src_pattern(SOURCE_BOOT_JS)
APP_SCRIPT_TAG_PATTERN = script_src_pattern(SOURCE_APP_JS)
CSS_LINK_TAG_PATTERN = css_link_pattern(SOURCE_CSS)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bootstrap modular course files and rebuild the single-file HTML."
    )
    parser.add_argument(
        "--bootstrap",
        action="store_true",
        help="Overwrite the modular source files using the current single-file HTML first.",
    )
    return parser.parse_args()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def migrate_legacy_final_html() -> None:
    ensure_output_dir()

    if FINAL_HTML.exists():
        return

    for legacy_path in LEGACY_FINAL_HTMLS:
        if not legacy_path.exists():
            continue
        shutil.move(str(legacy_path), str(FINAL_HTML))
        print(
            f"Moved {legacy_path.relative_to(ROOT)} -> {FINAL_HTML.relative_to(ROOT)}"
        )
        return


def migrate_legacy_sources() -> None:
    for legacy_path, new_path in LEGACY_FILES.items():
        if new_path.exists() or not legacy_path.exists():
            continue
        legacy_path.rename(new_path)
        print(f"Renamed {legacy_path.name} -> {new_path.name}")


def migrate_legacy_icon_dir() -> None:
    ensure_output_dir()

    if FINAL_ICONS_DIR.exists():
        return

    for legacy_dir in LEGACY_ICON_DIRS:
        if not legacy_dir.exists():
            continue
        shutil.move(str(legacy_dir), str(FINAL_ICONS_DIR))
        print(
            f"Moved {legacy_dir.relative_to(ROOT)} -> {FINAL_ICONS_DIR.relative_to(ROOT)}"
        )
        return


def normalize_icon_paths_for_source_html(text: str) -> str:
    updated = text
    updated = updated.replace("./icons/", SOURCE_ICON_PREFIX)
    updated = updated.replace("./resource_icons/", SOURCE_ICON_PREFIX)
    updated = updated.replace(FINAL_ICON_PREFIX, SOURCE_ICON_PREFIX)
    return updated


def normalize_icon_paths_for_final_html(text: str) -> str:
    updated = text
    updated = updated.replace(SOURCE_ICON_PREFIX, FINAL_ICON_PREFIX)
    updated = updated.replace("./icons/", FINAL_ICON_PREFIX)
    return updated


def normalize_source_html_asset_references() -> None:
    if not SOURCE_HTML.exists():
        return

    contents = read_text(SOURCE_HTML)
    updated = normalize_icon_paths_for_source_html(contents)

    for legacy_path, new_path in LEGACY_FILES.items():
        updated = updated.replace(f'./{legacy_path.name}', f'./{new_path.name}')

    if updated != contents:
        write_text(SOURCE_HTML, updated)
        print(f"Updated asset references in {SOURCE_HTML.name}")


def extract_between(text: str, start_marker: str, end_marker: str, start_at: int = 0) -> tuple[str, int, int]:
    start = text.find(start_marker, start_at)
    if start == -1:
        raise ValueError(f"Could not find start marker: {start_marker}")

    content_start = text.find(">", start)
    if content_start == -1:
        raise ValueError(f"Could not find end of start marker: {start_marker}")
    content_start += 1

    end = text.find(end_marker, content_start)
    if end == -1:
        raise ValueError(f"Could not find end marker: {end_marker}")

    return text[content_start:end], start, end + len(end_marker)


def bootstrap_sources_from_final() -> None:
    if not FINAL_HTML.exists():
        raise FileNotFoundError(f"Missing source file to bootstrap from: {FINAL_HTML}")

    contents = read_text(FINAL_HTML)

    boot_js, boot_start, boot_end = extract_between(contents, "<script>", "</script>")
    css, style_start, style_end = extract_between(contents, "<style>", "</style>", boot_end)

    body_open = contents.find("<body>", style_end)
    if body_open == -1:
        raise ValueError("Could not find <body> tag.")
    body_content_start = body_open + len("<body>")

    app_script_start = contents.rfind("<script>")
    app_script_end = contents.rfind("</script>")
    if app_script_start == -1 or app_script_end == -1 or app_script_start <= body_content_start:
        raise ValueError("Could not find the final app <script> block.")

    app_js = contents[app_script_start + len("<script>") : app_script_end]

    body_close = contents.find("</body>", app_script_end)
    if body_close == -1:
        raise ValueError("Could not find </body> tag.")

    head_prefix = contents[:boot_start]
    head_middle = contents[boot_end:style_start]
    body_markup = contents[body_content_start:app_script_start]
    html_tail = contents[body_close:]

    source_html = (
        head_prefix
        + f'<script src="./{SOURCE_BOOT_JS.name}"></script>\n'
        + head_middle.lstrip("\n")
        + f'<link rel="stylesheet" href="./{SOURCE_CSS.name}">\n'
        + "</head>\n<body>\n"
        + normalize_icon_paths_for_source_html(body_markup.lstrip("\n"))
        + f'\n<script src="./{SOURCE_APP_JS.name}"></script>\n'
        + html_tail
    )

    write_text(SOURCE_HTML, source_html)
    write_text(SOURCE_CSS, css.strip() + "\n")
    write_text(SOURCE_BOOT_JS, boot_js.strip() + "\n")
    write_text(SOURCE_APP_JS, app_js.strip() + "\n")


def validate_sources_exist() -> None:
    missing = [
        path.name
        for path in (SOURCE_HTML, SOURCE_CSS, SOURCE_BOOT_JS, SOURCE_APP_JS)
        if not path.exists()
    ]
    if missing:
        raise FileNotFoundError(
            "Missing modular source files: " + ", ".join(missing)
        )


def inline_source_assets(source_html: str, css: str, boot_js: str, app_js: str) -> str:
    built = source_html

    built, boot_count = BOOT_SCRIPT_TAG_PATTERN.subn(
        "<script>\n" + boot_js.rstrip() + "\n</script>",
        built,
        count=1,
    )
    built, css_count = CSS_LINK_TAG_PATTERN.subn(
        "<style>\n" + css.rstrip() + "\n</style>",
        built,
        count=1,
    )
    built, app_count = APP_SCRIPT_TAG_PATTERN.subn(
        "<script>\n" + app_js.rstrip() + "\n</script>",
        built,
        count=1,
    )

    if boot_count != 1 or css_count != 1 or app_count != 1:
        raise ValueError(
            f"Could not find all asset tags in {SOURCE_HTML.name}. "
            "Expected one boot script tag, one stylesheet link, and one app script tag."
        )

    return built


def build_final_html() -> None:
    ensure_output_dir()
    validate_sources_exist()
    built = inline_source_assets(
        normalize_icon_paths_for_final_html(read_text(SOURCE_HTML)),
        read_text(SOURCE_CSS),
        read_text(SOURCE_BOOT_JS),
        read_text(SOURCE_APP_JS),
    )
    write_text(FINAL_HTML, built)


def main() -> int:
    args = parse_args()
    migrate_legacy_final_html()
    migrate_legacy_icon_dir()
    migrate_legacy_sources()
    normalize_source_html_asset_references()

    should_bootstrap = args.bootstrap or not all(
        path.exists() for path in (SOURCE_HTML, SOURCE_CSS, SOURCE_BOOT_JS, SOURCE_APP_JS)
    )

    if should_bootstrap:
        bootstrap_sources_from_final()
        print("Bootstrapped modular source files.")

    build_final_html()
    print(f"Rebuilt {FINAL_HTML.relative_to(ROOT)} from modular source files.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover - small utility script
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1)
