import multiprocessing
import os

# Gunicorn configuration
bind = "0.0.0.0:8001"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process management
timeout = 120
keepalive = 5

# Set worker name
proc_name = "qr360_backend"
