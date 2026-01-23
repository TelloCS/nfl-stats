from celery import shared_task
from .services.services import main
from celery.utils.log import get_task_logger
from django.db import transaction

logger = get_task_logger(__name__)

@shared_task
def weekly_nfl_sync():
    logger.info("Celery task started")
    logger.info("Starting weekly scheduled ingestion")
    try:
        with transaction.atomic():
            main()
            logger.info("Main pipeline finished successfully")
    except Exception as e:
        logger.error(f"Scheduled task failed: {e}")