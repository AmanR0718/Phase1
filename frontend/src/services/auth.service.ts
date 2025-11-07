import axiosClient from "@/utils/axios";

export const authService = {
  async login(username: string, password: string) {
    const { data } = await axiosClient.post("/auth/login", {
      username,
      password,
    });
    return data;
  },

  async getCurrentUser() {
    const { data } = await axiosClient.get("/auth/me");
    return data;
  },

  async refresh(refresh_token: string): Promise<string | null> {
    try {
      const { data } = await axiosClient.post("/auth/refresh", {
        refresh_token,
      });
      return data.access_token;
    } catch (err) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
  },
};
