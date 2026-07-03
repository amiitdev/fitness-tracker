import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

console.log('[API] api.ts loaded');

const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri || Constants.debuggerHost;
const machineIP = debuggerHost ? debuggerHost.split(':')[0] : null;
const API_BASE = machineIP ? `http://${machineIP}:5000/api` : 'http://192.168.192.133:5000/api';

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    console.log('[API] getToken() - reading from AsyncStorage');
    cachedToken = await AsyncStorage.getItem('auth_token');
    console.log('[API] getToken() result:', cachedToken ? 'token found' : 'no token');
    return cachedToken;
  } catch (err) {
    console.log('[API] getToken() error:', err);
    return null;
  }
}

export async function setToken(token: string | null) {
  console.log('[API] setToken() called:', token ? 'setting token' : 'clearing token');
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem('auth_token', token);
  } else {
    await AsyncStorage.removeItem('auth_token');
  }
}

async function request(method: string, path: string, body?: unknown) {
  console.log('[API] request()', method, path);
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    console.log('[API] response:', path, res.status);
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  } catch (err) {
    console.log('[API] fetch error:', path, err);
    throw err;
  }
}

export const auth = {
  signup: (name: string, email: string, password: string) =>
    request('POST', '/auth/signup', { name, email, password }),
  signin: (email: string, password: string) =>
    request('POST', '/auth/signin', { email, password }),
  getMe: () => request('GET', '/auth/me'),
  updateMe: (updates: Record<string, string>) =>
    request('PUT', '/auth/me', updates),
};

export const exercises = {
  list: (params?: { search?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    const qs = query.toString();
    return request('GET', `/exercises${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request('GET', `/exercises/${id}`),
};

export const workouts = {
  list: () => request('GET', '/workouts'),
  create: (data?: { name?: string; exercises?: unknown[] }) =>
    request('POST', '/workouts', data || {}),
  getActive: () => request('GET', '/workouts/active'),
  update: (id: string, data: Record<string, unknown>) =>
    request('PUT', `/workouts/${id}`, data),
  complete: (id: string, data?: Record<string, unknown>) => request('POST', `/workouts/${id}/complete`, data),
  delete: (id: string) => request('DELETE', `/workouts/${id}`),
};

export const ai = {
  coach: (exerciseName: string) =>
    request('POST', '/ai/coach', { exerciseName }),
  chat: (message: string) =>
    request('POST', '/ai/chat', { message }),
};
