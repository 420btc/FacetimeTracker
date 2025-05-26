"use client";

import React, { useState, useMemo } from 'react';
import { FaChartBar, FaClock, FaCalendarDay, FaEye } from 'react-icons/fa';

interface FaceSession {
  id: number;
  startTime: number;
  endTime: number | null;
  duration: number;
}

interface AnalyticsDashboardProps {
  sessions: FaceSession[];
}

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue: number;
}

interface SpiralChartProps {
  data: { hour: number; value: number; color: string }[];
}

const BarChart: React.FC<BarChartProps> = ({ data, maxValue }) => {
  return (
    <div className="space-y-1">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-8">{item.label}</span>
          <div className="flex-1 bg-gray-700 rounded-full h-3 relative overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${item.color}`}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-white w-12 text-right">
            {Math.round(item.value / 60)}min
          </span>
        </div>
      ))}
    </div>
  );
};

const DualSpiralChart: React.FC<SpiralChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map((d: { value: number }) => d.value));

  // Separar datos en día (6 AM - 6 PM) y noche (6 PM - 6 AM)
  const dayData = data.filter(item => item.hour >= 6 && item.hour < 18);
  const nightData = [
    ...data.filter(item => item.hour >= 18 || item.hour < 6)
  ].sort((a, b) => {
    // Ordenar noche: 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5
    const aHour = a.hour >= 18 ? a.hour : a.hour + 24;
    const bHour = b.hour >= 18 ? b.hour : b.hour + 24;
    return aHour - bHour;
  });

  interface SpiralDataItem {
    hour: number;
    value: number;
  }

  const renderSpiral = (spiralData: SpiralDataItem[], centerX: number, centerY: number, radius: number, label: string, isDay: boolean) => {
    return (
      <div className="relative">
        {spiralData.map((item, index) => {
          const angle = (index / 12) * 360;
          const intensity = maxValue > 0 ? (item.value / maxValue) : 0;
          const size = 3 + intensity * 8; // Tamaño más variable (3-11px)
          
          const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
          const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
          
          // Colores diferentes para día y noche
          const baseColor = isDay ? 'bg-yellow-400' : 'bg-blue-400';
          const glowColor = isDay ? 'shadow-yellow-400/50' : 'shadow-blue-400/50';
          
          return (
            <div
              key={`${label}-${index}`}
              className={`absolute rounded-full ${baseColor} transition-all duration-500 ${intensity > 0.3 ? `shadow-lg ${glowColor}` : ''}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${centerX + x - size/2}px`,
                top: `${centerY + y - size/2}px`,
                opacity: 0.4 + intensity * 0.6,
                zIndex: Math.round(intensity * 10)
              }}
              title={`${item.hour}:00 - ${Math.round(item.value / 60)}min`}
            />
          );
        })}
        
        {/* Etiquetas de horas principales */}
        {spiralData.map((item, index) => {
          if (index % 3 === 0) { // Mostrar cada 3 horas
            const angle = (index / 12) * 360;
            const labelRadius = radius + 15;
            const x = Math.cos((angle - 90) * Math.PI / 180) * labelRadius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * labelRadius;
            
            return (
              <div
                key={`label-${label}-${index}`}
                className="absolute text-xs text-gray-400 pointer-events-none"
                style={{
                  left: `${centerX + x - 8}px`,
                  top: `${centerY + y - 6}px`,
                  fontSize: '8px'
                }}
              >
                {item.hour}
              </div>
            );
          }
          return null;
        })}
        
        {/* Centro con etiqueta */}
        <div 
          className="absolute flex items-center justify-center"
          style={{
            left: `${centerX - 20}px`,
            top: `${centerY - 15}px`,
            width: '40px',
            height: '30px'
          }}
        >
          <div className="text-xs text-gray-300 text-center leading-tight">
            <div className={`font-semibold ${isDay ? 'text-yellow-400' : 'text-blue-400'}`} style={{ fontSize: '10px' }}>
              {isDay ? '☀️' : '🌙'}
            </div>
            <div style={{ fontSize: '7px' }}>{label}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-40 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Espiral de día (izquierda) */}
        <div className="absolute left-0 top-0 w-1/2 h-full">
          {renderSpiral(dayData, 80, 80, 35, 'DÍA', true)}
        </div>
        
        {/* Espiral de noche (derecha) */}
        <div className="absolute right-0 top-0 w-1/2 h-full">
          {renderSpiral(nightData, 80, 80, 35, 'NOCHE', false)}
        </div>
        
        {/* Línea divisoria */}
        <div className="absolute left-1/2 top-2 bottom-2 w-px bg-gray-600 transform -translate-x-0.5"></div>
        
        {/* Leyenda */}
        <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-80 rounded-md px-2 py-1 border border-gray-600">
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-300" style={{ fontSize: '8px' }}>Día</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300" style={{ fontSize: '8px' }}>Noche</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sessions }) => {
  const [viewMode, setViewMode] = useState<'week' | 'daily'>('week');

  const analytics = useMemo(() => {
    // Datos por día de la semana
    const weekData: { label: string; value: number; color: string }[] = [
      { label: 'Lun', value: 0, color: 'bg-blue-500' },
      { label: 'Mar', value: 0, color: 'bg-blue-500' },
      { label: 'Mié', value: 0, color: 'bg-blue-500' },
      { label: 'Jue', value: 0, color: 'bg-blue-500' },
      { label: 'Vie', value: 0, color: 'bg-blue-500' },
      { label: 'Sáb', value: 0, color: 'bg-blue-500' },
      { label: 'Dom', value: 0, color: 'bg-blue-500' }
    ];

    // Datos por hora del día
    const hourData: { hour: number; value: number; color: string }[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: 0,
      color: 'bg-purple-500'
    }));

    sessions.forEach(session => {
      const date = new Date(session.startTime);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      // Ajustar domingo (0) al final
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      weekData[adjustedDay].value += session.duration;
      hourData[hour].value += session.duration;
    });

    // Estadísticas generales
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = sessions.length;
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    const longestSession = Math.max(...sessions.map(s => s.duration));

    return {
      weekData,
      hourData,
      totalTime,
      totalSessions,
      avgSessionTime,
      longestSession
    };
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const maxWeekValue = Math.max(...analytics.weekData.map(d => d.value));

  return (
    <div className="p-4 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 h-[280px] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FaChartBar className="text-blue-400" />
          Analytics
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('week')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'daily' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Horas
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-800 p-2 rounded border border-gray-600">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <FaClock />
            Total
          </div>
          <div className="text-sm font-semibold text-white">
            {formatTime(analytics.totalTime)}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded border border-gray-600">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <FaEye />
            Sesiones
          </div>
          <div className="text-sm font-semibold text-white">
            {analytics.totalSessions}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded border border-gray-600">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <FaCalendarDay />
            Promedio
          </div>
          <div className="text-sm font-semibold text-white">
            {formatTime(analytics.avgSessionTime)}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded border border-gray-600">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <FaChartBar />
            Récord
          </div>
          <div className="text-sm font-semibold text-white">
            {formatTime(analytics.longestSession)}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
        {viewMode === 'week' ? (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FaCalendarDay className="text-green-400" />
              Actividad Semanal
            </h4>
            <BarChart data={analytics.weekData} maxValue={maxWeekValue} />
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FaChartBar className="text-purple-400" />
              Patrón Diario (24h)
            </h4>
            <DualSpiralChart data={analytics.hourData} />
            <div className="text-xs text-gray-400 text-center mt-2">
              Tamaño del punto = Tiempo de actividad por hora
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
