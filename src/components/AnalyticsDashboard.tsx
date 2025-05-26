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

const SpiralChart: React.FC<SpiralChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map((d: { value: number }) => d.value));

  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <div className="relative w-24 h-24">
        {data.map((item, index) => {
          const angle = (index / 24) * 360;
          const radius = 40;
          const intensity = maxValue > 0 ? (item.value / maxValue) : 0;
          const size = 2 + intensity * 4;
          
          const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
          const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
          
          return (
            <div
              key={index}
              className={`absolute rounded-full ${item.color} transition-all duration-300`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `calc(50% + ${x}px - ${size/2}px)`,
                top: `calc(50% + ${y}px - ${size/2}px)`,
                opacity: 0.3 + intensity * 0.7
              }}
              title={`${item.hour}:00 - ${Math.round(item.value / 60)}min`}
            />
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-gray-400 text-center">
            <div>24h</div>
            <div>Patrón</div>
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

  const formatHour = (hour: number) => {
    return hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
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
            <SpiralChart data={analytics.hourData} />
            <div className="text-xs text-gray-400 text-center mt-2">
              Centro = 12 AM • Exterior = Mayor actividad
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
