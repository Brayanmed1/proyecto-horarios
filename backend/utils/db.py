import os
import psycopg2
from urllib.parse import urlparse

# Obtiene la conexión a la base de datos, usando DATABASE_URL si está en producción
# (Railway define esta variable automáticamente), o la configuración local en config.py.

def get_connection():
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        # Parsea la URL de conexión (postgresql://usuario:pass@host:puerto/db)
        result = urlparse(db_url)
        return psycopg2.connect(
            host=result.hostname,
            database=result.path.lstrip('/'),
            user=result.username,
            password=result.password,
            port=result.port
        )
    else:
        # Configuración local (config.py debe estar en la raíz del proyecto)
        from config import DB_CONFIG
        return psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
