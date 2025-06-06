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

interface UnidadeAtendimento {
  id?: number;
  nome: string;
  endereco: string;
  telefone?: string;
  email?: string;
  cnpj?: string;
}

const labelStyle: React.CSSProperties = {
  fontWeight: "bold",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "1rem"
};

const botaoSalvar: React.CSSProperties = {
  backgroundColor: "#128C7E",
  color: "white",
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold",
  cursor: "pointer"
};

interface StatusDoSistemaProps {
  config: ConfigData;
  alterarStatus: (novoStatus: boolean) => void;
}

function StatusDoSistema({ config, alterarStatus }: StatusDoSistemaProps) {
  return (
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
  );
}

interface ConfiguracoesCamposProps {
  config: ConfigData;
  handleChange: (field: keyof ConfigData, value: string) => void;
  salvarConfiguracoes: () => void;
}

function ConfiguracoesCampos({ config, handleChange, salvarConfiguracoes }: ConfiguracoesCamposProps) {
  const campos: { label: string; field: keyof ConfigData; isTextarea?: boolean }[] = [
    { label: "Nome do Cliente", field: "nome" },
    { label: "CNPJ Para Faturamento", field: "cnpj" },
    { label: "Email", field: "email" },
    { label: "Telefone Conectado", field: "telefone" },
    { label: "API: URL Texto", field: "zapi_url_text" },
    { label: "API: URL Áudio", field: "zapi_url_audio" },
    { label: "API: Token", field: "zapi_token" },
    { label: "Assistant ID (OpenAI)", field: "assistant_id" },
    { label: "Prompt Personalizado", field: "prompt_personalizado", isTextarea: true }
  ];

  return (
    <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {campos.map(({ label, field, isTextarea }) => {
        const value = config[field];
        return (
          <label key={field} style={labelStyle}>
            {label}:
            {isTextarea ? (
              <textarea
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            ) : (
              <input
                type="text"
                style={inputStyle}
                value={typeof value === "string" || typeof value === "number" ? value : ""}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}
          </label>
        );
      })}
      <button onClick={salvarConfiguracoes} style={botaoSalvar}>Salvar Configurações</button>
    </div>
  );
}

interface ListaUnidadesProps {
  unidades: UnidadeAtendimento[];
  excluirUnidade: (id: number) => void;
}

function ListaUnidades({ unidades, excluirUnidade }: ListaUnidadesProps) {
  return (
    <div style={{ marginTop: "3rem" }}>
      <h2 style={{ color: "#128C7E" }}>Unidades de Atendimento</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        {unidades.map(un => (
          <div key={un.id} style={{ border: "1px solid #ccc", borderRadius: "6px", padding: "0.75rem", background: "#f9f9f9" }}>
            <strong>{un.nome}</strong><br />
            {un.endereco}<br />
            📞 {un.telefone || "—"} | ✉️ {un.email || "—"} | 🧾 {un.cnpj || "—"}<br />
            <button
              onClick={() => un.id && excluirUnidade(un.id)}
              style={{ marginTop: "0.5rem", background: "#FF3B30", color: "white", border: "none", padding: "0.5rem", borderRadius: "4px", cursor: "pointer" }}
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface NovaUnidadeFormProps {
  novaUnidade: UnidadeAtendimento;
  setNovaUnidade: (unidade: UnidadeAtendimento) => void;
  adicionarUnidade: () => void;
}

function NovaUnidadeForm({ novaUnidade, setNovaUnidade, adicionarUnidade }: NovaUnidadeFormProps) {
  const fields = ["nome", "endereco", "telefone", "email", "cnpj"];
  return (
    <div>
      <h3 style={{ marginTop: "2rem" }}>Nova Unidade</h3>
      {fields.map(field => (
        <label key={field} style={labelStyle}>
          {field.charAt(0).toUpperCase() + field.slice(1)}:
          <input
            type="text"
            style={inputStyle}
            value={novaUnidade[field as keyof UnidadeAtendimento] || ""}
            onChange={e => setNovaUnidade({ ...novaUnidade, [field]: e.target.value })}
          />
        </label>
      ))}
      <button onClick={adicionarUnidade} style={{ ...botaoSalvar, marginTop: "1rem" }}>Adicionar Unidade</button>
    </div>
  );
}

interface ClienteConfiguracoesProps {
  config: ConfigData;
  alterarStatus: (novoStatus: boolean) => void;
  handleChange: (field: keyof ConfigData, value: string) => void;
  salvarConfiguracoes: () => void;
  unidades: UnidadeAtendimento[];
  excluirUnidade: (id: number) => void;
  novaUnidade: UnidadeAtendimento;
  setNovaUnidade: (unidade: UnidadeAtendimento) => void;
  adicionarUnidade: () => void;
}

function ClienteConfiguracoes({ config, alterarStatus, handleChange, salvarConfiguracoes, unidades, excluirUnidade, novaUnidade, setNovaUnidade, adicionarUnidade }: ClienteConfiguracoesProps) {
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

      {config ? (
        <>
          <StatusDoSistema config={config} alterarStatus={alterarStatus} />
          <ConfiguracoesCampos config={config} handleChange={handleChange} salvarConfiguracoes={salvarConfiguracoes} />
          <ListaUnidades unidades={unidades} excluirUnidade={excluirUnidade} />
          <NovaUnidadeForm novaUnidade={novaUnidade} setNovaUnidade={setNovaUnidade} adicionarUnidade={adicionarUnidade} />
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}

export default function Configuracoes() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [unidades, setUnidades] = useState<UnidadeAtendimento[]>([]);
  const [novaUnidade, setNovaUnidade] = useState<UnidadeAtendimento>({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
    cnpj: "",
  });

  const buscarUnidades = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/unidades/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      setUnidades(response.data);
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
    }
  };

  const adicionarUnidade = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/unidades/`, novaUnidade, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      setUnidades(prev => [...prev, response.data]);
      setNovaUnidade({ nome: "", endereco: "", telefone: "", email: "", cnpj: "" });
    } catch (error) {
      console.error("Erro ao adicionar unidade:", error);
      alert("Erro ao salvar unidade.");
    }
  };

  const excluirUnidade = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/unidades/${id}/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      setUnidades(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error("Erro ao excluir unidade:", error);
      alert("Erro ao excluir unidade.");
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/clientes/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setConfig(response.data[0]);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    }
  };

  useEffect(() => {
    fetchConfig();
    buscarUnidades();
  }, []);

  const alterarStatus = async (novoStatus: boolean) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/clientes/${config?.id}/`,
        { ativo: novoStatus },
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        }
      );
      setConfig(prev => prev ? { ...prev, ativo: novoStatus, status: novoStatus ? 'ativo' : 'inativo' } : null);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

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

  return config ? (
    <ClienteConfiguracoes
      config={config}
      alterarStatus={alterarStatus}
      handleChange={handleChange}
      salvarConfiguracoes={salvarConfiguracoes}
      unidades={unidades}
      excluirUnidade={excluirUnidade}
      novaUnidade={novaUnidade}
      setNovaUnidade={setNovaUnidade}
      adicionarUnidade={adicionarUnidade}
    />
  ) : (
    <p>Carregando...</p>
  );
}
