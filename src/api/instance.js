import axios from "axios";

const instance = axios.create({
    baseURL: 'https://localhost/api',
});

export default instance