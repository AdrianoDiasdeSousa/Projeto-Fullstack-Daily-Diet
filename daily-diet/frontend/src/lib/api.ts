import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3333/api",
  withCredentials: true, // envia/recebe cookie httpOnly (JWT)
});
