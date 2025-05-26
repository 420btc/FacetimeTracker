'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import dynamic from 'next/dynamic';

const FaceSessionTracker = dynamic(() => import('../components/FaceSessionTracker'), { ssr: false });
const AchievementSystem = dynamic(() => import('../components/AchievementSystem'), { ssr: false });
const AnalyticsDashboard = dynamic(() => import('../components/AnalyticsDashboard'), { ssr: false });

interface DetectionEvent {
  id: number;
  timestamp: number;
  type: 'connect' | 'disconnect';
  duration?: number;
}

interface FaceSession {
  id: number;
  startTime: number;
  endTime: number | null;
  duration: number;
}

export default function Home() {
  const [faceSessions, setFaceSessions] = useState<FaceSession[]>([]);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [isWebcamActive, setIsWebcamActive] = useState(true);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<DetectionEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('detectionHistory');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const wasFaceDetected = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPageHiddenRef = useRef(false);
  
  // Input resolution configuration
  const inputResolution = { width: 640, height: 480 }; // Tamaño fijo para escritorio
    
  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: inputResolution.width },
    height: { ideal: inputResolution.height },
    facingMode: 'user',
    aspectRatio: 1.333, // 4:3 para mantener relación de aspecto
  };

  // Load and configure the model
  const runDetector = useCallback(async () => {
    if (!isWebcamActive) return; // Only stop if webcam is off, NOT if page is hidden
    
    // Cancel any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      // Load the faceLandmarksDetection model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
      };
      
      const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      detectorRef.current = detector;

      // Function to detect faces
      const detect = async () => {
        // Always run detection if webcam is active, regardless of page visibility
        if (
          webcamRef.current?.video &&
          webcamRef.current.video?.readyState === 4 &&
          detectorRef.current
        ) {
          const video = webcamRef.current.video;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          // Set video width and height
          if (webcamRef.current.video) {
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;
          }

          // Set canvas width and height
          if (canvasRef.current) {
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
          }

          try {
            // Make Detections - ALWAYS run, even when page is hidden
            const faces = await detectorRef.current.estimateFaces(video);
            
            // Get canvas context
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            
            // Only update visual elements if page is visible
            if (ctx && canvas && !isPageHiddenRef.current) {
              // Clear previous drawings
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            const currentlyDetected = faces.length > 0;
            
            // ALWAYS update face detection state (even when hidden)
            setIsFaceDetected(currentlyDetected);
            
            // ALWAYS handle face connection/disconnection sounds and events
            if (currentlyDetected && !wasFaceDetected.current) {
              // Face just connected - play connection sound
              try {
                const connectSound = new Audio('/sounds/conectado.mp3');
                connectSound.volume = 0.5;
                connectSound.play().catch(e => console.log('Could not play connect sound:', e));
              } catch (error) {
                console.log('Error creating connect sound:', error);
              }
              
              // Add to detection history
              const newDetection: DetectionEvent = {
                id: Date.now(),
                timestamp: Date.now(),
                type: 'connect'
              };
              
              setDetectionHistory(prev => [newDetection, ...prev]);
              
              console.log(`Face connected! Current faces: ${faces.length}`);
            } else if (!currentlyDetected && wasFaceDetected.current) {
              // Face just disconnected - play disconnection sound
              try {
                const disconnectSound = new Audio('/sounds/desconectado.mp3');
                disconnectSound.volume = 0.5;
                disconnectSound.play().catch(e => console.log('Could not play disconnect sound:', e));
              } catch (error) {
                console.log('Error creating disconnect sound:', error);
              }
              
              console.log(`Face disconnected! Current faces: ${faces.length}`);
            }
            
            // ALWAYS update the previous detection state
            wasFaceDetected.current = currentlyDetected;
            
            // Only draw visual elements if page is visible
            if (ctx && canvas && !isPageHiddenRef.current) {
              // Draw facial landmarks and bounding box
              faces.forEach((face) => {
                const keypoints = face.keypoints;
                
                // Calculate bounding box based on keypoints
                if (keypoints && keypoints.length > 0) {
                  let minX = Infinity, minY = Infinity;
                  let maxX = -Infinity, maxY = -Infinity;
                  
                  // Find keypoint boundaries
                  keypoints.forEach((keypoint) => {
                    minX = Math.min(minX, keypoint.x);
                    minY = Math.min(minY, keypoint.y);
                    maxX = Math.max(maxX, keypoint.x);
                    maxY = Math.max(maxY, keypoint.y);
                  });
                  
                  // Add some margin
                  const margin = 20;
                  minX = Math.max(0, minX - margin);
                  minY = Math.max(0, minY - margin);
                  maxX = Math.min(canvas.width, maxX + margin);
                  maxY = Math.min(canvas.height, maxY + margin);
                  
                  const width = maxX - minX;
                  const height = maxY - minY;
                  
                  // Draw the bounding box
                  ctx.strokeStyle = '#00FF00';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(minX, minY, width, height);
                  
                  // Add label with background for better readability
                  const label = 'Cara detectada';
                  const textWidth = ctx.measureText(label).width;
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                  ctx.fillRect(minX - 2, minY - 17, textWidth + 4, 16);
                  ctx.fillStyle = '#00FF00';
                  ctx.font = '12px Arial';
                  ctx.fillText(label, minX, minY > 10 ? minY - 5 : 10);
                }
                
                // Draw facial landmark points
                keypoints.forEach((keypoint, index) => {
                  // MediaPipe FaceMesh keypoint indices for eyes
                  const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
                  const rightEyeIndices = [249, 263, 362, 398, 384, 385, 386, 387, 388, 466, 388, 387, 386, 385, 384, 398];
                  
                  if (leftEyeIndices.includes(index) || rightEyeIndices.includes(index)) {
                    ctx.fillStyle = '#00FF00'; // Green for eyes
                  } else {
                    ctx.fillStyle = '#FFFFFF'; // White for all other points
                  }
                  
                  ctx.beginPath();
                  ctx.arc(keypoint.x, keypoint.y, 1, 0, 2 * Math.PI); // Back to 1px as requested
                  ctx.fill();
                });
              });
            }
          } catch (error) {
            console.error('Error during face detection:', error);
          } finally {
            // ALWAYS continue the detection loop if webcam is active (regardless of visibility)
            if (isWebcamActive) {
              timeoutRef.current = setTimeout(detect, 100); // Changed from requestAnimationFrame
            }
          }
        }
      };
      
      // Start the detection loop
      detect();
      
    } catch (error) {
      console.error('Error loading face detection model:', error);
    }
  }, [isWebcamActive]); // Only depend on isWebcamActive to avoid circular dependency

  // Handle page visibility changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - mark as hidden but DON'T pause detection
        console.log('Page became hidden, detection continues in background');
        isPageHiddenRef.current = true;
      } else {
        // Page became visible - mark as visible
        console.log('Page became visible, resuming visual updates');
        isPageHiddenRef.current = false;
        
        // DON'T restart detection - just resume visual updates
        // The detection loop should already be running in the background
        console.log('Page visible again, visual updates resumed');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Remove dependencies to avoid restarting detection

  // Toggle webcam on/off
  const toggleWebcam = () => {
    setIsWebcamActive(prev => !prev);
  };

  // Function to refresh detection by simulating visibility change
  const refreshDetection = () => {
    console.log('Refreshing visual updates and detection state...');
    
    // Simply toggle the page visibility to force a visual refresh
    isPageHiddenRef.current = true;
    
    // After a brief moment, resume visual updates
    setTimeout(() => {
      isPageHiddenRef.current = false;
      console.log('Visual updates refreshed');
    }, 100); // Shorter delay for better UX
  };

  // Effect to handle webcam state changes
  useEffect(() => {
    if (isWebcamActive) {
      runDetector();
    } else {
      // Clean up timeout when turning off webcam
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Clear canvas when webcam is off
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      // Reset face detection state
      setIsFaceDetected(false);
    }
  }, [isWebcamActive, runDetector]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current && typeof window !== 'undefined') {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-start p-4 overflow-y-auto">
      {/* Title with visual effect */}
      <div className="relative mb-6 z-20">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          FaceTime Tracker
        </h1>
        <p className="text-gray-300 text-center mt-2 text-sm md:text-base">
          Detecta y rastrea tu tiempo de concentración en tiempo real
        </p>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-6xl space-y-6">
        {/* Webcam and Session Tracker Row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Webcam */}
          <div className="relative w-full lg:w-[640px] h-[480px] bg-black rounded-xl overflow-hidden">
            {isWebcamActive ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={videoConstraints}
                className="absolute w-full h-full object-cover rounded-xl"
                onUserMediaError={(e) => {
                  console.error('Webcam error:', e);
                  setIsWebcamActive(false);
                }}
              />
            ) : (
              <div className="absolute w-full h-full bg-black bg-opacity-70 rounded-xl flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <p className="text-xl font-semibold mb-2">Cámara desactivada</p>
                  <p className="text-gray-300 text-sm">Haz clic en &quot;Activar Cámara&quot; para comenzar</p>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transformOrigin: 'center',
                touchAction: 'none',
                zIndex: 10
              }}
            />
          </div>
          
          {/* Session Tracker - Sidebar */}
          <div className="w-full lg:flex-1 h-[480px]">
            <FaceSessionTracker 
              isFaceDetected={isFaceDetected} 
              isWebcamActive={isWebcamActive}
              onWebcamToggle={toggleWebcam}
              onRefreshDetection={refreshDetection}
              onSessionsChange={setFaceSessions}
              onCurrentTimeChange={setCurrentSessionTime}
            />
          </div>
        </div>

        {/* Instructions and Achievements Row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Instructions - Left side */}
          <div className="w-full lg:w-[640px] h-[280px] p-4 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Instrucciones de uso
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold">1.</span>
                <span className="text-gray-200">Activa la cámara y posiciónate frente a ella</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span className="text-gray-200">El sistema detectará automáticamente tu rostro</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">3.</span>
                <span className="text-gray-200">El contador iniciará cuando detecte tu cara</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">4.</span>
                <span className="text-gray-200">Se pausará automáticamente si no detecta tu rostro</span>
              </div>
              
              <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  Códigos de color por duración:
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">💚 Corta (0-5 min):</span>
                    <span>Sesión inicial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">💙 Normal (5-15 min):</span>
                    <span>Duración saludable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">💎 Buena (15-30 min):</span>
                    <span>Concentración óptima</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⚠️ Larga (30-60 min):</span>
                    <span>Considera descanso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400">🔶 Muy Larga (1-2h):</span>
                    <span>Descanso recomendado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">💀 Extrema (2-3h):</span>
                    <span>Riesgo para la salud</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">☠️ Crítica (+3h):</span>
                    <span>Alto riesgo</span>
                  </div>
                </div>
                
                <div className="mt-2 p-2 bg-blue-900 bg-opacity-30 rounded border border-blue-700">
                  <p className="text-xs text-blue-300 font-medium">💡 Recomendación:</p>
                  <p className="text-xs text-blue-200">Toma descansos cada 20-30 minutos para cuidar tu vista y postura.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements - Right side */}
          <div className="w-full lg:flex-1">
            <AchievementSystem 
              sessions={faceSessions}
              currentSessionTime={currentSessionTime}
            />
          </div>
        </div>

        {/* History and Analytics Row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Detection History - Left side */}
          <div className="w-full lg:w-[640px] h-[280px] p-3 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold text-white">📜 Historial de detecciones</h3>
              {detectionHistory.length > 0 && (
                <button
                  onClick={() => setDetectionHistory([])}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg transition-colors"
                  title="Borrar historial de detecciones"
                >
                  Borrar todo
                </button>
              )}
            </div>
            {detectionHistory.length === 0 ? (
              <p className="text-gray-400 text-center my-2 text-sm">No hay detecciones registradas</p>
            ) : (
              <ul className="divide-y divide-gray-700 flex-1 overflow-y-auto">
                {detectionHistory.map((event, index) => (
                  <li key={event.id} className="py-1 flex justify-between items-center hover:bg-gray-800 px-1 rounded transition-colors">
                    <span className="text-gray-200 text-xs">
                      <span className="font-medium">Detección #{detectionHistory.length - index}</span>
                      <span className="text-xs text-gray-400 ml-1">ID: {event.id}</span>
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-300 px-1 py-0.5 rounded border border-gray-600">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Analytics Dashboard - Right side */}
          <div className="w-full lg:flex-1">
            <AnalyticsDashboard sessions={faceSessions} />
          </div>
        </div>
      </div>
    </main>
  );
}
