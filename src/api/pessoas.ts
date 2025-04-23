import axios from "axios";
import { getAccessToken } from "./auth";

export async function buscarOuCriarPessoa(nome: string, telefone: string, clientId: number) {
  const res = await axios.post("http://localhost:8000/api/buscar_ou_criar_pessoa/", {
    nome,
    telefone,
    client_id: clientId
  }, {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  });
  return res.data;
}
