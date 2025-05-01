import { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../api/auth";

interface Pessoa {
  id: number;
  nome: string;
  telefone: string;
  idade: string;
  grau_interesse: string;
  ativo: boolean;
}

export default function Pessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  useEffect(() => {
    const fetchPessoas = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/pessoas/`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        setPessoas(response.data);
      } catch (error) {
        console.error("Erro ao buscar pessoas:", error);
      }
    };

    fetchPessoas();
  }, []);

  return (
    <div>
      <h2 style={{ color: "#075e54", marginBottom: "1rem" }}>👥 Lista de Pessoas</h2>
      {pessoas.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pessoas.map((p) => (
            <li
              key={p.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "8px",
                backgroundColor: "#f7f9fa",
                borderLeft: p.ativo ? "4px solid #128C7E" : "4px solid #999",
                color: "#333"
              }}
            >
              <strong style={{ display: "block", fontSize: "1.1rem", color: "#111" }}>{p.nome}</strong>
              <div style={{ fontSize: "0.95rem", color: "#444", marginTop: "0.25rem" }}>
                📞 {p.telefone} <br />
                🎂 Idade: {p.idade} <br />
                🌡️ Interesse: {p.grau_interesse || "não informado"} <br />
                {p.ativo ? "✅ Ativo" : "❌ Inativo"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: "1rem", color: "#666" }}>Nenhuma pessoa encontrada.</p>
      )}
    </div>
  );
}
