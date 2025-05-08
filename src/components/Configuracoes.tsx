import { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../api/auth";

interface ConfigData {
  id: number;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  zapi_url_text: string;
  zapi_url_audio: string;
  zapi_token: string;
  assistant_id: string;
  prompt_personalizado: string;
  ativo: boolean;
  status: string;
}

export default function Configuracoes() {
  const [config, setConfig] = useState<ConfigData | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/clientes/`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        setConfig(response.data[0]); // pega o primeiro registro (cliente logado)
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (field: keyof ConfigData, value: string) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const salvarConfiguracoes = async () => {
    if (!config) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/clientes/${config.id}/`, config, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      alert("✅ Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("❌ Falha ao salvar.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem",
    marginTop: "0.25rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    color: "#222",
    backgroundColor: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    color: "#222",
    fontWeight: 500
  };

  const botaoSalvar: React.CSSProperties = {
    padding: "0.8rem",
    backgroundColor: "#128C7E",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "1rem"
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ color: "#128C7E", textAlign: "center", marginBottom: "2rem" }}>
        Configurações do Cliente
      </h1>

      {config && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "#128C7E", marginBottom: "1rem" }}>Status do Sistema</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ 
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              backgroundColor: config.status === 'ativo' ? '#E6F4F1' : '#FEE7E2',
              color: config.status === 'ativo' ? '#128C7E' : '#FF3B30',
              fontWeight: "bold"
            }}>
              {config.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </div>
            <button
              onClick={() => alterarStatus(!config.ativo)}
              style={{
                padding: "0.5rem 1.5rem",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor: config.ativo ? "#FF3B30" : "#128C7E",
                color: "white",
                transition: "background-color 0.2s"
              }}
            >
              {config.ativo ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>
      )}
      {!config ? (
        <p>Carregando...</p>
      ) : (
        <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {[
            { label: "Nome da Clínica", field: "nome" },
            { label: "CNPJ", field: "cnpj" },
            { label: "Email", field: "email" },
            { label: "Telefone", field: "telefone" },
            { label: "Z-API: URL Texto", field: "zapi_url_text" },
            { label: "Z-API: URL Áudio", field: "zapi_url_audio" },
            { label: "Z-API: Token", field: "zapi_token" },
            { label: "Assistant ID (OpenAI)", field: "assistant_id" },
            { label: "Prompt Personalizado", field: "prompt_personalizado", isTextarea: true }
          ].map(({ label, field, isTextarea }) => (
            <label key={field} style={labelStyle}>
              {label}:
              {isTextarea ? (
                <textarea
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={(config as any)[field] || ""}
                  onChange={(e) => handleChange(field as keyof ConfigData, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  style={inputStyle}
                  value={(config as any)[field] || ""}
                  onChange={(e) => handleChange(field as keyof ConfigData, e.target.value)}
                />
              )}
            </label>
          ))}

          <button onClick={salvarConfiguracoes} style={botaoSalvar}>Salvar Configurações</button>
        </div>
      )}
    </div>
  );
}
