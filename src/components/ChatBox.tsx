import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../api/auth";

interface Props {
  conversa: {
    id: number;
    person_nome: string;
  } | null;
}

interface Mensagem {
  id: number;
  mensagem: string;
  enviado_por: "usuario" | "gessie" | "pessoa";
  data: string;
}

export default function ChatBox({ conversa }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMensagens = async () => {
      if (!conversa) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/mensagens/?conversation=${conversa.id}`
,
          {
            headers: { Authorization: `Bearer ${getAccessToken()}` },
          }
        );
        setMensagens(response.data);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }
    };

    fetchMensagens();
  }, [conversa]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!texto.trim() || !conversa) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/mensagens/`,
        {
          mensagem: texto,
          enviado_por: "usuario",
          tipo: "texto",
          conversation: conversa.id,
        },
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );

      setTexto("");

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/mensagens/?conversation=${conversa.id}`,
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );
      setMensagens(res.data);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  if (!conversa) {
    return <p style={{ color: "#777" }}>Selecione uma conversa à esquerda.</p>;
  }

  return (
    <div style={{ flex: 1 }}>
      <h3 style={{ color: "#075e54", marginBottom: "1rem" }}>
        📨 Conversa com <strong>{conversa.person_nome}</strong>
      </h3>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          height: "400px",
          overflowY: "auto",
          background: "#f9f9f9",
        }}
      >
        {mensagens.map((msg) => {
          let bgColor = "#ffffff";
          let remetente = "👤 Pessoa";
          if (msg.enviado_por === "usuario") {
            bgColor = "#dcf8c6";
            remetente = "🧑‍⚕️ Usuário";
          } else if (msg.enviado_por === "gessie") {
            bgColor = "#f1f0f0";
            remetente = "🤖 Gessie";
          }

          return (
            <div
              key={msg.id}
              style={{
                marginBottom: "1rem",
                textAlign: msg.enviado_por === "usuario" ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: bgColor,
                  padding: "0.5rem 1rem",
                  borderRadius: "16px",
                  maxWidth: "80%",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#555", marginBottom: "0.25rem", fontWeight: 600 }}>
                  {remetente}
                </div>

                <div style={{ fontSize: "0.95rem", color: "#333" }}>
                  {msg.mensagem}
                </div>

                <small style={{ color: "#888", display: "block", marginTop: "4px" }}>
                  {new Date(msg.data).toLocaleString("pt-BR")}
                </small>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={enviarMensagem}
          style={{
            backgroundColor: "#128C7E",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
