import axios from "axios";

const instance = axios.create({
    baseURL: 'https://samg-api.projetosccetunirio.com.br/',
});
/*
const instance = axios.create({
    baseURL: 'http://localhost:80',
});*/

export default instance