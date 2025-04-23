import axios from "axios";
import { getAccessToken } from "./auth";

export async function listarAgendamentos() {
  const res = await axios.get("http://localhost:8000/api/agendamentos/", {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return res.data;
}

export async function novoAgendamento(data: any) {
  return await axios.post("http://localhost:8000/api/agendamentos/", data, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
}
