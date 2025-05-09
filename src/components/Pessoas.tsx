import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAccessToken } from '../api/auth';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

interface Pessoa {
  id: number;
  nome: string;
  telefone: string;
  idade: number;
  grau_interesse: string;
  ativo: boolean;
  foto_url?: string;
  photo_url?: string;
}

export default function Pessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);

  const alterarStatus = async (id: number, novoStatus: boolean) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/pessoas/${id}/`,
        { ativo: novoStatus },
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        }
      );
      setPessoas(prev =>
        prev.map(p => (p.id === id ? { ...p, ativo: novoStatus } : p))
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const fetchPessoas = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/pessoas/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setPessoas(response.data);
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
    }
  };

  const importarContatos = async () => {
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/importar-contatos/`, {}, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      await fetchPessoas();
      alert("Contatos importados com sucesso!");
    } catch (error) {
      console.error("Erro ao importar contatos:", error);
      alert("Erro ao importar contatos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  const obterImagem = (pessoa: Pessoa): string => {
    return pessoa.photo_url || pessoa.foto_url || 'https://via.placeholder.com/40?text=Sem+foto';
  };

  return (
    <div>
      <h2 style={{ color: "#075e54", marginBottom: "1rem" }}>👥 Lista de Pessoas</h2>

      <button
        onClick={importarContatos}
        disabled={loading}
        style={{
          backgroundColor: "#128C7E",
          color: "white",
          border: "none",
          padding: "10px 20px",
          marginBottom: "1rem",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Importando..." : "📥 Importar Contatos"}
      </button>

      {pessoas.length > 0 ? (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: "#128C7E", color: "white", padding: "0.5rem" }}>Nome</th>
              <th style={{ backgroundColor: "#128C7E", color: "white", padding: "0.5rem" }}>Telefone</th>
              <th style={{ backgroundColor: "#128C7E", color: "white", padding: "0.5rem" }}>Idade</th>
              <th style={{ backgroundColor: "#128C7E", color: "white", padding: "0.5rem" }}>Interesse</th>
              <th style={{ backgroundColor: "#128C7E", color: "white", padding: "0.5rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map(pessoa => (
              <tr key={pessoa.id} style={{ backgroundColor: pessoa.ativo ? "#f8f9fa" : "#fff" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img
                      src={obterImagem(pessoa)}
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
                    onClick={() => alterarStatus(pessoa.id, !pessoa.ativo)}
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
      ) : (
        <p>Nenhuma pessoa cadastrada</p>
      )}
    </div>
  );
}
