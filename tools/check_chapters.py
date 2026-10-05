"""Check book chapters against book/BOOK_SPEC.md.

Run: python tools/check_chapters.py book/chapters/dsa-01-*.md book/chapters/dsa-02-*.md
     python tools/check_chapters.py            (all chapters)
Extras files (book/extras/*.md) are checked with --extras.
"""
import glob
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def check_chapter(path, min_words=1500):
    text = path.read_text(encoding="utf-8")
    errors = []
    if not text.startswith("# "):
        errors.append("must start with '# <title>'")
    for h in ("## Tester's corner", "## Key takeaways", "## Quiz", "## Answer key", "## Flashcards"):
        if h not in text:
            errors.append(f"missing section '{h}'")
    errors += check_tail(text, min_quiz=10, min_cards=8)
    body = text.split("## Quiz")[0]
    words = len(re.findall(r"\w+", body))
    if words < min_words:
        errors.append(f"body has {words} words, need {min_words}+")
    if text.count("```") % 2:
        errors.append("unclosed code fence")
    return errors


def check_tail(text, min_quiz, min_cards):
    errors = []
    if "## Quiz" in text and "## Answer key" in text:
        quiz = text.split("## Quiz", 1)[1].split("## Answer key", 1)[0]
        n = len(re.findall(r"^\d+\.\s", quiz, re.M))
        if n < min_quiz:
            errors.append(f"quiz has {n} numbered questions, need {min_quiz}")
        key = text.split("## Answer key", 1)[1].split("## Flashcards", 1)[0]
        k = len(re.findall(r"^\d+\.\s", key, re.M))
        if k < n:
            errors.append(f"answer key has {k} answers for {n} questions")
    if "## Flashcards" in text:
        cards = text.split("## Flashcards", 1)[1]
        c = len(re.findall(r"^- \*\*Q:\*\*.+ — \*\*A:\*\*", cards, re.M))
        if c < min_cards:
            errors.append(f"{c} flashcards in '- **Q:** ... — **A:** ...' format, need {min_cards}")
    return errors


def check_extras(path):
    text = path.read_text(encoding="utf-8")
    errors = []
    for h in ("## Problem hints", "## More quiz", "## Answer key", "## Flashcards"):
        if h not in text:
            errors.append(f"missing section '{h}'")
    text_for_tail = text.replace("## More quiz", "## Quiz")
    errors += check_tail(text_for_tail, min_quiz=5, min_cards=8)
    return errors


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    extras = "--extras" in sys.argv
    if not args:
        args = [str(ROOT / "book" / ("extras" if extras else "chapters") / "*.md")]
    files = sorted({pathlib.Path(f) for a in args for f in glob.glob(a)})
    if not files:
        print("no files matched")
        sys.exit(1)
    bad = 0
    for f in files:
        errs = check_extras(f) if extras else check_chapter(f)
        status = "ok" if not errs else "FAIL"
        print(f"{status}  {f.name}")
        for e in errs:
            print(f"      - {e}")
        bad += bool(errs)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
