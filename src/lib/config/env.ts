export const env = {
    // ✅ ВАЖНО: Должно быть http://localhost:8080/api (НЕ /api/v1)
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Вывод в консоль для проверки
if (typeof window !== 'undefined') {
    console.log('🔧 Environment Config:', {
        API_URL: env.API_URL,
        NODE_ENV: env.NODE_ENV,
    });
}
