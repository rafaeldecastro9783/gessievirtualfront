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

interface Conversa {
  id: number;
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
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/conversas/`, {
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

  // 🔥 Aqui criamos o adaptador de Conversa para Conversation
  const handleSelecionar = (conv: Conversa) => {
    const conversaAdaptada: Conversation = {
      ...conv,
      phone: conv.person_telefone, // Adaptando: usando o person_telefone como phone
    };
    setConversaSelecionada(conversaAdaptada);
  };
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <ConversasList
        conversas={conversas}
        onSelecionar={handleSelecionar}
        onAtualizar={fetchConversas}
      />
      <ChatBox conversa={conversaSelecionada} />
    </div>
  );
}
