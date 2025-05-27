'use client';

import { useState } from 'react';
import { FaceSession } from './FaceSessionTracker';
import { FaPlay, FaStop, FaTrophy, FaMedal, FaStar, FaCrown, FaHeartbeat, FaExclamationTriangle, FaSkull, FaClock, FaCheckCircle } from 'react-icons/fa';

interface SessionHistoryProps {
  sessions: FaceSession[];
  onClearSessions: () => void;
}

export default function SessionHistory({ sessions, onClearSessions }: SessionHistoryProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'duration'>('recent');

  // Ordenar sesiones según el criterio seleccionado
  const sortedSessions = [...sessions].sort((a: FaceSession, b: FaceSession) => {
    if (sortBy === 'duration') {
      return b.duration - a.duration; // Mayor duración primero
    }
    // Por defecto, ordenar por fecha más reciente primero
    return (b.endTime || b.startTime) - (a.endTime || a.startTime);
  });

  // Función para obtener el distintivo de salud según la duración
  const getHealthBadge = (duration: number) => {
    const minutes = duration / 60;
    
    if (minutes < 1) {
      return {
        icon: <FaClock className="text-gray-400 text-xs" />,
        text: "Muy Corta",
        color: "text-gray-400",
        title: "Menos de 1 minuto - Sesión muy breve"
      };
    } else if (minutes < 5) {
      return {
        icon: <FaCheckCircle className="text-green-400 text-xs" />,
        text: "Corta",
        color: "text-green-400",
        title: "1-5 minutos - Duración saludable para descansos"
      };
    } else if (minutes < 15) {
      return {
        icon: <FaHeartbeat className="text-blue-400 text-xs" />,
        text: "Normal",
        color: "text-blue-400",
        title: "5-15 minutos - Duración normal y saludable"
      };
    } else if (minutes < 30) {
      return {
        icon: <FaHeartbeat className="text-cyan-400 text-xs" />,
        text: "Buena",
        color: "text-cyan-400",
        title: "15-30 minutos - Buena duración de concentración"
      };
    } else if (minutes < 60) {
      return {
        icon: <FaExclamationTriangle className="text-yellow-400 text-xs" />,
        text: "Larga",
        color: "text-yellow-400",
        title: "30-60 minutos - Considera tomar un descanso"
      };
    } else if (minutes < 120) {
      return {
        icon: <FaExclamationTriangle className="text-orange-400 text-xs" />,
        text: "Muy Larga",
        color: "text-orange-400",
        title: "1-2 horas - Tiempo prolongado, descanso recomendado"
      };
    } else if (minutes < 180) {
      return {
        icon: <FaSkull className="text-red-400 text-xs" />,
        text: "Extrema",
        color: "text-red-400",
        title: "2-3 horas - Duración extrema, riesgo para la salud"
      };
    } else {
      return {
        icon: <FaSkull className="text-red-600 text-xs" />,
        text: "Crítica",
        color: "text-red-600",
        title: "Más de 3 horas - Duración crítica, alto riesgo para la salud"
      };
    }
  };

  // Función para obtener el distintivo según la duración
  const getDurationBadge = (session: FaceSession, index: number, allSessions: FaceSession[]) => {
    // Ordenar todas las sesiones por duración para determinar rankings
    const sessionsByDuration = [...allSessions].sort((a, b) => b.duration - a.duration);
    const rank = sessionsByDuration.findIndex(s => s.id === session.id) + 1;
    const totalSessions = allSessions.length;
    
    // Solo mostrar distintivos si hay al menos 2 sesiones
    if (totalSessions < 2) return null;
    
    // Sesión más larga (1er lugar)
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1">
          <FaCrown className="text-yellow-400 text-sm" />
          <span className="text-yellow-400 text-xs font-bold">Récord</span>
        </div>
      );
    }
    
    // Segunda sesión más larga
    if (rank === 2 && totalSessions >= 3) {
      return (
        <div className="flex items-center gap-1">
          <FaTrophy className="text-amber-400 text-sm" />
          <span className="text-amber-400 text-xs font-medium">2º Lugar</span>
        </div>
      );
    }
    
    // Tercera sesión más larga
    if (rank === 3 && totalSessions >= 4) {
      return (
        <div className="flex items-center gap-1">
          <FaMedal className="text-orange-400 text-sm" />
          <span className="text-orange-400 text-xs font-medium">3º Lugar</span>
        </div>
      );
    }
    
    // Sesiones destacadas (top 25% pero no en los primeros 3 lugares)
    if (rank <= Math.max(1, Math.ceil(totalSessions * 0.25)) && rank > 3) {
      return (
        <div className="flex items-center gap-1">
          <FaStar className="text-blue-400 text-sm" />
          <span className="text-blue-400 text-xs">Top</span>
        </div>
      );
    }
    
    return null;
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h.toString().padStart(2, '0'),
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  };

  const formatTimeWithAMPM = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <div className="border-t border-gray-700 pt-4 flex-1 flex flex-col min-h-0">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
        <h4 className="text-sm font-medium text-gray-300">Historial de Sesiones</h4>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'duration')}
            className="text-xs bg-gray-800 text-white px-2 py-1 rounded-lg border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="recent">Más recientes primero</option>
            <option value="duration">Mayor duración</option>
          </select>
          {sessions.length > 0 && (
            <button 
              onClick={onClearSessions}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
              title="Borrar historial"
            >
              Borrar todo
            </button>
          )}
        </div>
      </div>
      {sessions.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-hide" style={{ maxHeight: 'calc(100% - 40px)' }}>
          {sortedSessions.map((session, index) => {
            const badge = getDurationBadge(session, index, sessions);
            const healthBadge = getHealthBadge(session.duration);
            return (
              <div key={session.id} className="text-xs p-2 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <FaPlay className="text-green-400 text-xs mr-1" />
                    <span className="text-gray-400 text-xs">Inicio:</span>
                  </div>
                  <span className="text-gray-300 text-xs">{formatTimeWithAMPM(session.startTime)}</span>
                </div>
                {session.endTime && (
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <FaStop className="text-red-400 text-xs mr-1" />
                      <span className="text-gray-400 text-xs">Fin:</span>
                    </div>
                    <span className="text-gray-300 text-xs">{formatTimeWithAMPM(session.endTime)}</span>
                  </div>
                )}
                <div className="text-center py-1 px-2 bg-gray-700 bg-opacity-50 rounded relative">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xs text-gray-400">Duración</div>
                    {badge && badge}
                  </div>
                  <div className="text-lg font-bold text-white">{formatDuration(session.duration)}</div>
                  
                  {/* Distintivo de salud en esquina inferior derecha */}
                  <div 
                    className="absolute bottom-1 right-1 flex items-center gap-1"
                    title={healthBadge.title}
                  >
                    {healthBadge.icon}
                    <span className={`text-xs ${healthBadge.color}`}>
                      {healthBadge.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No hay sesiones registradas</p>
      )}
    </div>
  );
}
