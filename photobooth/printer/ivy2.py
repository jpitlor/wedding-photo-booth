import time
import queue
import threading
from loguru import logger

from .task import (
    StartSessionTask,
    GetStatusTask,
    GetSettingTask,
    SetSettingTask,
    GetPrintReadyTask,
    RebootTask
)

from .exceptions import (
    ClientUnavailableError,
    ReceiveTimeoutError,
    AckError,
    LowBatteryError,
    CoverOpenError,
    NoPaperError,
    WrongSmartSheetError
)
from .client import ClientThread
from .utils import parse_incoming_message

PRINT_BATTERY_MIN = 30
PRINT_DATA_CHUNK = 990

# How long the printer is physically printing after the data transfer completes.
# The printer doesn't answer status requests during this time.
PHYSICAL_PRINT_SECONDS = 90


class Ivy2Printer:
    def __init__(self):
        self.client = None
        # Held for the duration of any exchange with the printer so that
        # keep-alive pings, status checks, and prints don't interleave
        self.lock = threading.Lock()
        # time.monotonic() value until which the printer is physically printing
        self.busy_until = 0.0

    def connect(self, mac_address, port=1):
        if self.client is not None:
            self.client.disconnect()

        # Threads can only be started once, so every (re)connect needs a new client
        self.client = ClientThread()
        self.client.connect(mac_address, port)
        battery_level, mtu = self.__start_session()

        logger.debug("Connected; Battery level: {}; MTU: {}".format(battery_level, mtu))

    def disconnect(self):
        if self.client is not None:
            self.client.disconnect()

    def is_connected(self):
        return self.client is not None and self.client.alive.is_set()

    def is_busy(self):
        """Whether the printer is likely still physically printing."""
        return time.monotonic() < self.busy_until

    def print(self, target: bytes, transfer_timeout=60):
        image_length = len(target)

        self.check_print_worthiness()
        self.get_setting()

        # setup the printer to receive the image data
        self.get_print_ready(image_length)

        # make sure the only response we wait for below is the transfer-complete one
        self.__drain_inbound()

        try:
            # split up the image and add to the client queue
            start_index = 0
            while True:
                end_index = min(start_index + PRINT_DATA_CHUNK, image_length)
                image_chunk = target[start_index:end_index]

                self.client.outbound_q.put(image_chunk)

                if end_index >= image_length:
                    break

                start_index = end_index

            logger.debug("Beginning data transfer...")

            # wait longer than usual since the transfer takes some time
            self.__receive_message(transfer_timeout)

            logger.debug("Data transfer complete! Printing should begin in a moment")
        finally:
            # Once data has been sent the printer may be printing even if we
            # didn't get the transfer-complete response, so leave it alone
            self.busy_until = time.monotonic() + PHYSICAL_PRINT_SECONDS

    def reboot(self):
        return self.__perform_task(RebootTask())

    def get_status(self):
        return self.__perform_task(GetStatusTask())

    def get_setting(self):
        return self.__perform_task(GetSettingTask())

    def set_setting(self, auto_power_off):
        """Sets the auto power off setting on the printer.

        auto_power_off: Time in minutes before the printer turns off without any
        activity. Supported values are 3, 5, and 10.
        """
        return self.__perform_task(SetSettingTask(auto_power_off))

    def get_print_ready(self, length):
        return self.__perform_task(GetPrintReadyTask(length))

    def check_print_worthiness(self):
        status = self.get_status()
        error_code, battery_level, _, is_cover_open, is_no_paper, is_wrong_smart_sheet = status

        if error_code != 0:
            logger.error(
                "Status contains a non-zero error code: {}",
                error_code
            )

        if battery_level < PRINT_BATTERY_MIN:
            raise LowBatteryError()

        if is_cover_open:
            raise CoverOpenError()

        if is_no_paper:
            raise NoPaperError()

        if is_wrong_smart_sheet:
            raise WrongSmartSheetError()

    def __start_session(self):
        return self.__perform_task(StartSessionTask())

    def __perform_task(self, task):
        # discard any late responses to earlier requests (e.g. ones that timed
        # out) so they aren't mistaken for the response to this one
        self.__drain_inbound()

        # send the task's message
        self.__send_message(task.get_message())
        response = self.__receive_message()

        if response[2] != task.ack:
            raise AckError("Got invalid ack; expected {} but got {}".format(
                task.ack, response[3]
            ))

        # process and return the response
        return task.process_response(response)

    def __drain_inbound(self):
        if self.client is None:
            return

        while True:
            try:
                stale = self.client.inbound_q.get_nowait()
            except queue.Empty:
                return

            logger.warning("Discarding stale message from printer: {}", stale)

    def __send_message(self, message):
        if not self.is_connected():
            raise ClientUnavailableError()

        # add the message to the client thread's outbound queue
        self.client.outbound_q.put(message)

    def __receive_message(self, timeout=5):
        start = int(time.time())
        while int(time.time()) < (start + timeout):
            if not self.is_connected():
                raise ClientUnavailableError("")

            try:
                # attempt to read the client thread's inbound queue
                response = parse_incoming_message(
                    self.client.inbound_q.get(False, 0.1)
                )

                logger.debug(
                    "Received message: ack: {}, error: {}",
                    response[2],
                    response[3]
                )
                return response
            except queue.Empty:
                pass

        raise ReceiveTimeoutError()