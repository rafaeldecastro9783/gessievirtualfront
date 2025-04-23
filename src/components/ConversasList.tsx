import axios from "axios";
import { getAccessToken } from "../api/auth";

interface Conversa {
  id: number;
  person_nome: string;
  person_telefone: string;
  ultima_mensagem?: string;
  assumido_por_mim?: boolean;
}

interface Props {
  conversas: Conversa[];
  onSelecionar: (conv: Conversa) => void;
  onAtualizar: () => void;
}

export default function ConversasList({ conversas, onSelecionar, onAtualizar }: Props) {
  const assumirConversa = async (id: number) => {
    try {
      await axios.post(`http://localhost:8000/api/conversas/${id}/assumir/`, {}, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      onAtualizar(); // recarrega lista
    } catch (err) {
      console.error("Erro ao assumir conversa:", err);
    }
  };

  return (
    <aside style={{ width: "300px", paddingRight: "1rem", borderRight: "1px solid #ddd" }}>
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
                transition: "background 0.2s ease"
              }}
            >
              <strong style={{ display: "block", color: "#333" }}>{conv.person_nome}</strong>
              <small style={{ display: "block", color: "#666" }}>{conv.person_telefone}</small>
              <em style={{ display: "block", color: "#999", fontSize: "0.9rem" }}>
                {conv.ultima_mensagem || "Sem mensagens ainda."}
              </em>

              {conv.assumido_por_mim ? (
                <span style={{ color: "#128C7E", fontWeight: "bold" }}>✅ Comigo</span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    assumirConversa(conv.id);
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
                  Assumir
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
