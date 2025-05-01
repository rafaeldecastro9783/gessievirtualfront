import axios from "axios";
import { useEffect } from "react";
import { getAccessToken } from "../api/auth";

interface Conversa {
  id: number;
  person_nome: string;
  person_telefone: string;
  ultima_mensagem?: string;
  gessie_silenciada?: boolean;
}

interface Props {
  conversas: Conversa[];
  onSelecionar: (conv: Conversa) => void;
  onAtualizar: (novas : Conversa[]) => void;
}

export default function ConversasList({ conversas, onSelecionar, onAtualizar }: Props) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/conversas/`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
        console.log("✅ Conversas atualizadas automaticamente", response.data);
        onAtualizar(response.data);
      } catch (error) {
        console.error("⚠️ Erro ao buscar conversas novas:", error);
      }
    }, 1000); // Atualiza a cada 1 segundo

    return () => clearInterval(interval); // Limpa o intervalo no desmontar
  }, [onAtualizar]);

  const silenciar = async (phone: string, minutos: number) => {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/silenciar-gessie/`, {
      phone,
      minutos
    }, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
    alert("Gessie silenciada!");
  };
  

  return (
    <aside style={{ width: "300px", paddingRight: "1rem", borderRight: "1px solid #ddd", overflow: "auto", height: "100vh", scrollBehavior: "smooth"
    }}>
      <h3 style={{ marginBottom: "1rem", color: "#075e54" }}>💬 Conversas</h3>

      {conversas.length === 0 ? (
        <p style={{ color: "#777" }}>Nenhuma conversa disponível.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {conversas.map((conv) => (
            <li
              key={conv.id}
              onClick={() => onSelecionar(conv)}
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                transition: "background 0.2s ease",
                position: "relative"
              }}
            >
              <strong style={{ display: "block", color: "#333" }}>{conv.person_nome}</strong>
              <small style={{ display: "block", color: "#666" }}>{conv.person_telefone}</small>
              <em style={{ display: "block", color: "#999", fontSize: "0.9rem" }}>
                {conv.ultima_mensagem || "Sem mensagens ainda."}
              </em>

              {conv.gessie_silenciada ? (
                <span style={{ 
                  color: "#128C7E", 
                  fontWeight: "bold", 
                  position: "absolute", 
                  top: "8px", 
                  right: "8px"
                }}>
                  ✅ Gessie silenciada
                </span>
              ) : (
                <button
                  onClick={(_e) => {
                    silenciar(conv.person_telefone, 10);
                  }}
                  style={{
                    marginTop: "0.5rem",
                    backgroundColor: "#25D366",
                    color: "#fff",
                    border: "none",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                🔕 Silenciar Gessie por 5 min
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
