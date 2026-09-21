#!/usr/bin/env python3
"""Generate this month's FitFusion article draft and email it to yourself.

Designed to run unattended on a schedule (Replit Scheduled Deployment / Cron):

    python3 scripts/monthly_article_email.py

It invokes ``content_gen.py --auto --stdout`` to render the month's draft as a
self-contained HTML document, then emails it (HTML preview in the body plus an
``.html`` attachment) via the Resend API (https://resend.com).

Required secrets:
    RESEND_API_KEY    Resend API key (starts with "re_").

Recipient (first one that is set wins):
    ARTICLE_EMAIL_TO  Explicit recipient address.
    GMAIL_ADDRESS     Reused as the recipient if ARTICLE_EMAIL_TO is unset.

Optional:
    RESEND_FROM       Sender. Defaults to "FitFusion <onboarding@resend.dev>",
                      Resend's shared sandbox sender that needs no domain
                      verification but may ONLY deliver to the email address
                      that owns the Resend account. To send elsewhere, verify
                      a domain in Resend and set RESEND_FROM to an address on
                      that domain.

Exit codes:
    0  email sent
    1  generation or send failed
    2  missing/invalid configuration
"""

from __future__ import annotations

import base64
import datetime as _dt
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

RESEND_ENDPOINT = "https://api.resend.com/emails"
DEFAULT_FROM = "FitFusion <onboarding@resend.dev>"

SCRIPT_DIR = Path(__file__).resolve().parent
CONTENT_GEN = SCRIPT_DIR / "content_gen.py"


def _fail(msg: str, code: int) -> int:
    print(f"error: {msg}", file=sys.stderr)
    return code


def generate_html() -> tuple[str, str]:
    """Run the generator in --auto --stdout mode and return (html, status)."""
    if not CONTENT_GEN.exists():
        raise FileNotFoundError(f"generator not found at {CONTENT_GEN}")

    proc = subprocess.run(
        [sys.executable, str(CONTENT_GEN), "--auto", "--stdout"],
        capture_output=True,
        text=True,
        stdin=subprocess.DEVNULL,
        cwd=str(SCRIPT_DIR.parent),
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"content_gen.py exited {proc.returncode}\n{proc.stderr.strip()}"
        )
    html = proc.stdout
    if "<html" not in html.lower():
        raise RuntimeError("generator produced no HTML document")
    return html, proc.stderr.strip()


def extract_title(html: str) -> str:
    m = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    if not m:
        return "New FitFusion article draft"
    # render_html emits "<Article Title> | FitFusion" — keep just the article part.
    return m.group(1).split("|")[0].strip() or "New FitFusion article draft"


def build_payload(html: str, sender: str, recipient: str) -> dict:
    title = extract_title(html)
    month_label = _dt.date.today().strftime("%B %Y")
    file_slug = _dt.date.today().strftime("%Y-%m")

    text_body = (
        f"Your FitFusion article draft for {month_label} is ready.\n\n"
        f"Title: {title}\n\n"
        "The draft is attached as an .html file — open it in a browser to "
        "preview, then port the content into Markdown files in "
        "content/articles/ (see content/articles/README.md) when "
        "you're happy with it.\n"
    )
    attachment_b64 = base64.b64encode(html.encode("utf-8")).decode("ascii")

    return {
        "from": sender,
        "to": [recipient],
        "subject": f"FitFusion draft — {title} ({month_label})",
        "html": html,
        "text": text_body,
        "attachments": [
            {
                "filename": f"fitfusion-{file_slug}-draft.html",
                "content": attachment_b64,
            }
        ],
    }


def send_via_resend(payload: dict, api_key: str) -> None:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        RESEND_ENDPOINT,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # A product User-Agent avoids Cloudflare's default-urllib bot block
            # (HTTP 403, error code 1010) in front of the Resend API.
            "User-Agent": "FitFusion-Monthly-Mailer/1.0",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()  # drain; a 2xx here means accepted
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace").strip()
        raise RuntimeError(f"Resend returned HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"could not reach Resend: {exc.reason}") from exc


def main() -> int:
    api_key = (os.environ.get("RESEND_API_KEY") or "").strip()
    sender = (os.environ.get("RESEND_FROM") or DEFAULT_FROM).strip()
    recipient = (
        os.environ.get("ARTICLE_EMAIL_TO")
        or os.environ.get("GMAIL_ADDRESS")
        or ""
    ).strip()

    if not api_key:
        return _fail("RESEND_API_KEY is not set", 2)
    if not recipient:
        return _fail("no recipient set (ARTICLE_EMAIL_TO or GMAIL_ADDRESS)", 2)

    try:
        html, status = generate_html()
    except Exception as exc:  # noqa: BLE001 - surface any generation failure
        return _fail(f"could not generate draft: {exc}", 1)

    if status:
        print(status, file=sys.stderr)

    payload = build_payload(html, sender, recipient)

    try:
        send_via_resend(payload, api_key)
    except RuntimeError as exc:
        return _fail(str(exc), 1)

    print(f"✓ Sent '{payload['subject']}' to {recipient}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
