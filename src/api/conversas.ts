import axios from "axios";
import { getAccessToken } from "./auth";

const BASE = "http://localhost:8000/api";

export async function listarConversas() {
  const res = await axios.get(`${BASE}/conversas/`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return res.data;
}

export async function assumirConversa(id: number) {
  await axios.post(`${BASE}/conversas/${id}/assumir/`, {}, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
}
