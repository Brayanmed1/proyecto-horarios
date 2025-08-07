# backend/utils/db.py
import psycopg2
from .config import DB_CONFIG

# Devuelve una conexión válida a PostgreSQL usando la configuración
# ya sea de producción (DATABASE_URL) o de desarrollo local.
def get_connection():
    return psycopg2.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        database=DB_CONFIG["database"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"]
    )
