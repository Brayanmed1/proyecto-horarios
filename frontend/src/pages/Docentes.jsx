// src/pages/Docentes.jsx
import React, { useEffect, useState } from 'react';
import './docentes.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function Docentes() {
  const [docentes, setDocentes] = useState([]);
  const [opcionesMaterias, setOpcionesMaterias] = useState([]);
  const [nuevoDocente, setNuevoDocente] = useState({
    nombre: '',
    usuario: '',
    contrasena: '',
    materiaId: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);

  // Carga inicial de materias y docentes
  useEffect(() => {
    // Obtener materias
    axios.get(`${API_BASE}/materias`, { withCredentials: true })
      .then(res => setOpcionesMaterias(res.data))
      .catch(err => console.error('Error cargando materias:', err));

    // Obtener docentes
    axios.get(`${API_BASE}/docentes`, { withCredentials: true })
      .then(res => setDocentes(
        res.data.sort((a, b) => a.nombre.localeCompare(b.nombre))
      ))
      .catch(err => {
        console.error('Error cargando docentes:', err);
        alert('No se pudieron cargar los docentes. Revisa la consola.');
      });
  }, []);

  const handleChange = ({ target: { name, value } }) => {
    setNuevoDocente(prev => ({ ...prev, [name]: value }));
  };

  const guardarDocente = async e => {
    e.preventDefault();
    const url = editando
      ? `${API_BASE}/docentes/${encodeURIComponent(editando)}`
      : `${API_BASE}/docentes`;
    const method = editando ? axios.put : axios.post;

    try {
      await method(url, nuevoDocente, { withCredentials: true });
      // Refrescar lista
      const res = await axios.get(`${API_BASE}/docentes`, { withCredentials: true });
      setDocentes(res.data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
      // Reset form
      setNuevoDocente({ nombre: '', usuario: '', contrasena: '', materiaId: '' });
      setEditando(null);
      setMostrarFormulario(false);
    } catch (err) {
      console.error('Error guardando docente:', err);
      alert(err.response?.data?.message || 'No se pudo guardar el docente.');
    }
  };

  const eliminarDocente = async usuario => {
    if (!window.confirm('¿Eliminar este docente?')) return;
    try {
      await axios.delete(`${API_BASE}/docentes/${encodeURIComponent(usuario)}`, {
        withCredentials: true
      });
      // Refrescar lista tras borrado
      const res = await axios.get(`${API_BASE}/docentes`, { withCredentials: true });
      setDocentes(res.data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
    } catch (err) {
      console.error('Error eliminando docente:', err);
      alert(err.response?.data?.message || 'No se pudo eliminar el docente.');
    }
  };

  const editarDocente = d => {
    setNuevoDocente({
      nombre: d.nombre,
      usuario: d.usuario,
      contrasena: d.contrasena,
      materiaId: d.materiaId
    });
    setEditando(d.usuario);
    setMostrarFormulario(true);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <img
            src="https://www.utacapulco.edu.mx/UTANUEVA4/img/LOGO%20UTA.png"
            alt="Logo Universidad"
            className="sidebar-logo"
          />
          <h2 className="sidebar-title">Sistema de Horarios</h2>
        </div>
        <nav>
          <ul>
            <li><Link to="/admin-panel">📋 Panel principal</Link></li>
            <li><Link to="/admin-panel/docentes">🧑‍🏫 Docentes</Link></li>
            <li><Link to="/admin-panel/materias">📚 Materias</Link></li>
            <li><Link to="/admin-panel/asignar-horarios">🗓️ Asignar Horarios</Link></li>
            <li><Link to="/admin-panel/horarios">🕑 Historial de Horarios</Link></li>
            <li><Link to="/">🔒 Cerrar sesión</Link></li>
          </ul>
        </nav>
      </aside>

      <motion.main
        className="admin-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="top-bar">
          <h2>👨‍🏫 Lista de Docentes</h2>
          <Link to="/admin-panel" className="btn-regresar">⬅️ Regresar</Link>
        </div>

        <motion.table
          className="tabla-docentes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Contraseña</th>
              <th>Materia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map(d => (
              <motion.tr
                key={d.usuario}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <td>{d.nombre}</td>
                <td>{d.usuario}</td>
                <td>{d.contrasena}</td>
                <td>{d.materia}</td>
                <td className="acciones">
                  <button onClick={() => editarDocente(d)}>✏️</button>
                  <button onClick={() => eliminarDocente(d.usuario)}>🗑️</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>

        <h3
          onClick={() => setMostrarFormulario(prev => !prev)}
          style={{ cursor: 'pointer', marginTop: '1rem' }}
        >
          {mostrarFormulario ? '🔽 Ocultar formulario' : '➕ Agregar Nuevo Docente'}
        </h3>

        {mostrarFormulario && (
          <motion.form
            className="form-docente"
            onSubmit={guardarDocente}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <input
              name="nombre"
              placeholder="Nombre"
              value={nuevoDocente.nombre}
              onChange={handleChange}
              required
            />
            <input
              name="usuario"
              placeholder="Usuario"
              value={nuevoDocente.usuario}
              onChange={handleChange}
              required
              disabled={!!editando}
            />
            <input
              name="contrasena"
              type="password"
              placeholder="Contraseña"
              value={nuevoDocente.contrasena}
              onChange={handleChange}
              required
            />
            <select
              name="materiaId"
              value={nuevoDocente.materiaId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona materia</option>
              {opcionesMaterias.map(m => (
                <option key={m.id} value={m.id}>
                  {m.carrera} – {m.materia} ({m.grupo})
                </option>
              ))}
            </select>
            <button type="submit">
              {editando ? 'Actualizar' : 'Guardar'}
            </button>
          </motion.form>
        )}
      </motion.main>
    </div>
  );
}
