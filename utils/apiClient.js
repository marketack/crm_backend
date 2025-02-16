const axios = require('axios');

const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api/notifications', // Replace with your backend's base URL
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token dynamically if needed
apiClient.interceptors.request.use((config) => {
    // Add Bearer token dynamically
    const token = process.env.API_TOKEN || '<default-token>'; // Replace with a valid token
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

module.exports = apiClient;