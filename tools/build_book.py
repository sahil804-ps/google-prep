"""Assemble the 'Zero to Google' book from js/data + book/chapters + book/extras.

Run: python tools/build_book.py            (markdown + html + pdf)
     python tools/build_book.py --no-pdf
Output: book/dist/vol{1..4}-*.md|.html|.pdf
"""
import json
import pathlib
import re
import subprocess
import sys
import tempfile

from markdown_it import MarkdownIt
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name
from pygments.util import ClassNotFound

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHAPTERS = ROOT / "book" / "chapters"
EXTRAS = ROOT / "book" / "extras"
DIST = ROOT / "book" / "dist"
BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
]
BOOK = "Zero to Google: DSA, System Design and Test Engineering for QA Engineers"
LETTERS = "ABCDEFGH"

DUMP_JS = """
const d = p => require('./js/data/' + p + '.js');
const deep = Object.assign({}, d('topics-deep-1'), d('topics-deep-2'));
process.stdout.write(JSON.stringify({
  problems: d('problems'), bonus: d('bonus'), topics: d('topics'), deep,
  basics: d('basics'), videos: d('videos'), design: d('design'),
  td: d('td-answers'), sd: d('sd-answers'), english: d('english')
}));
"""


def load_data():
    out = subprocess.run(["node", "-e", DUMP_JS], cwd=ROOT, capture_output=True,
                         text=True, encoding="utf-8", check=True)
    return json.loads(out.stdout)


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def chapter(name):
    path = CHAPTERS / name
    if not path.exists():
        print(f"  warning: missing chapter {name}")
        return ""
    return path.read_text(encoding="utf-8").strip()


def chapters(prefix):
    return [p.read_text(encoding="utf-8").strip()
            for p in sorted(CHAPTERS.glob(prefix + "*.md"))]


def quiz_md(questions, title="Quiz", key_title="Answer key"):
    if not questions:
        return ""
    q_lines, a_lines = [f"## {title}", ""], [f"## {key_title}", ""]
    for i, q in enumerate(questions, 1):
        q_lines.append(f"{i}. {q['q']}")
        for j, opt in enumerate(q["options"]):
            q_lines.append(f"   - {LETTERS[j]}) {opt}")
        why = q.get("why", "")
        a_lines.append(f"{i}. **{LETTERS[q['answer']]}** - {q['options'][q['answer']]}."
                       + (f" {why}" if why else ""))
    return "\n".join(q_lines + [""] + a_lines)


def videos_md(vids):
    if not vids:
        return ""
    lines = ["## Videos", ""]
    for v in vids:
        lines.append(f"- [{v['title']}](https://www.youtube.com/watch?v={v['id']})"
                     f" - {v['channel']} ({v['lang']})")
    return "\n".join(lines)


def links_md(items, title="Further reading"):
    if not items:
        return ""
    return "\n".join([f"## {title}", ""] + [f"- [{r['label']}]({r['url']})" for r in items])


def problem_table(problems, title):
    lines = [f"## {title}", "", "| # | Problem | Level | LeetCode | Solution video |",
             "|---|---|---|---|---|"]
    for i, p in enumerate(problems, 1):
        star = " (Blind 75)" if p.get("blind75") else ""
        video = f"[watch](https://www.youtube.com/watch?v={p['video']})" if p.get("video") else "-"
        lines.append(f"| {i} | {p['title']}{star} | {p['difficulty']} | "
                     f"[open](https://leetcode.com/problems/{p['slug']}/) | {video} |")
    return "\n".join(lines)


def extras_md(topic):
    path = EXTRAS / (slug(topic) + ".md")
    if not path.exists():
        print(f"  warning: missing extras {path.name}")
        return ""
    text = path.read_text(encoding="utf-8").strip()
    return text.replace("## Answer key", "## More quiz: answer key")


def split_flashcards(text):
    if "## Flashcards" not in text:
        return text, ""
    body, cards = text.split("## Flashcards", 1)
    return body.strip(), "## Flashcards" + cards


def join(*parts):
    return "\n\n".join(p.strip() for p in parts if p and p.strip())


def strip_title(md):
    lines = md.splitlines()
    return "\n".join(lines[1:]).strip() if lines and lines[0].startswith("# ") else md


def vol1(data):
    out = [chapter("dsa-00-how-to-use-this-book.md"),
           chapter("dsa-01-how-google-coding-interviews-work.md"),
           chapter("dsa-02-python-from-zero-for-dsa.md"),
           chapter("dsa-03-problem-solving-framework.md")]
    for b in data["basics"]:
        out.append(join(f"# Foundations {b['id'][1:]}: {b['title']}", b["notes"],
                        videos_md(data["videos"].get(b["id"])), quiz_md(b["quiz"])))
    for topic, short in data["topics"].items():
        deep = data["deep"].get(topic, {})
        probs = [p for p in data["problems"] if p["topic"] == topic]
        bonus = [p for p in data["bonus"] if p["topic"] == topic]
        extra_body, cards = split_flashcards(extras_md(topic))
        hints, more = extra_body, ""
        if "## More quiz" in extra_body:
            hints, more = extra_body.split("## More quiz", 1)
            more = "## More quiz" + more
        out.append(join(
            f"# DSA topic: {topic}",
            deep.get("notes", ""),
            "## Cheat sheet\n\n" + re.sub(r"^## ", "### ", short["notes"], flags=re.M),
            f"## Visualise it\n\n- {short['visual']}" if short.get("visual") else "",
            videos_md(data["videos"].get(topic)),
            problem_table(probs, "NeetCode 150 problems for this topic"),
            hints,
            problem_table(bonus, "Bonus practice (after you finish the list above)") if bonus else "",
            quiz_md(deep.get("quiz", []) + short.get("quiz", [])),
            more, cards))
    out += [chapter("dsa-30-testing-your-own-code.md"),
            chapter("dsa-31-expert-extras.md"),
            chapter("dsa-32-mock-interview-playbook.md")]
    return "Volume 1 - Data Structures and Algorithms, from zero to expert", out


def checklist_md(items):
    return "\n".join(["## What a strong answer covers (checklist)", ""] + [f"- [ ] {c}" for c in items])


def vol2(data):
    ds, sd = data["design"], data["sd"]
    out = chapters("sd-0")
    for i, les in enumerate(ds["sdLessons"], 1):
        out.append(join(f"# Building block {i}: {les['title']}",
                        sd["lessons"].get(les["id"], les["notes"]),
                        videos_md(data["videos"].get(les["id"])),
                        links_md(les.get("read"))))
    for i, p in enumerate(ds["sdPrompts"], 1):
        out.append(join(f"# Case study {i}: {p['title']}",
                        f"> **Interview prompt:** {p['prompt']}\n>\n> Try it yourself for 35 minutes before you read the model answer.",
                        checklist_md(p["checklist"]),
                        "## Model answer\n\n" + re.sub(r"^## ", "### ", sd["answers"].get(p["id"], ""), flags=re.M)))
    out += chapters("sd-5")
    return "Volume 2 - System Design, from zero to expert", out


def vol3(data):
    ds = data["design"]
    out = [chapter("qa-01-software-testing-from-zero.md")]
    qa_lessons = sorted(CHAPTERS.glob("qa-[01][0-9]-*.md"))
    qa_lessons = [p for p in qa_lessons if not p.name.startswith("qa-01-")]
    for i, path in enumerate(qa_lessons):
        text = path.read_text(encoding="utf-8").strip()
        if i < len(ds["tdLessons"]):
            les = ds["tdLessons"][i]
            body, cards = split_flashcards(text)
            text = join(body, videos_md(data["videos"].get(les["id"])), links_md(les.get("read")), cards)
        out.append(text)
    for i, p in enumerate(ds["tdPrompts"], 1):
        out.append(join(f"# Test design practice {i}: {p['title']}",
                        f"> **Interview prompt:** {p['prompt']}\n>\n> Write your own answer for 25 minutes before you read the model answer.",
                        checklist_md(p["checklist"]),
                        "## Model answer\n\n" + re.sub(r"^## ", "### ", data["td"].get(p["id"], ""), flags=re.M)))
    beh = ["# Behavioural practice questions", "",
           "Answer each one out loud with the STAR method. Record yourself in the web app's speaking studio.", ""]
    for i, b in enumerate(ds["behavioral"], 1):
        beh += [f"## {i}. {b['title']}", "", b["tips"].replace("\n", "\n\n"), ""]
    out.append("\n".join(beh))
    out += [chapter("qa-50-googleyness-and-behavioural.md"),
            chapter("qa-51-the-swe-test-interview-end-to-end.md")]
    return "Volume 3 - Test Engineering, from zero to Google level", out


def vol4(data):
    en = data["english"]
    out = []
    for i, g in enumerate(en["grammar"], 1):
        out.append(join(f"# Grammar {i}: {g['title']}", g["notes"],
                        f"> **Hindi tip:** {g['hindi']}" if g.get("hindi") else "",
                        quiz_md(g["quiz"])))
    out.append("\n".join(["# Interview phrase bank", "",
                          "Say each phrase out loud three times. Use them in mock interviews.", ""]
                         + [f"{i}. {p}" for i, p in enumerate(en["phrases"], 1)]))
    out.append("\n".join(["# Speaking practice prompts", "", en["shadowingTip"], "",
                          "Filler words to avoid: " + ", ".join(f"*{f}*" for f in en["fillers"]), ""]
                         + [f"{i}. {p}" for i, p in enumerate(en["speaking"], 1)]))
    return "Volume 4 - English for technical interviews", out


def assemble(title, parts):
    parts = [p for p in parts if p]
    toc = ["## Contents", ""]
    for i, p in enumerate(parts, 1):
        toc.append(f"{i}. {p.splitlines()[0].lstrip('# ').strip()}")
    head = f"# {BOOK}\n\n**{title}**\n\nWritten for Sahil Sharma - SDET preparing for Google SWE-Test / SDET (India). " \
           "Study it with the web app https://sahil804-ps.github.io/google-prep/ and Google NotebookLM.\n\n" + "\n".join(toc)
    return "\n\n---\n\n".join([head] + parts) + "\n"


def code_highlight(code, lang, _attrs):
    try:
        lexer = get_lexer_by_name(lang or "text")
    except ClassNotFound:
        lexer = get_lexer_by_name("text")
    return highlight(code, lexer, HtmlFormatter(nowrap=True))


CSS = """
@page { size: A4; margin: 16mm 14mm; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1d1d1f; max-width: 820px; margin: auto; }
h1 { color: #1a56db; border-bottom: 3px solid #1a56db; padding-bottom: 4px; page-break-before: always; }
body > h1:first-of-type { page-break-before: avoid; font-size: 26pt; }
h2 { color: #0b3d91; margin-top: 1.4em; border-bottom: 1px solid #dde3ee; }
h3 { color: #333; }
pre { background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 10px; font-size: 9.5pt; white-space: pre-wrap; page-break-inside: avoid; }
code { font-family: Consolas, 'Courier New', monospace; background: #f3f4f6; padding: 0 3px; border-radius: 3px; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10pt; page-break-inside: auto; }
th, td { border: 1px solid #d0d7de; padding: 5px 7px; text-align: left; vertical-align: top; }
th { background: #eef2fb; }
tr { page-break-inside: avoid; }
blockquote { border-left: 4px solid #1a56db; background: #f4f7ff; margin: 10px 0; padding: 6px 12px; }
hr { border: 0; }
a { color: #1a56db; word-break: break-word; }
"""


def to_html(md_text, title):
    md = MarkdownIt("commonmark", {"highlight": code_highlight, "breaks": True, "html": False}).enable("table")
    body = md.render(md_text)
    pyg = HtmlFormatter(style="friendly").get_style_defs("pre")
    return (f"<!doctype html><html><head><meta charset='utf-8'><title>{title}</title>"
            f"<style>{CSS}{pyg}</style></head><body>{body}</body></html>")


def to_pdf(html_path, pdf_path):
    browser = next((b for b in BROWSERS if pathlib.Path(b).exists()), None)
    if not browser:
        print("  no Edge/Chrome found, skipping PDF")
        return
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as profile:
        subprocess.run([browser, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                        "--no-first-run", f"--user-data-dir={profile}",
                        f"--print-to-pdf={pdf_path}", html_path.as_uri()],
                       check=True, capture_output=True, timeout=300)


def main():
    data = load_data()
    DIST.mkdir(parents=True, exist_ok=True)
    vols = [("vol1-dsa", vol1), ("vol2-system-design", vol2),
            ("vol3-test-engineering", vol3), ("vol4-english", vol4)]
    for name, fn in vols:
        title, parts = fn(data)
        md_text = assemble(title, parts)
        md_path = DIST / f"{name}.md"
        md_path.write_text(md_text, encoding="utf-8")
        html_path = DIST / f"{name}.html"
        html_path.write_text(to_html(md_text, title), encoding="utf-8")
        words = len(re.findall(r"\w+", md_text))
        print(f"{name}: {len([p for p in parts if p])} chapters, {words:,} words")
        if "--no-pdf" not in sys.argv:
            to_pdf(html_path, DIST / f"{name}.pdf")
            print(f"  pdf: {(DIST / f'{name}.pdf').stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
