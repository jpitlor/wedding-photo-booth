import base64
import logging
from io import BytesIO
from threading import Thread
from typing import List

import resend
from PIL.Image import Image


def _encode_attachment(image: Image) -> str:
    """Encodes the image as a base64 JPEG, which is what Resend expects."""
    # JPEG has no alpha channel, so RGBA images must be converted first
    with BytesIO() as out_stream:
        image.convert("RGB").save(out_stream, format="JPEG", quality=100)
        return base64.b64encode(out_stream.getvalue()).decode("ascii")


def send_email(api_key: str, image: Image, email_addresses: List[str]):
    """Sends the photo to the given addresses.

    Errors are logged rather than raised so that a failed email never
    prevents the photo from being printed.
    """
    try:
        attachment: resend.Attachment = {
            "content": _encode_attachment(image),
            "filename": "photo.jpg",
        }
        params: resend.Emails.SendParams = {
            "from": "Jordan and Cassie Wedding Photobooth <noreply@pitlor.dev>",
            "attachments": [attachment],
            "to": email_addresses,
            "subject": "Here's the photo you took!",
            "html": "Thanks for attending our wedding!",
        }

        resend.api_key = api_key

        logging.info("Sending email to %s", email_addresses)
        response = resend.Emails.send(params)
        logging.info("Email sent: %s", response)
    except Exception:
        logging.exception("Failed to send email to %s", email_addresses)


def send_email_in_background(api_key: str, image: Image, email_addresses: List[str]) -> Thread:
    """Sends the email on a background thread so the request isn't blocked."""
    # Copy the image so later modifications by the caller can't affect the email
    thread = Thread(
        target=send_email,
        args=(api_key, image.copy(), list(email_addresses)),
        daemon=True,
    )
    thread.start()
    return thread
