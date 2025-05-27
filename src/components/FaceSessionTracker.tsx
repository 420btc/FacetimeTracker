'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const SessionHistory = dynamic(() => import('./SessionHistory'), { ssr: false });

export interface FaceSession {
  id: number;
  startTime: number;
  endTime: number | null;
  duration: number;
}

interface FaceSessionTrackerProps {
  isFaceDetected: boolean;
  onWebcamToggle: () => void;
  isWebcamActive: boolean;
  isDetectionActive: boolean;
  onToggleDetection: () => void;
  onSessionsChange?: (sessions: FaceSession[]) => void;
  onCurrentTimeChange?: (time: number) => void;
}

export default function FaceSessionTracker({ isFaceDetected, onWebcamToggle, isWebcamActive, isDetectionActive, onToggleDetection, onSessionsChange, onCurrentTimeChange }: FaceSessionTrackerProps) {
  const [currentSession, setCurrentSession] = useState<{
    startTime: number | null;
    elapsedTime: number;
  }>({ startTime: null, elapsedTime: 0 });
  
  // Load sessions from localStorage on component mount
  const [sessions, setSessions] = useState<FaceSession[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('faceDetectionSessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const lastUpdateRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenTimeRef = useRef<number | null>(null);
  const onCurrentTimeChangeRef = useRef(onCurrentTimeChange);
  
  useEffect(() => {
    onCurrentTimeChangeRef.current = onCurrentTimeChange;
  }, [onCurrentTimeChange]);

  // Clear all sessions
  const clearSessions = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (confirm('¿Estás seguro de que quieres borrar todo el historial de sesiones?')) {
        localStorage.removeItem('faceDetectionSessions');
        setSessions([]);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('faceDetectionSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Notify parent component when sessions change (separate effect to avoid render issues)
  useEffect(() => {
    if (onSessionsChange) {
      // Use setTimeout to defer the callback until after render
      setTimeout(() => {
        onSessionsChange(sessions);
      }, 0);
    }
  }, [sessions, onSessionsChange]);

  // Handle page visibility changes to prevent timer issues when switching tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden - store the time when it was hidden
        hiddenTimeRef.current = Date.now();
        console.log('FaceSessionTracker: Page hidden, storing timestamp');
      } else {
        // Page is now visible - adjust for time lost while hidden
        if (hiddenTimeRef.current && isRunning) {
          const timeHidden = Date.now() - hiddenTimeRef.current;
          console.log(`FaceSessionTracker: Page visible again, was hidden for ${timeHidden}ms`);
          
          // Add the hidden time to the current session
          setCurrentSession(prev => ({
            ...prev,
            elapsedTime: prev.elapsedTime + (timeHidden / 1000) // Convert to seconds
          }));
          
          // Update lastUpdate to current time
          lastUpdateRef.current = Date.now();
        }
        hiddenTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  // Handle session tracking with improved timer management
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isFaceDetected) {
      // Start new session if not already running
      if (!isRunning) {
        const now = Date.now();
        setCurrentSession({
          startTime: now,
          elapsedTime: 0,
        });
        setIsRunning(true);
        lastUpdateRef.current = now;
        console.log('FaceSessionTracker: Starting new session');
      }

      // Update elapsed time every second - ALWAYS run, even when page is hidden
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;
        
        setCurrentSession(prev => {
          const newElapsedTime = prev.elapsedTime + delta;
          if (onCurrentTimeChangeRef.current) {
            setTimeout(() => {
              onCurrentTimeChangeRef.current?.(newElapsedTime);
            }, 0);
          }
          return {
            ...prev,
            elapsedTime: newElapsedTime
          };
        });
      }, 100); // Update frequently for smooth display
      
    } else if (isRunning) {
      // Stop the session
      setCurrentSession(prev => {
        if (prev.startTime) {
          const endTime = Date.now();
          const finalDuration = (endTime - prev.startTime) / 1000;
          
          // Only create session card if duration is greater than 0.5 seconds
          if (finalDuration > 0.5) {
            const newSession: FaceSession = {
              id: Date.now(),
              startTime: prev.startTime || Date.now(),
              endTime: endTime,
              duration: finalDuration
            };
            
            // Add to sessions list
            setSessions(prevSessions => {
              const sessionExists = prevSessions.some(session => 
                session.id === newSession.id || 
                (session.startTime === newSession.startTime && session.endTime === newSession.endTime)
              );
              
              if (sessionExists) {
                return prevSessions;
              }
              
              console.log(`FaceSessionTracker: Creating session card with duration: ${finalDuration.toFixed(1)}s`);
              return [newSession, ...prevSessions];
            });
          } else {
            console.log(`FaceSessionTracker: Session too short (${finalDuration.toFixed(1)}s), not creating card`);
          }
        }
        
        // Reset current time when session ends
        if (onCurrentTimeChangeRef.current) {
          setTimeout(() => {
            onCurrentTimeChangeRef.current?.(0);
          }, 0);
        }
        
        return { startTime: null, elapsedTime: 0 };
      });
      
      setIsRunning(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isFaceDetected, isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format time in seconds to HH:MM:SS
  const formatDuration = useCallback((seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h.toString().padStart(2, '0'),
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  }, []);

  const formatTimeWithAMPM = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = Math.floor(date.getMilliseconds() / 10).toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    
    return `${hours}:${minutes}:${seconds}.${milliseconds} ${ampm}`;
  }, []);

  // Alias para mantener compatibilidad
  const formatDateTime = formatTimeWithAMPM;

  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col p-4 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-white">
            {isWebcamActive ? '🟢' : '🔴'} Sesión {isWebcamActive ? 'Activa' : 'Inactiva'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={onWebcamToggle}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isWebcamActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isWebcamActive ? 'Desactivar Cámara' : 'Activar Cámara'}
            </button>
            <button
              onClick={onToggleDetection}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isDetectionActive 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isDetectionActive ? 'Desactivar Detección' : 'Activar Detección'}
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Tiempo actual:</p>
            {isRunning ? (
              <div className="space-y-1">
                <p className="text-5xl md:text-6xl font-mono text-green-400 font-bold tracking-tighter">
                  {formatDuration(currentSession.elapsedTime)}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Inició: {formatDateTime(currentSession.startTime || Date.now())}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Inactivo</p>
            )}
          </div>
          
          <SessionHistory 
            sessions={sessions}
            onClearSessions={clearSessions}
          />
        </div>
      </div>
    </div>
  );
}
