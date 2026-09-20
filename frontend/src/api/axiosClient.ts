import axios from 'axios';
import { getApiBaseUrl } from '../config/apiConfig';
import { storage } from '../utils/storage';

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      storage.removeToken();
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
