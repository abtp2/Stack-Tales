"use client";
import { useState, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "@/types/admin";

const initializeAI = (): GoogleGenAI | null => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.warn("Google AI API key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const useAI = () => {
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [components, setComponents] = useState<ChatMessage[]>([]);
  const ai = initializeAI();

  const generateText = useCallback(async (inputText: string): Promise<void> => {
    if (!ai) {
      const errorMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: "API key not configured. Please check your environment variables.", 
        type: "ai",
        timestamp: new Date()
      };
      setComponents(prev => [...prev, errorMessage]);
      return;
    }

    try {
      setAiLoading(true);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: inputText,
      });
      const text = response.text;
      if (text) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text, 
          type: "ai", 
          timestamp: new Date()
        };
        setComponents(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : "Something went wrong while generating content.";
      
      const aiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        text: errorMessage, 
        type: "ai",
        timestamp: new Date()
      };
      setComponents(prev => [...prev, aiMessage]);
    } finally {
      setAiLoading(false);
    }
  }, [ai]);

  const addUserMessage = useCallback((text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text, 
      type: "user",
      timestamp: new Date()
    };
    setComponents(prev => [...prev, userMessage]);
  }, []);

  return {
    aiLoading,
    components,
    generateText,
    addUserMessage
  };
};