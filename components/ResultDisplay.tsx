
import React from 'react';
import type { CorrectionResult } from '../types';
import { BarChartIcon, BrainCircuitIcon } from './icons';

interface ResultDisplayProps {
    result: CorrectionResult | null;
    isLoading: boolean;
    error: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, error }) => {
    
    if (isLoading) {
        return (
            <div className="text-center text-slate-500">
                <BrainCircuitIcon className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                <p className="font-semibold">Medical Agent is thinking...</p>
                <p className="text-sm">Analyzing skin tone and calculating calibration.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold">Error</h3>
                <p className="text-sm">{error}</p>
            </div>
        );
    }
    
    if (!result) {
        return (
            <div className="text-center text-slate-500">
                <BarChartIcon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="font-semibold text-lg">Awaiting Input</h3>
                <p className="text-sm">Enter SpO₂ and capture an image to see the calibrated result.</p>
            </div>
        );
    }

    const difference = (result.originalSpo2 - result.calibratedSpo2).toFixed(1);
    const isCritical = result.calibratedSpo2 < 94;

    return (
        <div className="w-full text-center flex flex-col items-center justify-center space-y-4">
            <div>
                <p className="text-sm font-medium text-slate-500">Calibrated SpO₂ (Estimate)</p>
                <p className={`font-bold text-6xl ${isCritical ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>
                    {result.calibratedSpo2.toFixed(1)}<span className="text-4xl">%</span>
                </p>
                {isCritical && (
                    <p className="text-red-600 bg-red-100 px-2 py-1 rounded-md text-sm font-semibold mt-2">
                        Potential for occult hypoxemia. Clinical review recommended.
                    </p>
                )}
            </div>

            <div className="w-full bg-white p-4 rounded-lg shadow-inner flex justify-around">
                <div className="text-center">
                    <p className="text-xs text-slate-500">Original SpO₂</p>
                    <p className="font-bold text-2xl text-slate-700">{result.originalSpo2}%</p>
                </div>
                 <div className="border-l border-slate-200"></div>
                <div className="text-center">
                    <p className="text-xs text-slate-500">Calibration</p>
                    <p className="font-bold text-2xl text-blue-600">-{difference}%</p>
                </div>
            </div>
             <div className="text-center pt-2">
                <p className="text-xs text-slate-500">Detected Skin Type</p>
                <p className="font-semibold text-sm text-slate-700 bg-slate-200 px-2 py-1 rounded-full">{result.skinTone}</p>
            </div>
        </div>
    );
};