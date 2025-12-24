
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Safe storage wrapper to prevent SecurityErrors in restricted iframes/sandboxes
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
    token: generateToken()
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
    brandingVersion: 'v1.0-auto'
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
