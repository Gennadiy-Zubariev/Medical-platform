import axios from "axios";

const axiosClient = axios.create({
    baseURL: "/api/",
});

// 🔑 Add access token to each request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🔄 Auto refresh token
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If access expired and haven't tried updating yet
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

                const res = await axios.post("/api/token/refresh/", {refresh});

                const newAccess = res.data.access;
                localStorage.setItem("access", newAccess);

                // 🔁 Repeat the original request
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // refresh expired → login
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
