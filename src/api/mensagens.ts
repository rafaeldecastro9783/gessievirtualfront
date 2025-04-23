import axios from "axios";
import { getAccessToken } from "./auth";

export async function enviarMensagem(conversationId: number, texto: string) {
  return await axios.post("http://localhost:8000/api/mensagens/", {
    conversation: conversationId,
    enviado_por: "usuario",
    mensagem: texto
  }, {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  });
}
