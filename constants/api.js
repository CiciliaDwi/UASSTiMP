import axios from 'axios';

const BASE_URL = 'http://ubaya.cloud/react/160422148/uas/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export default api;