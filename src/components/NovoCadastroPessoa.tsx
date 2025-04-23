import { useState, useEffect } from "react";
import { buscarOuCriarPessoa } from "../api/pessoas";
import { getAccessToken } from "../api/auth";

export default function NovoCadastroPessoa() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setClientId(payload.client_id || payload.client); // depende do que foi salvo no token
    }
  }, []);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");

    try {
      if (!clientId) {
        setMensagem("Erro: client_id não encontrado.");
        return;
      }

      const res = await buscarOuCriarPessoa(nome, telefone, clientId);
      setMensagem(`✅ Pessoa registrada com ID: ${res.person_id}`);
      setNome("");
      setTelefone("");
    } catch (err) {
      setMensagem("❌ Erro ao cadastrar pessoa.");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h2 style={{ color: "#075e54", marginBottom: "1rem" }}>👤 Novo Cadastro de Pessoa</h2>
      <form onSubmit={handleCadastrar}>
        <label>Nome:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px" }}
        />

        <label>Telefone:</label>
        <input
          type="text"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
          style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px" }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#128C7E",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Cadastrar Pessoa
        </button>
      </form>

      {mensagem && (
        <p style={{ marginTop: "1rem", color: mensagem.startsWith("✅") ? "green" : "red" }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
