"use client";

import React, { useState, useEffect } from 'react';
import { FaTrophy, FaCrown, FaMedal, FaStar, FaFire, FaClock, FaCalendarAlt, FaEye, FaMoon, FaSun } from 'react-icons/fa';

interface FaceSession {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface AchievementSystemProps {
  sessions: FaceSession[];
  currentSessionTime: number;
  isFaceDetected: boolean;
}

export default function AchievementSystem({ sessions, currentSessionTime, isFaceDetected }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  // Definir logros
  const achievementDefinitions: Omit<Achievement, 'unlocked' | 'progress'>[] = [
    {
      id: 'first_session',
      title: 'Primer Paso',
      description: 'Completa tu primera sesión',
      icon: <FaEye className="text-blue-400" />,
      color: 'bg-blue-500',
      maxProgress: 1
    },
    {
      id: 'focused_5min',
      title: 'Enfoque Inicial',
      description: 'Mantén concentración por 5 minutos',
      icon: <FaClock className="text-green-400" />,
      color: 'bg-green-500',
      maxProgress: 1
    },
    {
      id: 'focused_30min',
      title: 'Concentración Profunda',
      description: 'Sesión de 30 minutos sin interrupciones',
      icon: <FaMedal className="text-yellow-400" />,
      color: 'bg-yellow-500',
      maxProgress: 1
    },
    {
      id: 'focused_1hour',
      title: 'Maestro del Enfoque',
      description: 'Sesión de 1 hora completa',
      icon: <FaTrophy className="text-orange-400" />,
      color: 'bg-orange-500',
      maxProgress: 1
    },
    {
      id: 'early_bird',
      title: 'Madrugador',
      description: 'Sesión antes de las 7:00 AM',
      icon: <FaSun className="text-yellow-300" />,
      color: 'bg-yellow-400',
      maxProgress: 1
    },
    {
      id: 'night_owl',
      title: 'Búho Nocturno',
      description: 'Sesión después de las 11:00 PM',
      icon: <FaMoon className="text-purple-400" />,
      color: 'bg-purple-500',
      maxProgress: 1
    },
    {
      id: 'streak_3',
      title: 'Constancia',
      description: 'Usa la app 3 días seguidos',
      icon: <FaFire className="text-red-400" />,
      color: 'bg-red-500',
      maxProgress: 3
    },
    {
      id: 'productive_day',
      title: 'Día Productivo',
      description: 'Acumula 2 horas en un día',
      icon: <FaCalendarAlt className="text-cyan-400" />,
      color: 'bg-cyan-500',
      maxProgress: 1
    },
    {
      id: 'legend',
      title: 'Leyenda',
      description: 'Completa 50 sesiones',
      icon: <FaCrown className="text-gold-400" />,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      maxProgress: 50
    }
  ];

  // Calcular progreso y desbloquear logros
  useEffect(() => {
    const newAchievements = achievementDefinitions.map(def => {
      const existing = achievements.find(a => a.id === def.id);
      let unlocked = existing?.unlocked || false;
      let progress = 0;
      let unlockedAt = existing?.unlockedAt;

      switch (def.id) {
        case 'first_session':
          progress = sessions.length > 0 ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'focused_5min':
          const has5Min = sessions.some(s => s.duration >= 300) || currentSessionTime >= 300;
          progress = has5Min ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'focused_30min':
          const has30Min = sessions.some(s => s.duration >= 1800) || currentSessionTime >= 1800;
          progress = has30Min ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'focused_1hour':
          const has1Hour = sessions.some(s => s.duration >= 3600) || currentSessionTime >= 3600;
          progress = has1Hour ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'early_bird':
          const hasEarlySession = sessions.some(s => {
            const hour = new Date(s.startTime).getHours();
            return hour < 7;
          });
          progress = hasEarlySession ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'night_owl':
          const hasLateSession = sessions.some(s => {
            const hour = new Date(s.startTime).getHours();
            return hour >= 23;
          });
          progress = hasLateSession ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'streak_3':
          // Calcular streak simple basado en días únicos
          const uniqueDays = new Set(sessions.map(s => 
            new Date(s.startTime).toDateString()
          ));
          progress = Math.min(uniqueDays.size, 3);
          if (!unlocked && progress >= 3) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'productive_day':
          // Verificar si hay un día con más de 2 horas
          const dayTotals = sessions.reduce((acc, session) => {
            const day = new Date(session.startTime).toDateString();
            acc[day] = (acc[day] || 0) + session.duration;
            return acc;
          }, {} as Record<string, number>);
          
          const hasProductiveDay = Object.values(dayTotals).some(total => total >= 7200);
          progress = hasProductiveDay ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'legend':
          progress = Math.min(sessions.length, 50);
          if (!unlocked && progress >= 50) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;
      }

      return {
        ...def,
        unlocked,
        progress,
        unlockedAt
      };
    });

    // Solo actualizar si hay cambios reales
    const hasChanges = newAchievements.some((newAch, index) => {
      const oldAch = achievements[index];
      return !oldAch || 
             oldAch.unlocked !== newAch.unlocked || 
             oldAch.progress !== newAch.progress;
    });

    if (hasChanges || achievements.length === 0) {
      setAchievements(newAchievements);

      // Calcular puntos y nivel
      const points = newAchievements.reduce((total, achievement) => {
        if (achievement.unlocked) {
          return total + 100; // 100 puntos por logro
        }
        return total;
      }, 0);

      setTotalPoints(points);
      setUserLevel(Math.floor(points / 300) + 1); // Nivel cada 300 puntos
    }

  }, [sessions, currentSessionTime]); // Remover achievements de las dependencias

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  return (
    <div className="p-4 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 h-[280px] overflow-y-auto">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FaTrophy className="text-yellow-400" />
          Logros
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-300">Nivel {userLevel}</div>
          <div className="text-xs text-gray-400">{totalPoints} puntos</div>
        </div>
      </div>

      {/* Barra de progreso general */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progreso General</span>
          <span>{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Lista de logros */}
      <div className="space-y-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg border transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-gray-800 border-gray-600 shadow-lg'
                : 'bg-gray-900 border-gray-700 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${achievement.unlocked ? achievement.color : 'bg-gray-700'}`}>
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold text-sm ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.title}
                  </h4>
                  {achievement.unlocked && (
                    <FaStar className="text-yellow-400 text-xs" />
                  )}
                </div>
                <p className="text-xs text-gray-400">{achievement.description}</p>
                
                {/* Barra de progreso individual */}
                {achievement.maxProgress && achievement.maxProgress > 1 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress || 0}/{achievement.maxProgress}
                    </div>
                  </div>
                )}
              </div>
              
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-gray-500">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
