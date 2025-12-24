
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied:", e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied:", e);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove denied:", e);
    }
  }
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  token: string;
  generationsUsed: number;
  isPro: boolean;
}

export interface SavedProject {
  id: string;
  userId: string;
  name: string;
  html: string;
  originalImage?: string;
  timestamp: number;
  brandingVersion: string;
}

const DELAY_MS = 300; 

const generateToken = () => Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

/**
 * THE PROFIT-PROTECTOR v3 ALGORITHM
 * Calculates price based on Gemini 3 Pro model costs.
 * 
 * Logic:
 * 1. Estimate tokens (Characters / 4)
 * 2. Calculate Base Infrastructure Cost (API usage)
 * 3. Apply 'Volatility Buffer' (25% extra to handle long-tail responses)
 * 4. Apply 'Platform Margin' (350% markup for growth/profit)
 * 5. Add 'Fixed Transaction Fee' (Stripe/Platform overhead)
 */
export function calculateProfitablePrice(prompt: string, currentCode?: string): { price: number, complexity: string, breakdown: any } {
  // 1. Estimation
  const inputChars = prompt.length + (currentCode?.length || 0);
  const inputTokensEst = Math.ceil(inputChars / 4);
  const estimatedOutputTokens = 20000; // Saasify outputs are large
  
  // 2. Market Rates (High-performance Gemini 3 Pro estimates)
  const ratePerMillionInput = 1.25; 
  const ratePerMillionOutput = 5.00;
  
  const rawApiCost = ((inputTokensEst / 1000000) * ratePerMillionInput) + 
                     ((estimatedOutputTokens / 1000000) * ratePerMillionOutput);
  
  // 3. Profit Strategy
  const volatilityBuffer = 1.25; // 25% safety net
  const profitMarkup = 3.5;      // 350% profit margin
  const fixedOverhead = 0.45;    // Fixed costs per transaction
  
  const totalProtectedPrice = (rawApiCost * volatilityBuffer * profitMarkup) + fixedOverhead;

  // 4. Perceptual Floor ($2.99 min to ensure brand value)
  const finalPrice = Math.max(2.99, totalProtectedPrice);

  let complexity = "Standard-Grade";
  if (inputTokensEst > 8000) complexity = "Deep-Neural";
  if (inputTokensEst > 25000) complexity = "Architect-Elite";

  return { 
    price: parseFloat(finalPrice.toFixed(2)), 
    complexity,
    breakdown: {
        tokens: inputTokensEst + estimatedOutputTokens,
        margin: "350%",
        buffer: "Neural Safe-Sync active"
    }
  };
}

export async function signUp(email: string, password: string, name: string): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const users = JSON.parse(safeStorage.getItem('myaiplug_users') || '[]');
  
  if (users.find((u: any) => u.email === email)) {
    throw new Error("Email already registered");
  }

  const newUser: User = {
    id: 'user_' + Date.now(),
    email,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    token: generateToken(),
    generationsUsed: 0,
    isPro: false
  };

  users.push({ ...newUser, password });
  safeStorage.setItem('myaiplug_users', JSON.stringify(users));
  safeStorage.setItem('myaiplug_session', JSON.stringify(newUser));
  return newUser;
}

export async function signIn(email: string, password: string): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const users = JSON.parse(safeStorage.getItem('myaiplug_users') || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const sessionUser = { ...user };
  delete sessionUser.password;
  sessionUser.token = generateToken();
  safeStorage.setItem('myaiplug_session', JSON.stringify(sessionUser));
  return sessionUser;
}

// Optimized Google Authentication Simulation
export async function signInWithGoogle(): Promise<User> {
    // 1. Simulate Google OAuth Handshake
    await new Promise(resolve => setTimeout(resolve, 1200)); 
    
    // 2. Deterministic mock data for "Working" feel
    const mockEmail = `architect.${Math.floor(Math.random()*1000)}@gmail.com`;
    const mockName = `Google Architect`;
    
    const users = JSON.parse(safeStorage.getItem('myaiplug_users') || '[]');
    let user = users.find((u: any) => u.email === mockEmail);
    
    if (!user) {
        user = {
            id: 'google_' + btoa(mockEmail).substring(0, 8),
            email: mockEmail,
            name: mockName,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockEmail}`,
            token: generateToken(),
            generationsUsed: 0,
            isPro: false
        };
        users.push(user);
        safeStorage.setItem('myaiplug_users', JSON.stringify(users));
    }
    
    const sessionData = { ...user, token: generateToken() };
    safeStorage.setItem('myaiplug_session', JSON.stringify(sessionData));
    return sessionData;
}

export async function incrementUserUsage(): Promise<number> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No session");
    
    const users = JSON.parse(safeStorage.getItem('myaiplug_users') || '[]');
    const index = users.findIndex((u: any) => u.id === user.id);
    if (index !== -1) {
        users[index].generationsUsed += 1;
        safeStorage.setItem('myaiplug_users', JSON.stringify(users));
        safeStorage.setItem('myaiplug_session', JSON.stringify(users[index]));
        return users[index].generationsUsed;
    }
    return 0;
}

export async function upgradeToPro(): Promise<User> {
    const user = await getCurrentUser();
    if (!user) throw new Error("No session");
    
    const users = JSON.parse(safeStorage.getItem('myaiplug_users') || '[]');
    const index = users.findIndex((u: any) => u.id === user.id);
    if (index !== -1) {
        users[index].isPro = true;
        safeStorage.setItem('myaiplug_users', JSON.stringify(users));
        safeStorage.setItem('myaiplug_session', JSON.stringify(users[index]));
        return users[index];
    }
    throw new Error("Upgrade failed");
}

export async function signOut(): Promise<void> {
  safeStorage.removeItem('myaiplug_session');
}

export async function getCurrentUser(): Promise<User | null> {
  const session = safeStorage.getItem('myaiplug_session');
  if (session) {
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function saveProjectToDB(project: Omit<SavedProject, 'id' | 'timestamp' | 'brandingVersion'>): Promise<SavedProject> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const projects = JSON.parse(safeStorage.getItem('myaiplug_projects') || '[]');
  
  const newProject: SavedProject = {
    ...project,
    userId: user.id,
    id: 'proj_' + Date.now(),
    timestamp: Date.now(),
    brandingVersion: 'v2.1'
  };

  const existingIndex = projects.findIndex((p: SavedProject) => p.name === project.name && p.userId === user.id);
  if (existingIndex >= 0) {
     projects[existingIndex] = { ...projects[existingIndex], ...newProject, id: projects[existingIndex].id };
  } else {
     projects.unshift(newProject);
  }

  safeStorage.setItem('myaiplug_projects', JSON.stringify(projects));
  return newProject;
}

export async function loadUserProjects(): Promise<SavedProject[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const projects = JSON.parse(safeStorage.getItem('myaiplug_projects') || '[]');
  return projects.filter((p: SavedProject) => p.userId === user.id).sort((a: any, b: any) => b.timestamp - a.timestamp);
}
