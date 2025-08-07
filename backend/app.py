@app.route('/ping', methods=['GET'])
def ping():
    return 'pong', 200

from flask import Flask
from flask_cors import CORS

from routes.auth_routes import auth
from routes.docentes_routes import docentes
from routes.materias_routes import materias
from routes.horarios_routes import horarios_bp  # Importa el nuevo blueprint

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_aquí'

# Política global de CORS: permite credenciales y todos los métodos HTTP en /api/*
CORS(app,
     supports_credentials=True,
     resources={
       r"/api/*": {
         "origins": "http://localhost:3000",
         "methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"]
       }
     })

# Registrar Blueprints bajo /api
app.register_blueprint(auth,       url_prefix='/api')
app.register_blueprint(docentes,   url_prefix='/api')
app.register_blueprint(materias,   url_prefix='/api')
app.register_blueprint(horarios_bp,url_prefix='/api')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
