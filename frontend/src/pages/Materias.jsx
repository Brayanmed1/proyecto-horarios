// src/pages/Materias.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './materias.css';

const API_BASE = 'http://localhost:5000/api';

export default function Materias() {
  const [materias, setMaterias]   = useState([]);
  const [docentes, setDocentes]   = useState([]);
  const [form, setForm]           = useState({
    carrera: '',
    materia: '',
    grupo: '',
    docenteId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => {
    // 1) Cargar materias
    fetch(`${API_BASE}/materias`)
      .then(res => res.json())
      .then(data => setMaterias(data))
      .catch(err => console.error('Error cargando materias:', err));

    // 2) Cargar docentes (para el select)
    fetch(`${API_BASE}/docentes`)
      .then(res => res.json())
      .then(data => setDocentes(data))
      .catch(err => console.error('Error cargando docentes:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url    = isEditing 
      ? `${API_BASE}/materias/${editId}` 
      : `${API_BASE}/materias`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const payload = {
        carrera:   form.carrera,
        materia:   form.materia,
        grupo:     form.grupo,
        docenteId: form.docenteId
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      // Refrescar la lista
      const listRes  = await fetch(`${API_BASE}/materias`);
      const listData = await listRes.json();
      setMaterias(listData);

      // Reset form
      setForm({ carrera:'', materia:'', grupo:'', docenteId:'' });
      setIsEditing(false);
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error guardando materia:', err);
      alert('Error al guardar la materia.');
    }
  };

  const handleEdit = m => {
    setForm({
      carrera:   m.carrera,
      materia:   m.materia,
      grupo:     m.grupo,
      docenteId: m.docenteId || ''
    });
    setIsEditing(true);
    setEditId(m.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar esta materia?')) return;
    try {
      const res = await fetch(`${API_BASE}/materias/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      setMaterias(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error borrando materia:', err);
      alert('Error al eliminar la materia.');
    }
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <img
            src="https://www.utacapulco.edu.mx/UTANUEVA4/img/LOGO%20UTA.png"
            alt="Logo"
            className="sidebar-logo"
          />
          <h2 className="sidebar-title">Sistema de Horarios</h2>
        </div>
        <nav>
          <ul>
            <li><Link to="/admin-panel">📋 Panel principal</Link></li>
            <li><Link to="/admin-panel/docentes">🧑‍🏫 Docentes</Link></li>
            <li><Link to="/admin-panel/materias">📚 Materias</Link></li>
            <li><Link to="/admin-panel/horarios">🕑 Horarios</Link></li>
            <li><Link to="/">🔒 Cerrar sesión</Link></li>
          </ul>
        </nav>
        <button onClick={toggleDarkMode} className="toggle-dark-mode">
          🌙 Modo Oscuro
        </button>
      </aside>

      <motion.main
        className="admin-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="top-bar">
          <h2>📚 Materias</h2>
          <Link to="/admin-panel" className="btn-regresar">⬅️ Regresar</Link>
        </div>

        <div className="materias-header">
          <button onClick={() => setShowForm(prev => !prev)}>
            {showForm ? 'Cancelar' : '➕ Agregar Materia'}
          </button>
        </div>

        {showForm && (
          <motion.form
            className="materias-form"
            onSubmit={handleSubmit}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <input
              name="carrera"
              placeholder="Carrera"
              value={form.carrera}
              onChange={handleChange}
              required
            />
            <input
              name="materia"
              placeholder="Nombre de la materia"
              value={form.materia}
              onChange={handleChange}
              required
            />
            <input
              name="grupo"
              placeholder="Grupo (ej. 3-B)"
              value={form.grupo}
              onChange={handleChange}
              required
            />

            {/* Nuevo select para docente */}
            <select
              name="docenteId"
              value={form.docenteId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona docente</option>
              {docentes.map(d => (
                <option key={d.usuario} value={d.usuario}>
                  {d.nombre}
                </option>
              ))}
            </select>

            <button type="submit">
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </motion.form>
        )}

        <motion.table
          className="materias-table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <thead>
            <tr>
              <th>Carrera</th>
              <th>Materia</th>
              <th>Grupo</th>
              <th>Docente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.length === 0 ? (
              <tr>
                <td colSpan="5" className="materias-empty">
                  No hay materias disponibles
                </td>
              </tr>
            ) : (
              materias.map(m => (
                <tr key={m.id}>
                  <td>{m.carrera}</td>
                  <td>{m.materia}</td>
                  <td>{m.grupo}</td>
                  <td>{m.docenteNombre || '—'}</td>
                  <td className="acciones">
                    <button onClick={() => handleEdit(m)}>✏️</button>
                    <button onClick={() => handleDelete(m.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </motion.table>
      </motion.main>
    </div>
  );
}
