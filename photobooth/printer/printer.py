import logging
from enum import Enum

from PIL.Image import Image, Resampling, new as NewImage
from io import BytesIO
from threading import Event, Thread

from photobooth.printer.ivy2 import Ivy2Printer

mosaic_printer_mac_address = "28:D4:1E:28:47:70"
mosaic_printer = Ivy2Printer()
personal_printer_mac_address = "60:6E:41:46:34:60"
personal_printer = Ivy2Printer()

PRINT_START_WIDTH = 1920
PRINT_START_HEIGHT = 1280
PRINT_FINAL_WIDTH = 1616
PRINT_FINAL_HEIGHT = 640

class PrinterInstance(Enum):
    MOSAIC = 1,
    PERSONAL = 2

PRINTERS = {
    PrinterInstance.MOSAIC: (mosaic_printer, mosaic_printer_mac_address),
    PrinterInstance.PERSONAL: (personal_printer, personal_printer_mac_address),
}

# The printer's shortest auto power off is 3 minutes, so this is plenty to keep
# it awake while keeping traffic (and collisions with prints) to a minimum
PING_INTERVAL_SECONDS = 15

stop_event = Event()


def periodic_ping():
    """Keeps the bluetooth connections alive, reconnecting if they drop.

    Runs for the life of the process. A printer that is currently printing
    is skipped rather than pausing the whole thread.
    """
    while not stop_event.wait(PING_INTERVAL_SECONDS):
        for instance, (printer, mac_address) in PRINTERS.items():
            # Skip printers that are receiving a print (locked) or physically
            # printing (busy) - they don't answer status requests while printing
            if printer.is_busy() or not printer.lock.acquire(blocking=False):
                continue

            try:
                if printer.is_connected():
                    # get_status rather than check_print_worthiness so that
                    # e.g. running out of paper isn't treated as a failure
                    printer.get_status()
                else:
                    logging.info("Reconnecting to %s printer", instance.name)
                    printer.connect(mac_address)
            except Exception:
                logging.exception("Ping failed for %s printer", instance.name)
            except BaseException:
                logging.exception("Ping failed for %s printer (Custom Exception)", instance.name)
            finally:
                printer.lock.release()


periodic_check_thread = Thread(target=periodic_ping, daemon=True)


def init_printer():
    for instance, (printer, mac_address) in PRINTERS.items():
        logging.info("Connecting to %s printer", instance.name)
        try:
            with printer.lock:
                printer.connect(mac_address)
        except Exception:
            # Not fatal - the ping thread will keep retrying
            logging.exception("Failed to connect to %s printer", instance.name)

    if not periodic_check_thread.is_alive():
        periodic_check_thread.start()


def prepare_image(image: Image):
    width, height = image.size

    scale_factor = max(PRINT_START_WIDTH / width, PRINT_START_HEIGHT / height)
    scaled_width = int(width * scale_factor)
    scaled_height = int(height * scale_factor)

    if scaled_width != width or scaled_height != height:
        image = image.resize(
            (scaled_width, scaled_height), Resampling.LANCZOS
        )

    offset = (
        (PRINT_START_WIDTH - scaled_width) // 2,
        (PRINT_START_HEIGHT - scaled_height) // 2
    )

    out_image = NewImage("RGB", (PRINT_START_WIDTH, PRINT_START_HEIGHT))
    out_image.paste(image, offset)

    out_image = out_image.resize(
        (PRINT_FINAL_WIDTH, PRINT_FINAL_HEIGHT),
        Resampling.LANCZOS
    )

    with BytesIO() as out_stream:
        out_image.save(out_stream, format="JPEG", quality=100)
        return out_stream.getvalue()

def print_image(image: Image, instance: PrinterInstance):
    printer, _ = PRINTERS[instance]
    data = prepare_image(image)

    with printer.lock:
        logging.info("Printing to %s printer", instance.name)
        printer.print(data)


def check_print_worthiness():
    for printer, _ in PRINTERS.values():
        with printer.lock:
            printer.check_print_worthiness()
