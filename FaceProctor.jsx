import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

// --- Configuration ---
const DETECTION_INTERVAL = 2000; // 2 seconds
const GRACE_PERIOD = 60000; // 1 minute

export function FaceProctor({ onRuleBreak }) {
  const videoRef = useRef(null);
  const intervalRef = useRef(null); // Ref to hold the interval ID
  const gracePeriodTimer = useRef(null);

  const [status, setStatus] = useState('Initializing...');
  const [warning, setWarning] = useState(null);
  
  // --- NEW: State to track readiness ---
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    // --- 1. Load the Model ---
    const loadModel = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setIsModelLoaded(true);
        setStatus('Loading Webcam...');
      } catch (err) {
        console.error('Model loading failed:', err);
        setStatus('Error: Could not load models.');
      }
    };

    // --- 2. Start the Webcam ---
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam access failed:', err);
        setStatus('Webcam or Model error. Please refresh.');
        alert('Webcam access is required for this test. Please enable it and refresh the page.');
      }
    };

    loadModel();
    startWebcam();

    // --- 3. Cleanup Function ---
    // This runs when the component is unmounted (test ends)
    return () => {
      clearInterval(intervalRef.current); // Stop detection loop
      clearTimeout(gracePeriodTimer.current); // Stop grace period
      
      // Stop the webcam stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Run only once on mount

  // --- 4. Main Detection Loop ---
  // This runs in the interval
  const runDetection = async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
      return; // Don't run detection if video isn't playing
    }

    const detections = await faceapi.detectAllFaces(videoRef.current, 
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detections.length === 0) {
      // NO FACE DETECTED
      setWarning('No face detected. Please look at the camera.');
      if (!gracePeriodTimer.current) {
        gracePeriodTimer.current = setTimeout(() => {
          onRuleBreak('No face was detected for 10 seconds.');
        }, GRACE_PERIOD);
      }
    } else if (detections.length > 1) {
      // MULTIPLE FACES DETECTED
      setWarning('Multiple faces detected. Please ensure you are alone.');
      if (!gracePeriodTimer.current) {
        gracePeriodTimer.current = setTimeout(() => {
          onRuleBreak('Multiple faces were detected.');
        }, GRACE_PERIOD);
      }
    } else {
      // ONE FACE DETECTED (All good)
      setWarning(null);
      if (gracePeriodTimer.current) {
        clearTimeout(gracePeriodTimer.current);
        gracePeriodTimer.current = null;
      }
    }
  };

  // --- 5. Start Detection *only* when ready ---
  useEffect(() => {
    if (isModelLoaded && isVideoReady) {
      // Both are ready, start the detection interval
      setStatus('Proctoring Active');
      intervalRef.current = setInterval(runDetection, DETECTION_INTERVAL);
    }
  }, [isModelLoaded, isVideoReady]); // Run this when readiness changes

  return (
    <div style={styles.proctorContainer}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline // Important for iOS Safari
        style={styles.videoFeed}
        // --- MODIFIED: Use onLoadedData ---
        onLoadedData={() => setIsVideoReady(true)}
      />
      <div style={styles.statusBox}>
        <p style={styles.statusText}>{status}</p>
      </div>
      {warning && (
        <div style={styles.warningBox}>
          <p style={styles.warningText}>{warning}</p>
        </div>
      )}
    </div>
  );
}

// --- STYLES (Unchanged) ---
const styles = {
  proctorContainer: {
    position: 'fixed',
    top: '80px', // Below the main header
    right: '20px',
    width: '180px',
    height: '140px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #333',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  videoFeed: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Flip horizontally (mirror effect)
  },
  statusBox: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '4px',
    textAlign: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: '12px',
    margin: 0,
  },
  warningBox: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: '8px',
    textAlign: 'center',
  },
  warningText: {
    color: 'white',
    fontSize: '12px',
    margin: 0,
    fontWeight: 'bold',
  },
};