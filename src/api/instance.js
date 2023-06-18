import axios from "axios";

const instance = axios.create({
    baseURL: 'https://samg-api.projetosccetunirio.com.br/',
});

export default instance