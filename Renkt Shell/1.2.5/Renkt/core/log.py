import os
import time
import logging
from logging.handlers import TimedRotatingFileHandler

LOG_DIR = "logs"
MAX_BACKUP_COUNT = 30
LOG_FORMAT = "%(asctime)s - %(levelname)-8s - %(module)s:%(funcName)s:%(lineno)d - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

os.makedirs(LOG_DIR, exist_ok=True)

start_time = time.strftime("%Y-%m-%d_%H-%M-%S")
log_file = f"renkt_{start_time}.log"
log_path = os.path.join(LOG_DIR, log_file)

logger = logging.getLogger("Renkt")
logger.setLevel(logging.DEBUG)
logger.propagate = False

formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

file_handler = logging.FileHandler(log_path, encoding="utf-8")
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.DEBUG)

logger.addHandler(file_handler)


def debug(message):
    logger.debug(message)


def info(message):
    logger.info(message)


def warning(message):
    logger.warning(message)


def error(message):
    logger.error(message)


def critical(message):
    logger.critical(message)


def log_exception(exc, context=""):
    logger.error(f"异常: {exc}, 上下文: {context}", exc_info=True)