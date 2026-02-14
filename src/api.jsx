// // api.js
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

// const api = axios.create({
//   baseURL: API_BASE,
//   withCredentials: true, // send cookies
// });

// // Add access token to headers
// api.interceptors.request.use((config) => {
//     //   const { auth, logout } = useContext(AuthContext);
//   const token = localStorage.getItem("accessToken"); // or context
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle 401 and refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       // try refresh
//       const res = await axios.post(
//         `${API_BASE}/api/auth/refresh`,
//         {},
//         { withCredentials: true }
//       );

//       if (res.status === 200) {
//         const newToken = res.data.accessToken;
//         localStorage.setItem("accessToken", newToken);

//         // retry original request with new token
//         originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
//         return api(originalRequest);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

// api.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies with every request
});

// Response interceptor for handling 401 and refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (refresh token also stored in cookies)
        const res = await axios.post(
          `${API_BASE}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.status === 200) {
          // Retry original request (no need to manually attach token)
          return api(originalRequest);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
