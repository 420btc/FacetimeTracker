"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaTrophy, 
  FaCrown, 
  FaMedal, 
  FaStar, 
  FaFire, 
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
  FaBullseye, 
  FaAward, 
  FaChartLine, 
  FaLightbulb, 
  FaFlask, 
  FaSnowflake, 
  FaCircle,
  FaClock,
  FaAtom,
  FaDragon,
  FaFeather,
  FaGhost,
  FaIcicles,
  FaLeaf,
  FaMountain,
  FaPalette,
  FaRainbow,
  FaSpaceShuttle,
  FaTree,
  FaUmbrella,
  FaWater,
  FaWind,
  FaGlobe,
  FaHammer,
  FaKey
} from 'react-icons/fa';

interface FaceSession {
  id: number;
  startTime: number;
  endTime: number | null;
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

  // New state for sorting mode: 'all', 'completed', 'notCompleted'
  const [sortMode, setSortMode] = useState<'all' | 'completed' | 'notCompleted'>('all');

  // Función para calcular días consecutivos
  const calculateConsecutiveDays = (sessions: FaceSession[]): number => {
    if (sessions.length === 0) return 0;
    
    const uniqueDays = [...new Set(sessions.map(s => 
      new Date(s.startTime).toDateString()
    ))].sort();
    
    if (uniqueDays.length === 0) return 0;
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDate = new Date(uniqueDays[i - 1]);
      const currentDate = new Date(uniqueDays[i]);
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }
    
    return maxConsecutive;
  };

  const achievementDefinitions: Achievement[] = useMemo(() => [
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
    },
    
    // Nuevos logros (6 adicionales)
    {
      id: 'time_collector',
      title: 'Coleccionista de Tiempo',
      description: 'Acumula 10 horas totales de enfoque',
      icon: <FaClock className="text-cyan-400" />,
      color: 'bg-cyan-500',
      maxProgress: 36000
    },
    {
      id: 'time_master',
      title: 'Maestro del Tiempo',
      description: 'Acumula 25 horas totales de enfoque',
      icon: <FaInfinity className="text-purple-400" />,
      color: 'bg-purple-600',
      maxProgress: 90000
    },
    {
      id: 'weekend_warrior',
      title: 'Guerrero de Fin de Semana',
      description: 'Completa sesiones en sábado y domingo',
      icon: <FaCalendarAlt className="text-orange-400" />,
      color: 'bg-orange-600',
      maxProgress: 2
    },
    {
      id: 'monday_motivation',
      title: 'Motivación de Lunes',
      description: 'Completa una sesión en lunes',
      icon: <FaRocket className="text-green-400" />,
      color: 'bg-green-600',
      maxProgress: 1
    },
    {
      id: 'speed_demon',
      title: 'Demonio de Velocidad',
      description: 'Completa 10 sesiones de menos de 10 minutos',
      icon: <FaBolt className="text-yellow-400" />,
      color: 'bg-yellow-600',
      maxProgress: 10
    },
    {
      id: 'zen_master',
      title: 'Maestro Zen',
      description: 'Completa una sesión de más de 4 horas',
      icon: <FaMagic className="text-purple-500" />,
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      maxProgress: 1
    },
    
    // 17 Nuevos logros adicionales (34-50)
    {
      id: 'atomic_focus',
      title: 'Enfoque Atómico',
      description: 'Completa 15 sesiones de exactamente 25 minutos (Técnica Pomodoro)',
      icon: <FaAtom className="text-red-400" />,
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      maxProgress: 15
    },
    {
      id: 'dragon_slayer',
      title: 'Cazador de Dragones',
      description: 'Acumula 50 horas totales de enfoque',
      icon: <FaDragon className="text-red-600" />,
      color: 'bg-gradient-to-r from-red-600 to-black',
      maxProgress: 180000
    },
    {
      id: 'feather_light',
      title: 'Pluma Ligera',
      description: 'Completa 25 sesiones de menos de 5 minutos',
      icon: <FaFeather className="text-cyan-300" />,
      color: 'bg-gradient-to-r from-cyan-300 to-blue-300',
      maxProgress: 25
    },
    {
      id: 'ghost_mode',
      title: 'Modo Fantasma',
      description: 'Completa una sesión entre las 2:00 AM y 4:00 AM',
      icon: <FaGhost className="text-gray-300" />,
      color: 'bg-gradient-to-r from-gray-600 to-purple-800',
      maxProgress: 1
    },
    {
      id: 'ice_breaker',
      title: 'Rompe Hielos',
      description: 'Completa tu primera sesión después de 7 días de inactividad',
      icon: <FaIcicles className="text-blue-200" />,
      color: 'bg-gradient-to-r from-blue-200 to-cyan-400',
      maxProgress: 1
    },
    {
      id: 'nature_lover',
      title: 'Amante de la Naturaleza',
      description: 'Completa sesiones durante 4 estaciones diferentes (basado en meses)',
      icon: <FaLeaf className="text-green-500" />,
      color: 'bg-gradient-to-r from-green-400 to-emerald-500',
      maxProgress: 4
    },
    {
      id: 'mountain_climber',
      title: 'Escalador de Montañas',
      description: 'Alcanza 1000 sesiones totales',
      icon: <FaMountain className="text-gray-600" />,
      color: 'bg-gradient-to-r from-gray-500 to-stone-600',
      maxProgress: 1000
    },
    {
      id: 'artist_soul',
      title: 'Alma de Artista',
      description: 'Completa sesiones en 7 días diferentes de la semana',
      icon: <FaPalette className="text-pink-400" />,
      color: 'bg-gradient-to-r from-pink-400 to-purple-500',
      maxProgress: 7
    },
    {
      id: 'rainbow_warrior',
      title: 'Guerrero del Arcoíris',
      description: 'Desbloquea 25 logros diferentes',
      icon: <FaRainbow className="text-yellow-300" />,
      color: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400',
      maxProgress: 25
    },
    {
      id: 'space_explorer',
      title: 'Explorador Espacial',
      description: 'Acumula 100 horas totales de enfoque',
      icon: <FaSpaceShuttle className="text-indigo-400" />,
      color: 'bg-gradient-to-r from-indigo-600 to-purple-700',
      maxProgress: 360000
    },
    {
      id: 'tree_hugger',
      title: 'Abrazador de Árboles',
      description: 'Mantén una racha de 60 días consecutivos',
      icon: <FaTree className="text-green-600" />,
      color: 'bg-gradient-to-r from-green-600 to-emerald-700',
      maxProgress: 60
    },
    {
      id: 'umbrella_master',
      title: 'Maestro del Paraguas',
      description: 'Completa 5 sesiones de más de 2 horas cada una',
      icon: <FaUmbrella className="text-blue-500" />,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      maxProgress: 5
    },
    {
      id: 'water_drop',
      title: 'Gota de Agua',
      description: 'Completa 100 sesiones de menos de 15 minutos',
      icon: <FaWater className="text-cyan-400" />,
      color: 'bg-gradient-to-r from-cyan-400 to-blue-500',
      maxProgress: 100
    },
    {
      id: 'wind_dancer',
      title: 'Danzarín del Viento',
      description: 'Completa 3 sesiones en un solo día',
      icon: <FaWind className="text-gray-400" />,
      color: 'bg-gradient-to-r from-gray-400 to-slate-500',
      maxProgress: 1
    },
    {
      id: 'comet_chaser',
      title: 'Cazador de Cometas',
      description: 'Completa una sesión de exactamente 90 minutos',
      icon: <FaRocket className="text-orange-300" />,
      color: 'bg-gradient-to-r from-orange-400 to-red-500',
      maxProgress: 1
    },
    {
      id: 'world_traveler',
      title: 'Viajero Mundial',
      description: 'Completa sesiones en 12 meses diferentes',
      icon: <FaGlobe className="text-blue-400" />,
      color: 'bg-gradient-to-r from-blue-400 to-green-500',
      maxProgress: 12
    },
    {
      id: 'master_builder',
      title: 'Maestro Constructor',
      description: 'Construye una racha de 100 días consecutivos',
      icon: <FaHammer className="text-yellow-600" />,
      color: 'bg-gradient-to-r from-yellow-600 to-orange-600',
      maxProgress: 100
    },
    {
      id: 'key_holder',
      title: 'Portador de Llaves',
      description: 'Desbloquea todos los demás 49 logros',
      icon: <FaKey className="text-gold-500" />,
      color: 'bg-gradient-to-r from-yellow-500 via-gold-500 to-orange-500',
      maxProgress: 49
    }
  ], []);

  useEffect(() => {
    const newAchievements = achievementDefinitions.map(def => {
      const existing = achievements.find(a => a.id === def.id);
      let unlocked = existing?.unlocked || false;
      let unlockedAt = existing?.unlockedAt;
      let progress = 0;

      // Calcular tiempo total acumulado
      const totalTime = sessions.reduce((acc, session) => acc + session.duration, 0);

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
          const hasNightSession = sessions.some(s => {
            const hour = new Date(s.startTime).getHours();
            return hour >= 23;
          });
          progress = hasNightSession ? 1 : 0;
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

        // Nuevos logros
        case 'time_collector':
          progress = Math.min(totalTime, 36000);
          if (!unlocked && totalTime >= 36000) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'time_master':
          progress = Math.min(totalTime, 90000);
          if (!unlocked && totalTime >= 90000) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'weekend_warrior':
          const weekendDays = new Set(sessions.filter(s => {
            const day = new Date(s.startTime).getDay();
            return day === 0 || day === 6; // Domingo o Sábado
          }).map(s => new Date(s.startTime).getDay()));
          progress = weekendDays.size;
          if (!unlocked && progress >= 2) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'monday_motivation':
          const hasMondaySession = sessions.some(s => {
            const day = new Date(s.startTime).getDay();
            return day === 1; // Lunes
          });
          progress = hasMondaySession ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'speed_demon':
          progress = Math.min(sessions.filter(s => s.duration < 600).length, 10); // menos de 10 minutos, máximo 10
          if (!unlocked && progress >= 10) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'zen_master':
          const hasZenSession = sessions.some(s => s.duration >= 14400) || currentSessionTime >= 14400; // 4 horas
          progress = hasZenSession ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        // Nuevos logros adicionales (34-50)
        case 'atomic_focus':
          progress = sessions.filter(s => s.duration >= 1480 && s.duration <= 1520).length; // 25 minutos ±20 segundos
          if (!unlocked && progress >= 15) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'dragon_slayer':
          progress = Math.min(totalTime, 180000);
          if (!unlocked && totalTime >= 180000) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'feather_light':
          progress = sessions.filter(s => s.duration < 300).length; // menos de 5 minutos
          if (!unlocked && progress >= 25) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'ghost_mode':
          const hasGhostSession = sessions.some(s => {
            const hour = new Date(s.startTime).getHours();
            return hour >= 2 && hour < 4;
          });
          progress = hasGhostSession ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'ice_breaker':
          // Verificar si hay una sesión después de 7 días de inactividad
          const sortedSessions = [...sessions].sort((a, b) => a.startTime - b.startTime);
          let hasIceBreaker = false;
          for (let i = 1; i < sortedSessions.length; i++) {
            const daysDiff = (sortedSessions[i].startTime - sortedSessions[i-1].startTime) / (1000 * 60 * 60 * 24);
            if (daysDiff >= 7) {
              hasIceBreaker = true;
              break;
            }
          }
          progress = hasIceBreaker ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'nature_lover':
          const seasons = new Set(sessions.map(s => {
            const month = new Date(s.startTime).getMonth();
            if (month >= 2 && month <= 4) return 'spring';
            if (month >= 5 && month <= 7) return 'summer';
            if (month >= 8 && month <= 10) return 'autumn';
            return 'winter';
          }));
          progress = seasons.size;
          if (!unlocked && progress >= 4) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'mountain_climber':
          progress = Math.min(sessions.length, 1000);
          if (!unlocked && progress >= 1000) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'artist_soul':
          const weekDays = new Set(sessions.map(s => new Date(s.startTime).getDay()));
          progress = weekDays.size;
          if (!unlocked && progress >= 7) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'rainbow_warrior':
          const unlockedAchievements = achievements.filter(a => a.unlocked).length;
          progress = Math.min(unlockedAchievements, 25);
          if (!unlocked && unlockedAchievements >= 25) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'space_explorer':
          progress = Math.min(totalTime, 360000);
          if (!unlocked && totalTime >= 360000) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'tree_hugger':
          // Calcular días consecutivos
          const consecutiveDays = calculateConsecutiveDays(sessions);
          progress = Math.min(consecutiveDays, 60);
          if (!unlocked && consecutiveDays >= 60) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'umbrella_master':
          progress = sessions.filter(s => s.duration >= 7200).length; // más de 2 horas
          if (!unlocked && progress >= 5) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'water_drop':
          progress = sessions.filter(s => s.duration < 900).length; // menos de 15 minutos
          if (!unlocked && progress >= 100) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'wind_dancer':
          const dailySessions = sessions.reduce((acc, session) => {
            const day = new Date(session.startTime).toDateString();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const hasWindDancer = Object.values(dailySessions).some(count => count >= 3);
          progress = hasWindDancer ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'comet_chaser':
          const hasCometSession = sessions.some(s => s.duration >= 5380 && s.duration <= 5420) || 
                                  (currentSessionTime >= 5380 && currentSessionTime <= 5420); // 90 minutos ±20 segundos
          progress = hasCometSession ? 1 : 0;
          if (!unlocked && progress >= 1) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'world_traveler':
          const months = new Set(sessions.map(s => new Date(s.startTime).getMonth()));
          progress = months.size;
          if (!unlocked && progress >= 12) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'master_builder':
          const consecutiveDaysBuilder = calculateConsecutiveDays(sessions);
          progress = Math.min(consecutiveDaysBuilder, 100);
          if (!unlocked && consecutiveDaysBuilder >= 100) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;

        case 'key_holder':
          const totalUnlocked = achievements.filter(a => a.unlocked && a.id !== 'key_holder').length;
          progress = Math.min(totalUnlocked, 49);
          if (!unlocked && totalUnlocked >= 49) {
            unlocked = true;
            unlockedAt = Date.now();
          }
          break;
      }

      return {
        ...def,
        unlocked,
        unlockedAt,
        progress: progress || 0
      };
    });

    const hasChanges = newAchievements.some((newAch, index) => {
      const oldAch = achievements[index];
      return !oldAch || 
             oldAch.unlocked !== newAch.unlocked || 
             oldAch.progress !== newAch.progress;
    });

    if (hasChanges || achievements.length !== newAchievements.length) {
      setAchievements(newAchievements);
      const points = newAchievements.filter(a => a.unlocked).length * 100;
      setTotalPoints(points);
      setUserLevel(Math.floor(points / 300) + 1);
    }
  }, [sessions, currentSessionTime, achievements, achievementDefinitions]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievementDefinitions.length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  return (
    <div className="p-4 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 h-[280px] overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            Logros
          </h3>
          {/* Smaller sorting buttons inline next to title */}
          <div className="flex gap-1">
            <button
              className={`px-2 py-0.5 text-xs rounded ${sortMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setSortMode('all')}
              aria-label="Mostrar todos los logros"
            >
              Todos
            </button>
            <button
              className={`px-2 py-0.5 text-xs rounded ${sortMode === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setSortMode('completed')}
              aria-label="Mostrar logros completados"
            >
              Completados
            </button>
            <button
              className={`px-2 py-0.5 text-xs rounded ${sortMode === 'notCompleted' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setSortMode('notCompleted')}
              aria-label="Mostrar logros no completados"
            >
              No Completados
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-300">Nivel {userLevel}</div>
          <div className="text-xs text-gray-400">{totalPoints} puntos</div>
        </div>
      </div>

      <div className="space-y-2">
        {achievements
          .filter(achievement => {
            if (sortMode === 'completed') return achievement.unlocked;
            if (sortMode === 'notCompleted') return !achievement.unlocked;
            return true;
          })
          .sort((a, b) => {
            if (sortMode === 'notCompleted') {
              // Sort by progress descending for not completed achievements
              return (b.progress || 0) - (a.progress || 0);
            }
            return 0;
          })
          .map((achievement) => (
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
