
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CameraIcon, CheckCircleIcon, RefreshIcon } from './icons';
import { useCamera } from '../hooks/useCamera';

interface CameraViewProps {
    onCapture: (imageBase64: string | null) => void;
    onCameraReady: (isReady: boolean) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCameraReady }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    
    const { stream, error, isCameraActive } = useCamera();

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            onCameraReady(true);
        } else {
             onCameraReady(false);
        }
    }, [stream, onCameraReady]);
    
    useEffect(() => {
        onCapture(capturedImage);
    }, [capturedImage, onCapture]);

    const handleCapture = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
            }
        }
    }, []);

    const handleRetake = () => {
        setCapturedImage(null);
    };

    return (
        <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative text-white shadow-inner">
            <canvas ref={canvasRef} className="hidden" />
            
            {error && <div className="p-4 text-center text-red-400">{error}</div>}

            {!error && (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${capturedImage || !isCameraActive ? 'hidden' : 'block'}`}
                    />
                    
                    {!isCameraActive && !capturedImage && (
                         <div className="flex flex-col items-center">
                            <CameraIcon className="w-12 h-12 text-slate-500 mb-2"/>
                            <p className="text-slate-500">Waiting for camera access...</p>
                         </div>
                    )}
                    
                    {capturedImage && (
                        <img src={capturedImage} alt="Captured skin tone" className="w-full h-full object-cover" />
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        {!capturedImage ? (
                            <button
                                onClick={handleCapture}
                                disabled={!isCameraActive}
                                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-full hover:bg-white/30 disabled:bg-slate-600/50 disabled:cursor-not-allowed transition"
                            >
                                <CameraIcon className="w-5 h-5" />
                                <span>Capture</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                <div className="flex items-center space-x-2 text-green-300 font-semibold pl-2">
                                     <CheckCircleIcon className="w-5 h-5" />
                                     <span>Captured</span>
                                </div>
                                <button
                                    onClick={handleRetake}
                                    className="flex items-center space-x-2 bg-white/20 text-white font-semibold p-2 rounded-full hover:bg-white/30 transition"
                                >
                                    <RefreshIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
