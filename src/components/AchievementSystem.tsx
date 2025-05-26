"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaCrown, 
  FaMedal, 
  FaStar, 
  FaFire, 
  FaClock, 
  FaCalendarAlt, 
  FaEye, 
  FaMoon, 
  FaSun, 
  FaGem, 
  FaRocket, 
  FaBolt, 
  FaHeart, 
  FaShieldAlt, 
  FaMagic, 
  FaInfinity, 
  FaThumbsUp, 
  FaBrain, 
  FaBullseye, 
  FaAward, 
  FaChartLine, 
  FaLightbulb, 
  FaFlask, 
  FaSnowflake, 
  FaCircle 
} from 'react-icons/fa';

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
  maxProgress: number;
  unlocked?: boolean;
  unlockedAt?: number;
  progress?: number;
}

interface AchievementSystemProps {
  sessions: FaceSession[];
  currentSessionTime: number;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ sessions, currentSessionTime }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  const achievementDefinitions: Achievement[] = [
    // Logros básicos
    {
      id: 'first_step',
      title: 'Primer Paso',
      description: 'Completa tu primera sesión de detección facial',
      icon: <FaStar className="text-blue-400" />,
      color: 'bg-blue-500',
      maxProgress: 1
    },
    {
      id: 'initial_focus',
      title: 'Enfoque Inicial',
      description: 'Mantén el enfoque durante 5 minutos',
      icon: <FaEye className="text-green-400" />,
      color: 'bg-green-500',
      maxProgress: 300
    },
    {
      id: 'deep_concentration',
      title: 'Concentración Profunda',
      description: 'Mantén el enfoque durante 30 minutos',
      icon: <FaMedal className="text-bronze-400" />,
      color: 'bg-gradient-to-r from-orange-400 to-red-500',
      maxProgress: 1800
    },
    {
      id: 'focus_master',
      title: 'Maestro del Enfoque',
      description: 'Mantén el enfoque durante 1 hora',
      icon: <FaTrophy className="text-gold-400" />,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      maxProgress: 3600
    },
    {
      id: 'marathon_focus',
      title: 'Maratón de Enfoque',
      description: 'Mantén el enfoque durante 2 horas',
      icon: <FaRocket className="text-purple-400" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      maxProgress: 7200
    },
    {
      id: 'legendary_focus',
      title: 'Enfoque Legendario',
      description: 'Mantén el enfoque durante 3 horas',
      icon: <FaCrown className="text-gold-500" />,
      color: 'bg-gradient-to-r from-yellow-500 to-red-500',
      maxProgress: 10800
    },
    
    // Logros de horarios
    {
      id: 'early_bird',
      title: 'Madrugador',
      description: 'Completa una sesión antes de las 7:00 AM',
      icon: <FaSun className="text-yellow-400" />,
      color: 'bg-yellow-500',
      maxProgress: 1
    },
    {
      id: 'night_owl',
      title: 'Búho Nocturno',
      description: 'Completa una sesión después de las 11:00 PM',
      icon: <FaMoon className="text-purple-400" />,
      color: 'bg-purple-500',
      maxProgress: 1
    },
    {
      id: 'midnight_warrior',
      title: 'Guerrero de Medianoche',
      description: 'Completa una sesión después de las 12:00 AM',
      icon: <FaSnowflake className="text-blue-300" />,
      color: 'bg-gradient-to-r from-blue-600 to-purple-600',
      maxProgress: 1
    },
    
    // Logros de sesiones consecutivas
    {
      id: 'consistency_starter',
      title: 'Iniciando Constancia',
      description: 'Completa sesiones 3 días seguidos',
      icon: <FaFire className="text-orange-400" />,
      color: 'bg-orange-500',
      maxProgress: 3
    },
    {
      id: 'consistency_builder',
      title: 'Construyendo Hábito',
      description: 'Completa sesiones 7 días seguidos',
      icon: <FaChartLine className="text-green-500" />,
      color: 'bg-green-600',
      maxProgress: 7
    },
    {
      id: 'consistency_master',
      title: 'Maestro de la Constancia',
      description: 'Completa sesiones 14 días seguidos',
      icon: <FaAward className="text-blue-500" />,
      color: 'bg-blue-600',
      maxProgress: 14
    },
    {
      id: 'consistency_legend',
      title: 'Leyenda de Constancia',
      description: 'Completa sesiones 30 días seguidos',
      icon: <FaCircle className="text-cyan-400" />,
      color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      maxProgress: 30
    },
    
    // Logros de número total de sesiones
    {
      id: 'session_explorer',
      title: 'Explorador',
      description: 'Completa 10 sesiones en total',
      icon: <FaLightbulb className="text-yellow-500" />,
      color: 'bg-yellow-600',
      maxProgress: 10
    },
    {
      id: 'session_adventurer',
      title: 'Aventurero',
      description: 'Completa 25 sesiones en total',
      icon: <FaFlask className="text-orange-500" />,
      color: 'bg-orange-600',
      maxProgress: 25
    },
    {
      id: 'session_veteran',
      title: 'Veterano',
      description: 'Completa 50 sesiones en total',
      icon: <FaCrown className="text-gold-400" />,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      maxProgress: 50
    },
    {
      id: 'session_master',
      title: 'Maestro de Sesiones',
      description: 'Completa 75 sesiones en total',
      icon: <FaGem className="text-purple-500" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      maxProgress: 75
    },
    {
      id: 'session_legend',
      title: 'Leyenda de Sesiones',
      description: 'Completa 100 sesiones en total',
      icon: <FaTrophy className="text-gold-500" />,
      color: 'bg-gradient-to-r from-yellow-500 to-red-500',
      maxProgress: 100
    },
    {
      id: 'session_immortal',
      title: 'Inmortal',
      description: 'Completa 200 sesiones en total',
      icon: <FaInfinity className="text-cyan-500" />,
      color: 'bg-gradient-to-r from-cyan-400 to-purple-500',
      maxProgress: 200
    },
    {
      id: 'session_god',
      title: 'Dios del Enfoque',
      description: 'Completa 500 sesiones en total',
      icon: <FaCrown className="text-gold-600" />,
      color: 'bg-gradient-to-r from-yellow-600 to-red-600',
      maxProgress: 500
    },
    
    // Logros de días productivos
    {
      id: 'productive_day',
      title: 'Día Productivo',
      description: 'Acumula 2 horas de enfoque en un día',
      icon: <FaCalendarAlt className="text-green-400" />,
      color: 'bg-green-500',
      maxProgress: 7200
    },
    {
      id: 'super_productive',
      title: 'Súper Productivo',
      description: 'Acumula 4 horas de enfoque en un día',
      icon: <FaRocket className="text-blue-500" />,
      color: 'bg-blue-600',
      maxProgress: 14400
    },
    {
      id: 'ultra_productive',
      title: 'Ultra Productivo',
      description: 'Acumula 6 horas de enfoque en un día',
      icon: <FaBolt className="text-yellow-500" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      maxProgress: 21600
    },
    {
      id: 'legendary_productive',
      title: 'Productividad Legendaria',
      description: 'Acumula 8 horas de enfoque en un día',
      icon: <FaMagic className="text-purple-500" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      maxProgress: 28800
    },
    
    // Logros especiales
    {
      id: 'perfectionist',
      title: 'Perfeccionista',
      description: 'Completa 5 sesiones de más de 1 hora',
      icon: <FaBullseye className="text-red-500" />,
      color: 'bg-red-600',
      maxProgress: 5
    },
    {
      id: 'dedication_master',
      title: 'Maestro de la Dedicación',
      description: 'Completa 10 sesiones de más de 30 minutos',
      icon: <FaHeart className="text-pink-500" />,
      color: 'bg-pink-600',
      maxProgress: 10
    },
    {
      id: 'focus_champion',
      title: 'Campeón del Enfoque',
      description: 'Completa 20 sesiones de más de 15 minutos',
      icon: <FaShieldAlt className="text-blue-600" />,
      color: 'bg-blue-700',
      maxProgress: 20
    }
  ];

  useEffect(() => {
    const newAchievements = achievementDefinitions.map(def => {
      const existing = achievements.find(a => a.id === def.id);
      let unlocked = existing?.unlocked || false;
      let progress = 0;
      let unlockedAt = existing?.unlockedAt;

      switch (def.id) {
        case 'first_step':
          progress = sessions.length > 0 ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'initial_focus':
          const has5Min = sessions.some(s => s.duration >= 300) || currentSessionTime >= 300;
          progress = has5Min ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'deep_concentration':
          const has30Min = sessions.some(s => s.duration >= 1800) || currentSessionTime >= 1800;
          progress = has30Min ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'focus_master':
          const has1Hour = sessions.some(s => s.duration >= 3600) || currentSessionTime >= 3600;
          progress = has1Hour ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'marathon_focus':
          const has2Hours = sessions.some(s => s.duration >= 7200) || currentSessionTime >= 7200;
          progress = has2Hours ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'legendary_focus':
          const has3Hours = sessions.some(s => s.duration >= 10800) || currentSessionTime >= 10800;
          progress = has3Hours ? 1 : 0;
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

        case 'midnight_warrior':
          const hasMidnightSession = sessions.some(s => {
            const hour = new Date(s.startTime).getHours();
            return hour >= 0 && hour < 1;
          });
          progress = hasMidnightSession ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'consistency_starter':
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

        case 'consistency_builder':
          // Calcular streak simple basado en días únicos
          const uniqueDaysBuilder = new Set(sessions.map(s => 
            new Date(s.startTime).toDateString()
          ));
          progress = Math.min(uniqueDaysBuilder.size, 7);
          if (!unlocked && progress >= 7) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'consistency_master':
          // Calcular streak simple basado en días únicos
          const uniqueDaysMaster = new Set(sessions.map(s => 
            new Date(s.startTime).toDateString()
          ));
          progress = Math.min(uniqueDaysMaster.size, 14);
          if (!unlocked && progress >= 14) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'consistency_legend':
          // Calcular streak simple basado en días únicos
          const uniqueDaysLegend = new Set(sessions.map(s => 
            new Date(s.startTime).toDateString()
          ));
          progress = Math.min(uniqueDaysLegend.size, 30);
          if (!unlocked && progress >= 30) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'session_explorer':
          progress = Math.min(sessions.length, 10);
          if (!unlocked && progress >= 10) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'session_adventurer':
          progress = Math.min(sessions.length, 25);
          if (!unlocked && progress >= 25) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'session_veteran':
          progress = Math.min(sessions.length, 50);
          if (!unlocked && progress >= 50) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'session_master':
          progress = Math.min(sessions.length, 75);
          if (!unlocked && progress >= 75) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'session_legend':
          progress = Math.min(sessions.length, 100);
          if (!unlocked && progress >= 100) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'session_immortal':
          progress = Math.min(sessions.length, 200);
          if (!unlocked && progress >= 200) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'session_god':
          progress = Math.min(sessions.length, 500);
          if (!unlocked && progress >= 500) {
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

        case 'super_productive':
          // Verificar si hay un día con más de 4 horas
          const dayTotalsSuper = sessions.reduce((acc, session) => {
            const day = new Date(session.startTime).toDateString();
            acc[day] = (acc[day] || 0) + session.duration;
            return acc;
          }, {} as Record<string, number>);
          
          const hasSuperProductiveDay = Object.values(dayTotalsSuper).some(total => total >= 14400);
          progress = hasSuperProductiveDay ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'ultra_productive':
          // Verificar si hay un día con más de 6 horas
          const dayTotalsUltra = sessions.reduce((acc, session) => {
            const day = new Date(session.startTime).toDateString();
            acc[day] = (acc[day] || 0) + session.duration;
            return acc;
          }, {} as Record<string, number>);
          
          const hasUltraProductiveDay = Object.values(dayTotalsUltra).some(total => total >= 21600);
          progress = hasUltraProductiveDay ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'legendary_productive':
          // Verificar si hay un día con más de 8 horas
          const dayTotalsLegendary = sessions.reduce((acc, session) => {
            const day = new Date(session.startTime).toDateString();
            acc[day] = (acc[day] || 0) + session.duration;
            return acc;
          }, {} as Record<string, number>);
          
          const hasLegendaryProductiveDay = Object.values(dayTotalsLegendary).some(total => total >= 28800);
          progress = hasLegendaryProductiveDay ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'perfectionist':
          progress = sessions.filter(s => s.duration >= 3600).length;
          if (!unlocked && progress >= 5) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'dedication_master':
          progress = sessions.filter(s => s.duration >= 1800).length;
          if (!unlocked && progress >= 10) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'focus_champion':
          progress = sessions.filter(s => s.duration >= 900).length;
          if (!unlocked && progress >= 20) {
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
  const totalAchievements = achievementDefinitions.length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  return (
    <div className="p-4 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 h-[280px] overflow-y-auto">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            <FaTrophy className="text-yellow-400" />
            Logros
          </h3>
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-blue-400">{unlockedCount}/{totalAchievements}</span> logros desbloqueados
          </div>
        </div>
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
};

export default AchievementSystem;
