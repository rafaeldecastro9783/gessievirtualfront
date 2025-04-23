import { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../api/auth";
import ConversasList from "./ConversasList";
import ChatBox from "./ChatBox";

interface Conversation {
  id: number;
  phone: string;
  person_nome: string;
  person_telefone: string;
  ultima_mensagem?: string;
  assumido_por_mim?: boolean;
}

export default function Messages() {
  const [conversas, setConversas] = useState<Conversation[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversation | null>(null);

  const fetchConversas = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/conversas/", {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      setConversas(response.data);
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    }
  };

  useEffect(() => {
    fetchConversas();
  }, []);

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <ConversasList
        conversas={conversas}
        onSelecionar={setConversaSelecionada}
        onAtualizar={fetchConversas}
      />
      <ChatBox conversa={conversaSelecionada} />
    </div>
  );
}
