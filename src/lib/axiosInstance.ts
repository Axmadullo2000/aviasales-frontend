import axios from 'axios';

// Базовый URL для axios с использованием переменной окружения
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
    baseURL: apiUrl, // Базовый URL для всех запросов
    timeout: 10000,   // Можно настроить таймаут, если нужно
});

export default axiosInstance;
