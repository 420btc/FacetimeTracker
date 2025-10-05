import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export interface AlertConfig {
  enabled: boolean;
  minDuration: number; // Tiempo mínimo en segundos para activar la alarma (1 hora)
  alertInterval: number; // Intervalo entre alertas en segundos (30 minutos)
  notificationTitle?: string;
  notificationMessage?: string;
}

export interface SmartAlertsHook {
  currentSessionTime: number;
  isSessionActive: boolean;
  config?: Partial<AlertConfig>;
}

export const useSmartAlerts = ({
  currentSessionTime,
  isSessionActive,
  config = {}
}: SmartAlertsHook) => {
  // Combinar configuración por defecto con la personalizada
  const finalConfig = useMemo<AlertConfig>(() => {
    // Configuración por defecto
    const defaultConfig: AlertConfig = {
      enabled: true,
      minDuration: 3600, // 1 hora en segundos
      alertInterval: 1800, // 30 minutos entre alertas
      notificationTitle: '¡Hora de tomar un descanso!',
      notificationMessage: 'Has estado concentrado por más de 1 hora. Considera tomar un descanso.'
    };
    
    return {
      ...defaultConfig,
      ...config
    };
  }, [config]);

  const lastAlertTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const permissionRequestedRef = useRef<boolean>(false);

  // Verificar permisos de notificación al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Inicializar elemento de audio
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Precargar la alarma
    audioRef.current = new Audio('/sounds/alarma1.mp3');
    audioRef.current.volume = 0.8;
    audioRef.current.load();

    return () => {
      // Limpiar al desmontar
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    
    // Si ya se pidió permiso, devolver el estado actual
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

  // Función para reproducir la alarma
  const playAlert = useCallback(async (): Promise<void> => {
    if (!finalConfig.enabled || !audioRef.current) return;

    try {
      // Reanudar AudioContext si está suspendido
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.warn('Error al reproducir alarma:', error);
    }
  }, [finalConfig, audioRef]);

  // Lógica principal para activar alertas
  useEffect(() => {
    if (!isSessionActive || !finalConfig.enabled) return;

    const now = Date.now();
    const timeSinceLastAlert = now - lastAlertTimeRef.current;
    const minIntervalMs = finalConfig.alertInterval * 1000;
    
    // Solo activar alerta si se ha alcanzado la duración mínima y ha pasado el intervalo
    const shouldAlert = 
      currentSessionTime >= finalConfig.minDuration && 
      timeSinceLastAlert >= minIntervalMs;

    if (shouldAlert) {
      playAlert();
      lastAlertTimeRef.current = now;
    }
  }, [currentSessionTime, isSessionActive, finalConfig, playAlert]);

  // Función para activar manualmente una alerta
  const triggerManualAlert = useCallback(async () => {
    if (!finalConfig.enabled) return;
    
    const now = Date.now();
    const timeSinceLastAlert = now - lastAlertTimeRef.current;
    const minIntervalMs = 300000; // 5 minutos como mínimo entre alertas manuales
    
    if (timeSinceLastAlert >= minIntervalMs) {
      try {
        // Mostrar notificación
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          const notification = new Notification(finalConfig.notificationTitle || '¡Alerta manual!', {
            body: 'Has activado manualmente una alerta',
            icon: '/favicon.ico'
          });
          
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }
        
        // Reproducir sonido
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        }
        
        lastAlertTimeRef.current = now;
      } catch (error) {
        console.warn('Error al activar alerta manual:', error);
      }
    }
  }, [finalConfig, requestNotificationPermission]);

  return {
    triggerManualAlert,
    isAlertsEnabled: finalConfig.enabled,
    notificationPermission
  };
};
