from typing import List

import resend
from PIL.Image import Image


def send_email(api_key: str, image: Image, email_addresses: List[str]):
    pass
    # attachment: resend.Attachment = {
    #     "content": list(image.tobytes()),
    #     "filename": "photo.jpg"
    # }
    # params: resend.Emails.SendParams = {
    #     "from": "Jordan and Cassie Wedding Photobooth <noreply@pitlor.dev>",
    #     "attachments": [attachment],
    #     "to": email_addresses,
    #     "subject": "Here's the photo you took!",
    #     "html": "Thanks for attending our wedding!",
    # }
    #
    # resend.api_key = api_key
    # resend.Emails.send(params)