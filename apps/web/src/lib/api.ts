import { supabase } from './supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface ApiError {
  error: {
    message: string;
    code: string;
  };
}

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error?.message || 'An error occurred');
  }

  return response.json();
}

// Notes API
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotesResponse {
  success: boolean;
  data: {
    notes: Note[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
    filters: {
      q: string | null;
      tag: string | null;
      pinned: boolean | null;
      sort: string;
    };
  };
}

export interface NoteResponse {
  success: boolean;
  data: {
    note: Note;
  };
  message?: string;
}

export const notesApi = {
  getAll: async (params?: {
    q?: string;
    tag?: string;
    pinned?: boolean;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<NotesResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.tag) searchParams.append('tag', params.tag);
    if (params?.pinned !== undefined) searchParams.append('pinned', String(params.pinned));
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.offset) searchParams.append('offset', String(params.offset));

    const query = searchParams.toString();
    return fetchWithAuth(`/api/notes${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<NoteResponse> => {
    return fetchWithAuth(`/api/notes/${id}`);
  },

  create: async (data: {
    title: string;
    content: string;
    tags?: string[];
    pinned?: boolean;
  }): Promise<NoteResponse> => {
    return fetchWithAuth('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
    pinned?: boolean;
  }): Promise<NoteResponse> => {
    return fetchWithAuth(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchWithAuth(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tasks API (placeholder for future implementation)
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  priority: number;
  deadline: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const tasksApi = {
  // TODO: Implement tasks API methods
};
