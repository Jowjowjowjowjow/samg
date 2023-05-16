import axios from "axios";

const instance = axios.create({
    //baseURL: 'http://localhost:3000/',
    baseURL: 'https://samg.projetosccetunirio.com.br:80/',
});

export default instance