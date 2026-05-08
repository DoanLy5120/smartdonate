import axios from "axios";

import { API_URL } from "./config";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// REGISTER
export const registerAPI = (data) => {
  return axiosClient.post("/register", data);
};

export const sendOtpAPI = (data) => {
  return axiosClient.post("/send-otp", data);
};

export const resendOtpAPI = (data) => {
  return axiosClient.post("/resend-otp", data);
};

// FORGOT PASSWORD (gửi OTP)
export const forgotPasswordAPI = (data) => {
  return axiosClient.post("/forgot-password", data);
};

export const verifyOtpAPI = (data) => {
  return axiosClient.post("/verify-otp", data);
};

// RESET PASSWORD
export const resetPasswordAPI = (data) => {
  return axiosClient.post("/reset-password", data);
};

// LOGIN
export const loginAPI = (data) => {
  return axiosClient.post("/login", data);
};

export const getMeAPI = () => {
  return axiosClient.get("/me");
};

// GOOGLE LOGIN
export const loginGoogleAPI = () => {
  window.location.href = `${API_URL}auth/google`;
};

export const logoutAPI = () => {
  return axiosClient.post("/logout");
};

export default axiosClient;