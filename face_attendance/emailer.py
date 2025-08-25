from __future__ import annotations

import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from pathlib import Path
from typing import Iterable, Optional


@dataclass
class SMTPConfig:
    host: str
    port: int = 587
    username: Optional[str] = None
    password: Optional[str] = None
    use_tls: bool = True


def send_email(config: SMTPConfig, subject: str, body: str, to_addrs: list[str], attachments: Iterable[Path] = ()) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = config.username or "noreply@example.com"
    msg["To"] = ", ".join(to_addrs)
    msg.set_content(body)

    for path in attachments:
        data = Path(path).read_bytes()
        msg.add_attachment(data, maintype="application", subtype="octet-stream", filename=Path(path).name)

    if config.use_tls:
        server = smtplib.SMTP(config.host, config.port)
        server.starttls()
    else:
        server = smtplib.SMTP_SSL(config.host, config.port)

    try:
        if config.username and config.password:
            server.login(config.username, config.password)
        server.send_message(msg)
    finally:
        server.quit()
