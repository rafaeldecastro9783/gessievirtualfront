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
  foto_url?: string;
  photo?: string;
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
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {pessoas.map((pessoa) => (
              <tr key={pessoa.id} style={{ backgroundColor: pessoa.ativo ? "#f8f9fa" : "#fff" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img
                      src={pessoa.photo || pessoa.foto_url || 'https://via.placeholder.com/40?text=Sem+foto'}
                      alt={pessoa.nome}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #e9ecef"
                      }}
                    />
                    <span>{pessoa.nome}</span>
                  </div>
                </td>
                <td>{pessoa.telefone}</td>
                <td>{pessoa.idade}</td>
                <td>{pessoa.grau_interesse}</td>
                <td>
                  <button
                    onClick={() => console.log("Alterar status", pessoa.id, !pessoa.ativo)}
                    style={{
                      backgroundColor: pessoa.ativo ? "#dc3545" : "#28a745",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {pessoa.ativo ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: "1rem", color: "#666" }}>Nenhuma pessoa encontrada.</p>
      )}
    </div>
  );
}
