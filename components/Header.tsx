
import React from 'react';
import { StethoscopeIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="w-full bg-white shadow-md">
            <div className="max-w-4xl mx-auto py-4 px-4 md:px-8 flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                    <StethoscopeIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Personalized Oxygen Calibration Agent (POCA)</h1>
                    <p className="text-sm text-slate-500">AI-Powered Calibration for Enhanced SpO₂ Accuracy</p>
                </div>
            </div>
        </header>
    );
};