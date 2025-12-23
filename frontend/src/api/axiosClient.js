import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// 🔑 додаємо access token до кожного запиту
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔄 auto refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // якщо access протух і ще не пробували оновлювати
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
          throw new Error("No refresh token");
        }

        const res = await axios.post(
          "http://localhost:8000/api/token/refresh/",
          { refresh }
        );

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);

        // 🔁 повторюємо оригінальний запит
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // refresh теж протух → логін заново
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
