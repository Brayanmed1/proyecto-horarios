# utils/db.py
import os
import psycopg2
from urllib.parse import urlparse

def get_connection():
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        # Producción: usa la URL de Railway
        result = urlparse(db_url)
        return psycopg2.connect(
            host=result.hostname,
            database=result.path.lstrip('/'),
            user=result.username,
            password=result.password,
            port=result.port
        )
    else:
        # Desarrollo: importa la configuración local
        # Aquí config.py está en la carpeta raíz del proyecto
        from config import DB_CONFIG
        return psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
