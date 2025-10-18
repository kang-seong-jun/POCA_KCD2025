
import { useState, useEffect, useRef } from 'react';

export const useCamera = () => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let isMounted = true;

        const getCameraStream = async () => {
            if (streamRef.current) return;

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: {
                        facingMode: "user" // prefer front camera
                    } 
                });
                
                if (isMounted) {
                    streamRef.current = mediaStream;
                    setStream(mediaStream);
                    setIsCameraActive(true);
                    setError(null);
                }
            } catch (err) {
                 if (isMounted) {
                    if (err instanceof DOMException && err.name === "NotAllowedError") {
                        setError("Camera access was denied. Please enable camera permissions in your browser settings.");
                    } else {
                        setError("Could not access the camera. Please ensure it is not in use by another application.");
                    }
                    setIsCameraActive(false);
                }
            }
        };

        getCameraStream();

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                setStream(null);
                setIsCameraActive(false);
            }
        };
    }, []);

    return { stream, error, isCameraActive };
};
