from typing import List

import resend
from PIL.Image import Image


def send_email(image: Image, email_addresses: List[str]):
    attachment: resend.Attachment = {
        "content": list(image.tobytes()),
        "filename": "photo.jpg"
    }
    params: resend.Emails.SendParams = {
        "from": "Jordan and Cassie Wedding Photobooth <noreply@pitlor.dev>",
        "attachments": [attachment],
        "to": email_addresses,
        "subject": "Here's the photo you took!",
        "html": "Thanks for attending our wedding!",
    }

    resend.Emails.send(params)