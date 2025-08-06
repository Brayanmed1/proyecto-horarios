from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from utils.db import get_connection

docentes = Blueprint('docentes', __name__)

@docentes.route('/docentes', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_docentes():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        SELECT d.nombre, d.usuario, d.contrasena,
               m.id AS materiaId, m.carrera, m.materia, m.grupo
        FROM docentes d
        LEFT JOIN materias m ON d.materia_id = m.id
        ORDER BY d.nombre
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for nombre, usuario, contrasena, mid, carrera, materia, grupo in rows:
        result.append({
            'nombre': nombre,
            'usuario': usuario,
            'contrasena': contrasena,
            'materiaId': mid,
            'materia': f"{carrera} – {materia} ({grupo})"
        })
    return jsonify(result), 200

@docentes.route('/docentes', methods=['POST'])
@cross_origin(supports_credentials=True)
def add_docente():
    data = request.get_json()
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        INSERT INTO docentes (nombre, usuario, contrasena, materia_id)
        VALUES (%s, %s, %s, %s)
    """, (data['nombre'], data['usuario'], data['contrasena'], data['materiaId']))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Docente agregado'}), 201

@docentes.route('/docentes/<string:usuario>', methods=['PUT'])
@cross_origin(supports_credentials=True)
def update_docente(usuario):
    data = request.get_json()
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        UPDATE docentes
           SET nombre=%s,
               contrasena=%s,
               materia_id=%s
         WHERE usuario=%s
    """, (data['nombre'], data['contrasena'], data['materiaId'], usuario))
    if cur.rowcount == 0:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'message': 'Docente no encontrado'}), 404
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Docente actualizado'}), 200

@docentes.route('/docentes/<string:usuario>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete_docente(usuario):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("DELETE FROM docentes WHERE usuario = %s", (usuario,))
    if cur.rowcount == 0:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'message': 'Docente no encontrado'}), 404
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Docente eliminado'}), 200
