import { create } from "zustand";
import { apiClient } from "../api/apiCLient";
import { getToken } from "../utils/token";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  access_level: "client" | "admin";
  status: "active" | "blocked";
}

interface AdminState {
  users: User[];
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
  createUser: (userData: Omit<User, "id" | "status"> & { password: string }) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],

  fetchUsers: async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await apiClient.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ users: response.data });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },

  fetchUserById: async (id) => {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await apiClient.get(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  createUser: async (userData) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await apiClient.post("/users", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        users: [...state.users, response.data],
      }));
    } catch (error) {
      console.error("Error creating user:", error);
    }
  },

  deleteUser: async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      await apiClient.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  },

  updateUser: async (id, userData) => {
    const token = getToken();
    if (!token) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await apiClient.put(`/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...userData } : user
        ),
      }));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  },
}));
