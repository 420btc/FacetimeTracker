"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import Webcam from 'react-webcam';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Lazy load the FaceSessionTracker to avoid SSR issues with WebGL
const FaceSessionTracker = dynamic(
  () => import('@/components/FaceSessionTracker'),
  { ssr: false }
);

// Tipos para los keypoints
interface Keypoint {
  x: number;
  y: number;
  name?: string;
}

interface DetectionEvent {
  id: number;
  timestamp: number;
  timeString: string;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const wasFaceDetected = useRef(false);
  const isPageHiddenRef = useRef(false);
  
  const [faceCount, setFaceCount] = useState(0);
  const [detectionHistory, setDetectionHistory] = useState<DetectionEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('faceDetectionHistory');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(true);
  
  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('faceDetectionHistory', JSON.stringify(detectionHistory));
    }
  }, [detectionHistory]);
  
  // Función para limpiar el historial de detecciones
  const clearDetectionHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial de detecciones?')) {
      setDetectionHistory([]);
    }
  };

  // Handle page visibility to prevent issues when switching tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      isPageHiddenRef.current = document.hidden;
      
      if (!document.hidden && isWebcamActive) {
        // Page became visible again - restart detection if webcam is active
        console.log('Page became visible, restarting detection');
        runDetector();
      } else if (document.hidden) {
        // Page became hidden - pause detection
        console.log('Page became hidden, pausing detection');
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWebcamActive]);

  // Input resolution configuration
  const inputResolution = { width: 640, height: 480 }; // Tamaño fijo para escritorio
    
  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: inputResolution.width },
    height: { ideal: inputResolution.height },
    facingMode: 'user',
    aspectRatio: 1.333, // 4:3 para mantener relación de aspecto
  };

  // Toggle webcam on/off
  const toggleWebcam = () => {
    setIsWebcamActive(prev => !prev);
  };

  // Load and configure the model
  const runDetector = useCallback(async () => {
    if (!isWebcamActive || isPageHiddenRef.current) return; // Don't run detector if webcam is off or page is hidden
    
    // Cancel any existing animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    try {
      // Set WebGL backend with fallback to CPU if needed
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js is ready with WebGL');
      } catch (error) {
        console.warn('WebGL not available, falling back to CPU', error);
        await tf.setBackend('cpu');
        await tf.ready();
      }

      // Load the MediaPipe FaceMesh model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'mediapipe' as const,
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
        maxFaces: 10,
      };

      console.log('Loading face detection model...');
      const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      detectorRef.current = detector;
      console.log('Face detection model loaded successfully');

      // Function to detect faces
      const detect = async () => {
        // Skip detection if page is hidden or webcam is inactive
        if (isPageHiddenRef.current || !isWebcamActive) {
          return;
        }
        
        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null &&
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
            // Make Detections
            const faces = await detectorRef.current.estimateFaces(video);
            
            // Get canvas context
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            
            if (ctx && canvas) {
              // Clear previous drawings
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              const currentlyDetected = faces.length > 0;
              
              // Update face detection state
              setIsFaceDetected(currentlyDetected);
              
              // Update face count to reflect current number of faces (0 or 1)
              setFaceCount(faces.length);
              
              // Handle face connection/disconnection sounds and events
              if (currentlyDetected && !wasFaceDetected.current) {
                // Face just connected - play connection sound
                try {
                  const connectSound = new Audio('/sounds/conectado.mp3');
                  connectSound.volume = 0.5; // Adjust volume as needed
                  connectSound.play().catch(e => console.log('Could not play connect sound:', e));
                } catch (error) {
                  console.log('Error creating connect sound:', error);
                }
                
                // Add to detection history
                const newDetection: DetectionEvent = {
                  id: Date.now(),
                  timestamp: Date.now(),
                  timeString: formatTime(Date.now())
                };
                
                setDetectionHistory(prev => [newDetection, ...prev]);
                
                console.log(`Face connected! Current faces: ${faces.length}`);
              } else if (!currentlyDetected && wasFaceDetected.current) {
                // Face just disconnected - play disconnection sound
                try {
                  const disconnectSound = new Audio('/sounds/desconectado.mp3');
                  disconnectSound.volume = 0.5; // Adjust volume as needed
                  disconnectSound.play().catch(e => console.log('Could not play disconnect sound:', e));
                } catch (error) {
                  console.log('Error creating disconnect sound:', error);
                }
                
                console.log(`Face disconnected! Current faces: ${faces.length}`);
              }
              
              // Update the previous detection state
              wasFaceDetected.current = currentlyDetected;
              
              // Draw facial landmarks and bounding box
              faces.forEach((face) => {
                const keypoints = face.keypoints;
                
                // Calculate bounding box based on keypoints
                if (keypoints && keypoints.length > 0) {
                  let minX = Infinity, minY = Infinity;
                  let maxX = -Infinity, maxY = -Infinity;
                  
                  // Find keypoint boundaries
                  keypoints.forEach((keypoint: Keypoint) => {
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
                  ctx.strokeStyle = '#00FF00'; // Green color for the border
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
                keypoints.forEach((keypoint: Keypoint) => {
                  if (keypoint.name?.includes('lips')) {
                    ctx.fillStyle = '#FF0000'; // Red for lips
                  } else if (keypoint.name?.includes('eye')) {
                    ctx.fillStyle = '#00FF00'; // Green for eyes
                  } else {
                    ctx.fillStyle = '#FFFFFF'; // White for other points
                  }
                  
                  ctx.beginPath();
                  ctx.arc(keypoint.x, keypoint.y, 1, 0, 2 * Math.PI);
                  ctx.fill();
                });
              });
            }
          } catch (error) {
            console.error('Error during face detection:', error);
          } finally {
            // Continue the detection loop if webcam is still active and page is visible
            if (isWebcamActive && !isPageHiddenRef.current) {
              animationRef.current = requestAnimationFrame(detect);
            }
          }
        }
      };
      
      // Start the detection loop
      detect();
      
    } catch (error) {
      console.error('Error loading face detection model:', error);
    }
  }, [isWebcamActive, faceCount]);

  // Effect to handle webcam state changes
  useEffect(() => {
    if (isWebcamActive) {
      runDetector();
    } else {
      // Clean up animation frame when turning off webcam
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
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
    let mounted = true;
    
    const detectFaces = async () => {
      if (mounted) {
        await runDetector();
      }
    };
    
    detectFaces();
    
    return () => {
      mounted = false;
      if (animationRef.current && typeof window !== 'undefined') {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen p-4 text-white">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center justify-center gap-3">
          {/* Left icon - hidden on mobile */}
          <Image 
            src="/iconox.png" 
            alt="Logo" 
            width={96}
            height={96}
            className="hidden md:block h-9 w-9 object-contain" 
            style={{ height: '6em', width: 'auto' }}
          />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">
            FaceTime Tracker
          </h1>
          {/* Right icon - hidden on mobile */}
          <Image 
            src="/iconox.png" 
            alt="Logo" 
            width={96}
            height={96}
            className="hidden md:block h-9 w-9 object-contain" 
            style={{ height: '6em', width: 'auto' }}
          />
        </div>
      </div>
      
      {/* Webcam and Session Tracker Row */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
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
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto mt-6">
        <div className="flex flex-col gap-6 h-[400px]">
          <div className="text-center">
            <div className="p-6 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700">
              <p className="text-2xl font-bold">Caras conectadas: <span className="text-blue-400">{faceCount}</span></p>
              <div className="mt-4 text-center text-gray-300">
                {isFaceDetected ? '✅ Cara conectada' : '👀 Esperando conexión...'}
              </div>
            </div>
            <div className="p-6 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 flex-1">
              <p className="text-xl font-semibold mb-4 text-white">📋 Instrucciones</p>
              <ul className="text-sm text-left space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>El contador aumenta cada vez que se detecta una cara</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Los puntos <span className="text-blue-400">azules</span> muestran los puntos faciales generales</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Los puntos <span className="text-red-400">rojos</span> marcan los labios</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-900 bg-opacity-70 rounded-xl border border-gray-700 overflow-y-auto flex flex-col" style={{ height: '290px' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-white">📜 Historial de detecciones</h3>
            {detectionHistory.length > 0 && (
              <button
                onClick={clearDetectionHistory}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                title="Borrar historial de detecciones"
              >
                Borrar todo
              </button>
            )}
          </div>
          {detectionHistory.length === 0 ? (
            <p className="text-gray-400 text-center my-6">No hay detecciones registradas</p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {detectionHistory.map((event, index) => (
                <li key={event.id} className="py-3 flex justify-between items-center hover:bg-gray-800 px-2 rounded-lg transition-colors">
                  <span className="text-gray-200">
                    <span className="font-medium">Detección #{detectionHistory.length - index}</span>
                    <span className="text-xs text-gray-400 ml-2">ID: {event.id}</span>
                  </span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-600">
                    {event.timeString}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      

    </main>
  );
}
