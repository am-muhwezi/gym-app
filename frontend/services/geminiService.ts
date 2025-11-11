import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and should not happen in the target environment.
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateWorkoutSuggestion = async (goal: string, currentWorkouts: string): Promise<string> => {
  if (!API_KEY) {
    return "AI features are disabled. Please configure your API key.";
  }

  const prompt = `
    You are an expert personal trainer providing workout ideas.
    A client's primary goal is: "${goal}".
    Their current workout focus is: "${currentWorkouts}".
    
    Based on this, generate a CONCISE and ACTIONABLE set of 3-5 alternative or supplementary exercises they could incorporate.
    Format the response as a simple list. Do not include any introductory or concluding paragraphs, just the list of exercises with a brief explanation for each.
    
    Example format:
    - Barbell Hip Thrusts: To build glute strength and support squat/deadlift performance.
    - Face Pulls: Excellent for rear delt and upper back development, improving posture.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating workout suggestion:", error);
    return "Sorry, I couldn't generate a suggestion at this time. Please try again later.";
  }
};
