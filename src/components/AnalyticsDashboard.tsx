"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FaChartBar, FaChartPie, FaClock, FaCalendarWeek, FaArrowUp, FaEye } from 'react-icons/fa';

interface FaceSession {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
}

interface AnalyticsDashboardProps {
  sessions: FaceSession[];
  currentSessionTime: number;
}

interface DayData {
  day: string;
  totalTime: number;
  sessionCount: number;
  avgSession: number;
}

interface HourData {
  hour: number;
  totalTime: number;
  sessionCount: number;
}

export default function AnalyticsDashboard({ sessions, currentSessionTime }: AnalyticsDashboardProps) {
  const [viewMode, setViewMode] = useState<'week' | 'hours'>('week');

  // Procesar datos para gráficos
  const analytics = useMemo(() => {
    // Datos por día de la semana
    const weekData: DayData[] = [
      { day: 'Lun', totalTime: 0, sessionCount: 0, avgSession: 0 },
      { day: 'Mar', totalTime: 0, sessionCount: 0, avgSession: 0 },
      { day: 'Mié', totalTime: 0, sessionCount: 0, avgSession: 0 },
      { day: 'Jue', totalTime: 0, sessionCount: 0, avgSession: 0 },
      { day: 'Vie', totalTime: 0, sessionCount: 0, avgSession: 0 },
      { day: 'Sáb', totalTime: 0, sessionCount: 0, avgSession: 0 },
      { day: 'Dom', totalTime: 0, sessionCount: 0, avgSession: 0 }
    ];

    // Datos por hora del día
    const hourData: HourData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      totalTime: 0,
      sessionCount: 0
    }));

    sessions.forEach(session => {
      const date = new Date(session.startTime);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      // Ajustar domingo (0) al final
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      weekData[adjustedDay].totalTime += session.duration;
      weekData[adjustedDay].sessionCount += 1;

      hourData[hour].totalTime += session.duration;
      hourData[hour].sessionCount += 1;
    });

    // Calcular promedios
    weekData.forEach(day => {
      day.avgSession = day.sessionCount > 0 ? day.totalTime / day.sessionCount : 0;
    });

    // Estadísticas generales
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0) + currentSessionTime;
    const totalSessions = sessions.length + (currentSessionTime > 0 ? 1 : 0);
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    const longestSession = Math.max(...sessions.map(s => s.duration), currentSessionTime);

    return {
      weekData,
      hourData,
      totalTime,
      totalSessions,
      avgSessionTime,
      longestSession
    };
  }, [sessions, currentSessionTime]);

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

  // Componente de gráfico de barras
  const BarChart = ({ data, maxValue }: { data: DayData[], maxValue: number }) => (
    <div className="flex items-end justify-between h-32 px-2">
      {data.map((day, index) => {
        const height = maxValue > 0 ? (day.totalTime / maxValue) * 100 : 0;
        return (
          <div key={day.day} className="flex flex-col items-center flex-1">
            <div className="flex flex-col items-center justify-end h-24 w-full px-1">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500 min-h-[2px]"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${day.day}: ${formatTime(day.totalTime)} (${day.sessionCount} sesiones)`}
              />
            </div>
            <span className="text-xs text-gray-400 mt-1">{day.day}</span>
          </div>
        );
      })}
    </div>
  );

  // Componente de gráfico circular (spiral)
  const SpiralChart = ({ data }: { data: HourData[] }) => {
    const maxHourValue = Math.max(...data.map(h => h.totalTime));
    const centerX = 60;
    const centerY = 60;
    const maxRadius = 45;

    return (
      <div className="flex justify-center">
        <svg width="120" height="120" className="transform rotate-[-90deg]">
          {/* Círculos de fondo */}
          {[0.25, 0.5, 0.75, 1].map(ratio => (
            <circle
              key={ratio}
              cx={centerX}
              cy={centerY}
              r={maxRadius * ratio}
              fill="none"
              stroke="rgba(75, 85, 99, 0.3)"
              strokeWidth="1"
            />
          ))}
          
          {/* Datos en espiral */}
          {data.map((hour, index) => {
            const angle = (index / 24) * 2 * Math.PI;
            const intensity = maxHourValue > 0 ? hour.totalTime / maxHourValue : 0;
            const radius = 10 + (intensity * 35);
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (hour.totalTime === 0) return null;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(2, intensity * 4)}
                  fill={`hsl(${240 + intensity * 60}, 70%, 60%)`}
                  opacity={0.8}
                >
                  <title>{`${formatHour(hour.hour)}: ${formatTime(hour.totalTime)}`}</title>
                </circle>
                {intensity > 0.3 && (
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={`hsl(${240 + intensity * 60}, 50%, 50%)`}
                    strokeWidth="1"
                    opacity="0.4"
                  />
                )}
              </g>
            );
          })}
          
          {/* Centro */}
          <circle
            cx={centerX}
            cy={centerY}
            r="3"
            fill="rgb(147, 197, 253)"
          />
        </svg>
      </div>
    );
  };

  const maxWeekValue = Math.max(...analytics.weekData.map(d => d.totalTime));

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
            onClick={() => setViewMode('hours')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'hours' 
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
            <FaArrowUp />
            Promedio
          </div>
          <div className="text-sm font-semibold text-white">
            {formatTime(analytics.avgSessionTime)}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded border border-gray-600">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <FaChartPie />
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
              <FaCalendarWeek className="text-green-400" />
              Actividad Semanal
            </h4>
            <BarChart data={analytics.weekData} maxValue={maxWeekValue} />
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FaChartPie className="text-purple-400" />
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
}
