// src/pages/AsignarHorarios.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './asignar.css';

// Constantes definidas fuera del componente
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const HORAS = [
  "12:30-13:20", "13:20-14:10", "14:10-15:00",
  "15:00-15:10", // Receso
  "15:10-16:00", "16:00-16:50", "16:50-17:40",
  "17:40-18:30", "18:30-19:20"
];
const CARRERAS = [
  { id: 1, nombre: "Gastronomía" },
  { id: 2, nombre: "Mantenimiento Industrial" },
  { id: 3, nombre: "Desarrollo y Gestión de Software" },
  { id: 4, nombre: "Innovación de Negocios y Mercadotecnia" }
];
const GRUPOS = ["A", "B", "C"];

const AsignarHorarios = () => {
  const [formData, setFormData] = useState({
    grupoId: '',
    cuatrimestre: '',
    carreraId: '',
    aula: ''
  });
  const [materias, setMaterias] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab] = useState('asignacion');
  const [sugerencia, setSugerencia] = useState('');
  const navigate = useNavigate();

  // Carga inicial de materias y prepara el calendario
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/materias-con-docentes', { withCredentials: true });
        setMaterias(res.data);
        // Inicializar asignaciones vacías
        const inicial = {};
        DIAS.forEach(dia =>
          HORAS.forEach(hora =>
            inicial[`${dia}-${hora}`] = ''
          )
        );
        setAsignaciones(inicial);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor recarga la página.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = ({ target: { name, value } }) => {
    if (name === 'aula' && !/^\d{0,3}$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarHorarioCompleto = async () => {
    const { grupoId, cuatrimestre, carreraId, aula } = formData;
    if (!grupoId || !cuatrimestre || !carreraId || !aula) {
      alert("Completa todos los campos, incluyendo el aula.");
      return;
    }
    if (!/^\d{1,3}$/.test(aula)) {
      alert("El aula debe ser un número de hasta 3 dígitos.");
      return;
    }

    // Construir el array de asignaciones
    const payload = Object.entries(asignaciones)
      .filter(([, mid]) => mid !== '')
      .map(([clave, mid]) => {
        const [dia, ...horaArr] = clave.split('-');
        const hora = horaArr.join('-');
        const mat = materias.find(m => String(m.id) === mid);
        if (!mat) throw new Error(`Materia no encontrada para ID ${mid}`);
        return {
          dia,
          hora,
          materia_id: mat.id,
          docente_id: mat.docente_id,
          aula,
          grupo_id: Number(grupoId),
          cuatrimestre: Number(cuatrimestre),
          carrera_id: Number(carreraId)
        };
      });

    // Verificar conflictos
    const seen = new Set();
    const conflictos = payload.filter(item => {
      const key = `${item.dia}-${item.hora}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (conflictos.length > 0) {
      alert(`Hay ${conflictos.length} conflicto(s) de horario.`);
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(
        'http://localhost:5000/api/asignaciones/masivo',
        { asignaciones: payload },
        { withCredentials: true }
      );
      alert('Horario asignado con éxito!');
      navigate('/admin-panel/horarios');
    } catch (err) {
      console.error('Error al guardar horario:', err);
      alert(err.response?.data?.message || 'Error al guardar horario.');
    } finally {
      setIsLoading(false);
    }
  };

  const obtenerSugerenciaIA = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/sugerencia-horario',
        {
          carrera: formData.carreraId,
          cuatrimestre: formData.cuatrimestre,
          grupo: formData.grupoId,
          materias: materias.map(m => ({
            materia: m.materia,
            docente: m.docente_nombre
          }))
        },
        { withCredentials: true }
      );
      setSugerencia(res.data.sugerencia);
    } catch (err) {
      console.error('Error IA:', err);
      alert('Error al obtener sugerencia de la IA.');
    }
  };

  const isConflict = (dia, hora, mid) => {
    if (!mid) return false;
    const clave = `${dia}-${hora}`;
    return Object.entries(asignaciones)
      .filter(([k, v]) => v === mid && k !== clave)
      .some(([k]) => k.startsWith(dia) && k.endsWith(hora));
  };

  if (isLoading) return <div className="loading-screen">Cargando horarios...</div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <div className="professional-container">
      <div className="admin-header">
        <div className="top-header-bar">
          <Link to="/admin-panel" className="btn-regresar">🔙 Regresar</Link>
        </div>
        <h1 className="animated-title">SISTEMA DE GESTIÓN DE HORARIOS</h1>
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'asignacion' ? 'active' : ''}`}
            onClick={() => {/* solo hay una pestaña por ahora */}}
          >
            Asignación de horarios
          </button>
        </div>
      </div>

      <div className="schedule-section">
        <div className="section-header">
          <h2>Asignar horarios académicos</h2>
          <p>Completa los campos y asigna materias a los horarios disponibles.</p>
        </div>

        <div className="form-grid">
          <div className="form-card">
            <label>Carrera</label>
            <select name="carreraId" value={formData.carreraId} onChange={handleInputChange}>
              <option value="">Seleccione carrera</option>
              {CARRERAS.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-card">
            <label>Cuatrimestre</label>
            <select name="cuatrimestre" value={formData.cuatrimestre} onChange={handleInputChange}>
              <option value="">Seleccione cuatrimestre</option>
              {[...Array(11)].map((_, i) => (
                <option key={i} value={i+1}>{i+1}°</option>
              ))}
            </select>
          </div>

          <div className="form-card">
            <label>Grupo</label>
            <select name="grupoId" value={formData.grupoId} onChange={handleInputChange}>
              <option value="">Seleccione grupo</option>
              {GRUPOS.map((g, i) => (
                <option key={g} value={i+1}>Grupo {g}</option>
              ))}
            </select>
          </div>

          <div className="form-card">
            <label>Aula</label>
            <div className="input-with-icon">
              <input
                type="text"
                name="aula"
                value={formData.aula}
                onChange={handleInputChange}
                placeholder="Ej. 201"
                maxLength="3"
              />
              <span className="input-icon">#</span>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Hora</th>
                {DIAS.map(dia => <th key={dia}>{dia}</th>)}
              </tr>
            </thead>
            <tbody>
              {HORAS.map(hora => (
                <tr key={hora}>
                  <td className={hora === "15:00-15:10" ? 'recess-cell' : ''}>{hora}</td>
                  {DIAS.map(dia => {
                    const key = `${dia}-${hora}`;
                    const mid = asignaciones[key];
                    const receso = hora === "15:00-15:10";
                    const conflict = isConflict(dia, hora, mid);
                    return (
                      <td
                        key={key}
                        className={`${receso ? 'recess-cell' : ''} ${conflict ? 'conflict-cell' : ''}`}
                      >
                        {receso ? (
                          <div className="recess-label">RECESO</div>
                        ) : (
                          <select
                            value={mid}
                            onChange={e => setAsignaciones({
                              ...asignaciones,
                              [key]: e.target.value
                            })}
                          >
                            <option value="">Seleccionar</option>
                            {materias.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.materia} - {m.docente_nombre}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button
            onClick={handleGuardarHorarioCompleto}
            disabled={isLoading}
            className="primary-button"
          >
            {isLoading ? 'Guardando...' : 'Guardar Horario Completo'}
          </button>
          <button onClick={obtenerSugerenciaIA} className="primary-button">
            🤖 Sugerir Horario con IA
          </button>
        </div>

        {sugerencia && (
          <div className="sugerencia-box">
            <h4>Horario sugerido por IA:</h4>
            <pre>{sugerencia}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignarHorarios;
