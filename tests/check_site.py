#!/usr/bin/env python3
"""Static checks for the Elegant Bath preview. No network writes."""
from __future__ import annotations

import hashlib
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html",
    "about.html",
    "products.html",
    "portfolio.html",
    "design.html",
    "contact.html",
]
HASHES = {
    "assets/ig/riobel-brass-faucet.jpg": "9df7bfec932cf5d622210f739d493b053f671a9d1dbcc8286286e2cdad302484",
    "assets/ig/luxury-fixture-detail.jpg": "6d654e4485b814524fee65761d97251f7c1e510b18dadc7dc11a73dcd13678e9",
    "assets/ig/custom-bath-inspiration.jpg": "93cc12ee1b4adf97f102402cd43e7096d750eac71c0f3482254b1a7d81e3c9f9",
    "assets/ig/langley-custom-home.jpg": "4b54e66c7b9f1d29b083eba3d6fce4b914d25a21a64941c26cbbdce429221bf8",
    "assets/ig/master-ensuite-screenshot-crop.png": "b695b14ec7863d608fbaca4f41c1c8837cfd5f19432b95776dd669799e68ad96",
}
POSTS = [
    "https://www.instagram.com/elegantbath_/p/DYTHq0PGs2h/",
    "https://www.instagram.com/elegantbath_/p/DXkBo6IGsBE/",
    "https://www.instagram.com/elegantbath_/reel/DUr136nmKfK/",
    "https://www.instagram.com/elegantbath_/p/DUZLY3Qkm4T/",
    "https://www.instagram.com/elegantbath_/p/DUKX2aMEXmc/",
    "https://www.instagram.com/elegantbath_/p/DUBRB1QlOq1/",
    "https://www.instagram.com/elegantbath_/reel/DNbt8r7yYpF/",
    "https://www.instagram.com/elegantbath_/p/DKVL2rVBq6g/",
]
BANNED = re.compile(
    r"we (built|installed)|our installation|unsplash|playfair|font-awesome|cdn.tailwindcss",
    re.I,
)


class Refs(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hrefs: list[str] = []
        self.srcs: list[str] = []
        self.h1 = 0
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "a" and data.get("href"):
            self.hrefs.append(data["href"])
        if tag in {"img", "script", "link"}:
            ref = data.get("src") or data.get("href")
            if ref:
                self.srcs.append(ref)
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def local_target(url: str, page: Path) -> Path | None:
    if url.startswith(("http://", "https://", "mailto:", "tel:", "#")):
        return None
    path = url.split("#", 1)[0].split("?", 1)[0]
    if not path:
        return None
    return (page.parent / path).resolve()


def main() -> int:
    failures: list[str] = []
    titles: list[str] = []
    blob = []
    for name in PAGES:
        page = ROOT / name
        if not page.is_file():
            failures.append(f"missing {name}")
            continue
        text = page.read_text(encoding="utf-8")
        blob.append(text)
        parser = Refs()
        parser.feed(text)
        titles.append(parser.title.strip())
        if parser.h1 != 1:
            failures.append(f"{name} has {parser.h1} h1")
        if "noindex" not in text:
            failures.append(f"{name} missing noindex")
        if "5:30" not in text and name in {"index.html", "contact.html"}:
            failures.append(f"{name} dropped the demo 5:30 close")
        if BANNED.search(text):
            failures.append(f"{name} has a banned claim or leftover demo asset")
        for url in parser.hrefs + parser.srcs:
            target = local_target(url, page)
            if target is not None and not target.is_file():
                failures.append(f"{name} broken local ref {url}")
    if len(titles) != len(set(titles)):
        failures.append(f"duplicate titles: {titles}")
    for title in titles:
        if len(title) > 60:
            failures.append(f"title over 60: {title}")
    joined = "\n".join(blob)
    for post in POSTS:
        if post not in joined:
            failures.append(f"missing post {post}")
    for rel, digest in HASHES.items():
        path = ROOT / rel
        if not path.is_file():
            failures.append(f"missing {rel}")
            continue
        found = hashlib.sha256(path.read_bytes()).hexdigest()
        if found != digest:
            failures.append(f"hash mismatch {rel}")
        if rel not in joined:
            failures.append(f"{rel} not used in a page")
    script = (ROOT / "site.js").read_text(encoding="utf-8")
    if "preventDefault" not in script or "does not send a message" not in script:
        failures.append("form does not stay local")
    if failures:
        print("\n".join(failures))
        return 1
    print(f"site check ok ({len(PAGES)} pages)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
