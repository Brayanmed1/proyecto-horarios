# backend/utils/config.py

import os
from urllib.parse import urlparse

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Estamos en Railway (o cualquier otro entorno donde esté definida DATABASE_URL)
    url = urlparse(DATABASE_URL)
    DB_CONFIG = {
        "host":     url.hostname,
        "port":     url.port,
        "database": url.path.lstrip("/"),
        "user":     url.username,
        "password": url.password
    }
else:
    # Desarrollo local: mantén tu configuración
    DB_CONFIG = {
        "host":     "localhost",
        "port":     5432,               # añade el puerto si lo usas
        "database": "sistema_horarios",
        "user":     "postgres",
        "password": "1146"
    }
