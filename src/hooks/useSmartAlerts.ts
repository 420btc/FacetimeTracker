import { useEffect, useRef, useCallback, useState } from 'react';

interface AlertConfig {
  enabled: boolean;
  lowDurationThreshold: number; // en segundos
  highDurationThreshold: number; // en segundos
  alertInterval: number; // en segundos
}

interface SmartAlertsHook {
  currentSessionTime: number;
  isSessionActive: boolean;
  config?: AlertConfig;
}

export const useSmartAlerts = ({ 
  currentSessionTime, 
  isSessionActive, 
  config = {
    enabled: true,
    lowDurationThreshold: 300, // 5 minutos
    highDurationThreshold: 1800, // 30 minutos
    alertInterval: 600 // 10 minutos
  }
}: SmartAlertsHook) => {
  const lastAlertTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lowAlarmRef = useRef<HTMLAudioElement | null>(null);
  const highAlarmRef = useRef<HTMLAudioElement | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const permissionRequestedRef = useRef<boolean>(false);

  // Verificar permisos de notificación al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Inicializar audio context y elementos de audio
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Crear AudioContext para mejor control del audio
    try {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext no disponible:', error);
    }

    // Precargar archivos de audio
    lowAlarmRef.current = new Audio('/sounds/alarma2.mp3');
    highAlarmRef.current = new Audio('/sounds/alarma1.mp3');
    
    // Configurar audio
    if (lowAlarmRef.current) {
      lowAlarmRef.current.volume = 0.7;
      lowAlarmRef.current.preload = 'auto';
    }
    
    if (highAlarmRef.current) {
      highAlarmRef.current.volume = 0.8;
      highAlarmRef.current.preload = 'auto';
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Función para solicitar permisos de notificación una sola vez
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    
    // Si ya se pidió permiso antes, no volver a pedirlo
    if (permissionRequestedRef.current) return notificationPermission === 'granted';
    
    // Si ya tenemos permiso, no pedirlo de nuevo
    if (notificationPermission === 'granted') return true;
    
    // Si fue denegado explícitamente, no insistir
    if (notificationPermission === 'denied') return false;

    try {
      permissionRequestedRef.current = true;
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.warn('Error solicitando permisos de notificación:', error);
      return false;
    }
  }, [notificationPermission]);

  // Función para reproducir audio de forma robusta
  const playAlert = useCallback(async (isHighPriority: boolean) => {
    if (!config.enabled) return;

    const audio = isHighPriority ? highAlarmRef.current : lowAlarmRef.current;
    if (!audio) return;

    try {
      // Reanudar AudioContext si está suspendido
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Resetear y reproducir audio
      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log(`🔊 Alerta ${isHighPriority ? 'alta' : 'baja'} prioridad reproducida`);
      }
    } catch (error) {
      console.warn('Error reproduciendo alerta:', error);
      
      // Fallback: intentar reproducir sin AudioContext
      try {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn('Fallback audio failed:', e));
      } catch (fallbackError) {
        console.warn('Fallback audio también falló:', fallbackError);
      }
    }
  }, [config.enabled]);

  // Función para mostrar notificación del navegador
  const showNotification = useCallback(async (title: string, body: string, isHighPriority: boolean) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    // Solo mostrar notificación si tenemos permisos
    if (notificationPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'facetime-tracker-alert',
          requireInteraction: isHighPriority,
          silent: false
        });

        // Auto-cerrar notificación después de 5 segundos si no es alta prioridad
        if (!isHighPriority) {
          setTimeout(() => notification.close(), 5000);
        }

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.warn('Error mostrando notificación:', error);
      }
    }
  }, [notificationPermission]);

  // Lógica principal de alertas
  useEffect(() => {
    if (!isSessionActive || !config.enabled || currentSessionTime === 0) {
      return;
    }

    const now = Date.now();
    const timeSinceLastAlert = now - lastAlertTimeRef.current;

    // Solo alertar si han pasado al menos 10 segundos desde la última alerta
    if (timeSinceLastAlert < 10000) return;

    // Determinar tipo de alerta basado en duración
    let shouldAlert = false;
    let isHighPriority = false;
    let alertTitle = '';
    let alertBody = '';

    if (currentSessionTime >= config.highDurationThreshold) {
      // Sesión larga - alerta de alta prioridad cada 10 minutos
      if (timeSinceLastAlert >= config.alertInterval * 1000) {
        shouldAlert = true;
        isHighPriority = true;
        
        const hours = Math.floor(currentSessionTime / 3600);
        const minutes = Math.floor((currentSessionTime % 3600) / 60);
        
        if (currentSessionTime >= 7200) { // 2+ horas
          alertTitle = '⚠️ SESIÓN CRÍTICA';
          alertBody = `Llevas ${hours}h ${minutes}m. ¡Es urgente que tomes un descanso!`;
        } else if (currentSessionTime >= 3600) { // 1+ hora
          alertTitle = '🔶 SESIÓN MUY LARGA';
          alertBody = `Llevas ${hours}h ${minutes}m. Considera tomar un descanso.`;
        } else { // 30+ minutos
          alertTitle = '⚠️ SESIÓN LARGA';
          alertBody = `Llevas ${minutes} minutos. Es recomendable descansar.`;
        }
      }
    } else if (currentSessionTime <= config.lowDurationThreshold) {
      // Sesión corta - alerta de motivación cada 5 minutos
      if (timeSinceLastAlert >= (config.alertInterval / 2) * 1000) {
        shouldAlert = true;
        isHighPriority = false;
        
        const minutes = Math.floor(currentSessionTime / 60);
        alertTitle = '💚 ¡Sigue así!';
        alertBody = `Llevas ${minutes} minutos concentrado. ¡Excelente trabajo!`;
      }
    }

    if (shouldAlert) {
      lastAlertTimeRef.current = now;
      
      // Reproducir sonido
      playAlert(isHighPriority);
      
      // Mostrar notificación (solo si tenemos permisos)
      showNotification(alertTitle, alertBody, isHighPriority);
      
      console.log(`🚨 Alerta activada: ${alertTitle} - ${alertBody}`);
    }
  }, [currentSessionTime, isSessionActive, config, playAlert, showNotification]);

  // Función para activar alerta manual
  const triggerManualAlert = useCallback(async (type: 'low' | 'high') => {
    const isHighPriority = type === 'high';
    
    // Reproducir sonido inmediatamente
    await playAlert(isHighPriority);
    
    // Solicitar permisos solo para alertas manuales (pruebas)
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
      const title = isHighPriority ? '🔊 Alerta Alta Prioridad' : '🔔 Alerta Baja Prioridad';
      const body = isHighPriority ? 'Prueba de alerta de alta prioridad' : 'Prueba de alerta de baja prioridad';
      
      await showNotification(title, body, isHighPriority);
    } else {
      console.log('Permisos de notificación no disponibles, solo reproduciendo sonido');
    }
  }, [playAlert, showNotification, requestNotificationPermission]);

  return {
    triggerManualAlert,
    isAlertsEnabled: config.enabled,
    notificationPermission
  };
};
