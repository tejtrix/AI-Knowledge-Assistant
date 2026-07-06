#!/bin/bash
celery -A app.workers.celery_app worker --loglevel=info
