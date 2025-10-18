
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeSkinTone, getCalibratedSpo2 } from './services/geminiService';
import { SpinnerIcon } from './components/icons';
import type { CorrectionResult } from './types';

const App: React.FC = () => {
    const [spo2, setSpo2] = useState<string>('98');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<CorrectionResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const handleCalculate = useCallback(async () => {
        if (!capturedImage || !spo2) {
            setError('Please capture an image and enter an SpO2 value.');
            return;
        }

        const spo2Value = parseFloat(spo2);
        if (isNaN(spo2Value) || spo2Value < 70 || spo2Value > 100) {
            setError('Please enter a valid SpO2 value between 70 and 100.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const skinTone = await analyzeSkinTone(capturedImage);
            const calibratedSpo2 = await getCalibratedSpo2(spo2Value, skinTone);

            setResult({
                originalSpo2: spo2Value,
                calibratedSpo2: calibratedSpo2,
                skinTone: skinTone,
            });

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during calculation.');
        } finally {
            setIsLoading(false);
        }

    }, [capturedImage, spo2]);
    
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center text-slate-800 font-sans">
            <Header />

            <main className="w-full max-w-4xl p-4 md:p-8 mt-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Inputs */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <label htmlFor="spo2-input" className="block text-sm font-medium text-slate-600 mb-2">
                                1. Enter Measured SpO₂ (%)
                            </label>
                            <input
                                id="spo2-input"
                                type="number"
                                value={spo2}
                                onChange={(e) => setSpo2(e.target.value)}
                                placeholder="e.g., 98"
                                className="w-full px-4 py-3 text-lg bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            />
                        </div>

                        <div>
                            <h3 className="block text-sm font-medium text-slate-600 mb-2">2. Capture Patient's Skin Area</h3>
                            <p className="text-xs text-slate-500 mb-3">Use a well-lit area. Capture the forehead or inner wrist for best results.</p>
                            <CameraView 
                                onCapture={setCapturedImage}
                                onCameraReady={setIsCameraReady}
                            />
                        </div>

                        <div className="pt-4">
                           <button
                                onClick={handleCalculate}
                                disabled={isLoading || !capturedImage || !isCameraReady}
                                className="w-full flex items-center justify-center bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                           >
                               {isLoading ? (
                                   <>
                                       <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                       Analyzing...
                                   </>
                               ) : "Calculate Calibrated SpO₂"}
                           </button>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="bg-slate-50 rounded-lg p-6 flex flex-col justify-center items-center">
                       <ResultDisplay result={result} isLoading={isLoading} error={error} />
                    </div>

                </div>
            </main>
            
            <footer className="w-full max-w-4xl p-4 md:p-8 text-center text-xs text-slate-500">
                <p className="font-bold mb-1">Disclaimer</p>
                <p>This tool is for informational and research purposes only. It is not a certified medical device and should not be used for clinical diagnosis or treatment decisions. The calibrated value is an estimate. Always rely on clinical judgment and gold-standard measurements like Arterial Blood Gas (ABG) when necessary.</p>
            </footer>
        </div>
    );
};

export default App;