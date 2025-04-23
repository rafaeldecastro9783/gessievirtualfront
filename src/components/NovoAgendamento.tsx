import { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../api/auth";

interface Pessoa {
  id: number;
  nome: string;
}

interface Profissional {
  id: number;
  nome: string;
}

export default function NovoAgendamento() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [personId, setPersonId] = useState<number | null>(null);
  const [profissionalId, setProfissionalId] = useState<number | null>(null);
  const [dataHora, setDataHora] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPessoas, resProfissionais] = await Promise.all([
          axios.get("http://localhost:8000/api/pessoas/", {
            headers: { Authorization: `Bearer ${getAccessToken()}` },
          }),
          axios.get("http://localhost:8000/api/usuarios/", {
            headers: { Authorization: `Bearer ${getAccessToken()}` },
          }),
        ]);
        setPessoas(resPessoas.data);
        setProfissionais(resProfissionais.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchData();
  }, []);

  const agendar = async () => {
    if (!personId || !profissionalId || !dataHora) return alert("Preencha todos os campos.");
    try {
      await axios.post(
        "http://localhost:8000/api/agendamentos/",
        {
          person: personId,
          client_user: profissionalId,
          data_hora: dataHora,
          profissional: profissionais.find((u) => u.id === profissionalId)?.nome || "",
        },
        {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }
      );
      alert("✅ Agendamento criado com sucesso!");
      setPersonId(null);
      setProfissionalId(null);
      setDataHora("");
    } catch (error) {
      console.error("Erro ao agendar:", error);
      alert("❌ Falha ao criar agendamento.");
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

  const botaoAgendar: React.CSSProperties = {
    padding: "0.8rem",
    backgroundColor: "#128C7E",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "1rem"
  };

  const labelStyle: React.CSSProperties = {
    color: "#222",
    fontWeight: 500
  };

  return (
    <div>
      <h2 style={{ color: "#075e54", marginBottom: "1.5rem" }}>📆 Novo Agendamento</h2>

      <div style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={labelStyle}>
          Pessoa:
          <select value={personId || ""} onChange={(e) => setPersonId(Number(e.target.value))} style={inputStyle}>
            <option value="">Selecione</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Profissional:
          <select value={profissionalId || ""} onChange={(e) => setProfissionalId(Number(e.target.value))} style={inputStyle}>
            <option value="">Selecione</option>
            {profissionais.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Data e Hora:
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            style={inputStyle}
          />
        </label>

        <button onClick={agendar} style={botaoAgendar}>Agendar</button>
      </div>
    </div>
  );
}
