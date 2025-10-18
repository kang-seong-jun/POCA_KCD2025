
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a base64 string from a data URL to a simple base64 string.
 * @param dataUrl The data URL (e.g., "data:image/jpeg;base64,...").
 * @returns The base64 encoded string.
 */
function fileToGenerativePart(dataUrl: string) {
    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) {
        throw new Error("Invalid data URL format");
    }
    const mimeType = parts[0].split(':')[1];
    const base64Data = parts[1];
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
}

/**
 * Analyzes the skin tone from an image using the Gemini API.
 * @param imageBase64 The base64 encoded image data URL.
 * @returns A string describing the skin tone (e.g., "Fitzpatrick Type V").
 */
export async function analyzeSkinTone(imageBase64: string): Promise<string> {
    const imagePart = fileToGenerativePart(imageBase64);
    const prompt = `Analyze the skin tone in this image, which is of a person's skin (e.g., forehead or inner wrist). Classify it according to the Fitzpatrick scale (Type I, II, III, IV, V, or VI). Respond with only the classification name. For example: 'Fitzpatrick Type IV'.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
        });

        const text = response.text.trim();
        if (!text.toLowerCase().includes('fitzpatrick')) {
             throw new Error("Analysis failed to return a valid Fitzpatrick type.");
        }
        return text;
    } catch (error) {
        console.error("Error in analyzeSkinTone:", error);
        throw new Error("Could not analyze skin tone from the image.");
    }
}

/**
 * Calculates a calibrated SpO2 value based on SpO2 and skin tone.
 * @param spo2 The measured SpO2 value.
 * @param skinTone The detected skin tone classification.
 * @returns The estimated calibrated SpO2 value as a number.
 */
export async function getCalibratedSpo2(spo2: number, skinTone: string): Promise<number> {
    const prompt = `
        As a specialized medical AI agent, your task is to calibrate for potential inaccuracies in pulse oximetry (SpO₂) readings based on skin tone.
        Given a measured SpO₂ value and a patient's skin tone classification on the Fitzpatrick scale, provide an estimated, calibrated SpO₂ value.
        Base your calibration on established medical research indicating that pulse oximeters can have varied accuracy across different skin tones, particularly at lower saturation levels.
        For darker skin tones (e.g., Fitzpatrick IV, V, VI), the calibration might be different than for lighter tones (e.g., I, II, III).

        Input Data:
        - Measured SpO₂: ${spo2}%
        - Patient Skin Tone: ${skinTone}

        Provide only a single numerical value for the estimated calibrated SpO₂. Do not include any explanation, units, or other text. The number can be a decimal. For example: 95.2
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        const text = response.text.trim();
        const calibratedValue = parseFloat(text);

        if (isNaN(calibratedValue)) {
            throw new Error('The model returned a non-numeric value.');
        }

        return calibratedValue;
    } catch (error) {
        console.error("Error in getCalibratedSpo2:", error);
        throw new Error("Could not calculate the calibrated SpO2 value.");
    }
}