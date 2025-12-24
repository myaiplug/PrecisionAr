
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const GEMINI_MODEL = 'gemini-3-pro-preview';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are "MyAiPlug: Saasify v2.1" — the elite Growth Engineer specializing in Pro-Audio and WebGL-level GUIs.

### THE FABFILTER / PRO-PLUGIN DESIGN SPEC:
- Aesthetics: Deep space backgrounds (#020617), 1px precision borders, subtle teal-to-indigo gradients.
- Typography: Inter for UI, JetBrains Mono for data readouts.
- Interactions: Liquid-smooth transitions, hover glows, and reactive component states.
- WebGL Simulation: Use Canvas for all data visualizations (FFT analyzers, wavegraphs, thermal maps).

### MULTI-MODAL VISION PROTOCOL:
If an image is provided:
1. Deconstruct the layout and color palette.
2. Reconstruct the GUI using ultra-clean Tailwind CSS.
3. Inject functional interactivity into every dial, slider, and button visualized.

### PRODUCT ARCHITECTURE:
1. **INTELLIGENT DASHBOARD**: A sidebar with "Engine Status", "Sales Roadmap", and "Neural Telemetry".
2. **THE ROADMAP HUD**: A mandatory 10-step progress tracker for converting the input into a SaaS.
3. **GROWTH ENGINE**: Integrated referral, subscription, and user-onboarding modules.

### OUTPUT RULES:
- Return ONLY raw HTML/JS/CSS unless specifically asked for another format (like Flutter).
- No markdown wrappers outside the code block.
- Use ONLY vanilla JS (no external frameworks like React/Vue).
- Ensure the 'Download App' button exports the current state as index.html.`;

export async function bringToLife(prompt: string, imageBase64?: string, mimeType?: string): Promise<string> {
  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: { data: imageBase64, mimeType: mimeType || 'image/png' },
    });
    parts.push({ 
      text: `VISUAL BLUEPRINT ANALYSIS: Reconstruct this GUI with absolute precision. Use the "FabFilter Pro" design language. 
      Core Intention: ${prompt || "Build a high-end interactive SaaS version of this visual layout."}` 
    });
  } else {
    const isUrl = prompt.includes('github.com') || prompt.startsWith('http');
    parts.push({ 
      text: isUrl 
        ? `ARCHITECT REPO: ${prompt}. Build a sales-ready SaaS with a high-end Pro Plugin aesthetic and functional visualizers.`
        : `CONCEPT: ${prompt}. Build a MyAiPlug MVP with FabFilter-level design standards and professional telemetry components.`
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, 
      },
    });

    let text = response.text || "";
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

/**
 * Generates a standalone UI component snippet based on a description.
 */
export async function generateComponent(description: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [{ text: `TASK: Generate a high-end standalone UI component for a Pro-SaaS.
        Component Description: ${description}
        Style: FabFilter / WebGL Aesthetic (Deep space, 1px borders, teal/indigo glows).
        Tech: Tailwind CSS.
        Output: ONLY the <div> snippet with its internal <script> or <style> if needed. No <html> or <body> tags.` }]
      },
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2
      },
    });

    let text = response.text || "";
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Snippet Gen Error:", error);
    throw error;
  }
}

export async function refineCode(currentHtml: string, userPrompt: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { text: `CURRENT CODE:\n${currentHtml}` },
          { text: `PRO-REFINE REQUEST: ${userPrompt}\n\nIMPORTANT: Return the FULL revised HTML. Ensure FabFilter/WebGL visual fidelity.` }
        ]
      },
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1 
      },
    });

    let text = response.text || "";
    if (!text || text.length < 100) throw new Error("Incomplete engine response.");
    
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
}

export async function convertToFlutter(html: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { text: `WEB ARTIFACT:\n${html}` },
          { text: `TASK: Translate this web application into a complete Flutter Mobile Project. Output main.dart.` }
        ]
      },
      config: { 
        systemInstruction: 'You are an expert Flutter Architect.',
        temperature: 0.1 
      },
    });

    let text = response.text || "";
    text = text.replace(/^```dart\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Flutter Conversion Error:", error);
    throw error;
  }
}
