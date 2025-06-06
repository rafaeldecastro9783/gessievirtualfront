// src/components/Agenda.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken, logout } from "../api/auth";
import Messages from "./Messages";
import Pessoas from "./Pessoas";
import Configuracoes from "./Configuracoes";
import Profissionais from "./profissionais";

interface Agendamento {
  id: number;
  data_hora: string;
  profissional: {
    id: number;
    nome: string;
    email?: string;
    telefone?: string;
  } | null;
  profissional_nome: string; 
  observacoes: string;
  confirmado: boolean;
  person_nome: string;
  client_user_nome: string;
  client_user_id: number;
}

interface Pessoa {
  id: number;
  nome: string;
}

export default function Agenda() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"agenda" | "mensagens" | "pessoas" | "profissionais"| "config">("agenda");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [detalhe, setDetalhe] = useState<Agendamento | null>(null);
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [novo, setNovo] = useState({ person: "", data_hora: "", profissional: "", observacoes: "" });

  const buscarAgendamentos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/agendamentos/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setAgendamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const buscarPessoas = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/pessoas/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setPessoas(response.data);
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error);
    }
  };

  const excluirAgendamento = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/agendamentos/${id}/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setDetalhe(null);
      buscarAgendamentos();
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) navigate("/");
    buscarAgendamentos();
    buscarPessoas();
    buscarProfissionais();
  }, [navigate]);

  const criarNovoAgendamento = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/agendamentos/`, novo, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setShowNovoModal(false);
      setNovo({ person: "", data_hora: "", profissional: "", observacoes: "" });
      buscarAgendamentos();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    }
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const dataAg = new Date(ag.data_hora);
    const passaData = filtroData ? dataAg.toISOString().split("T")[0] === filtroData : dataAg >= hoje;
    const passaProf = !filtroProfissional || ag.profissional?.nome?.toLowerCase().includes(filtroProfissional.toLowerCase());
    return passaData && passaProf;
  });

  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  
  const buscarProfissionais = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/funcionarios/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setProfissionais(response.data);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    }
  };  

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif", color: "#000" }}>
      <aside style={{ backgroundColor: "#075e54", width: 220, color: "#fff", padding: "2rem 1rem" }}>
        <h2 style={{ textAlign: "center" }}> Gessie Virtual</h2>
        {["agenda", "mensagens", "pessoas","profissionais", "config"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            style={{
              backgroundColor: tab === t ? "#0d806f" : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.75rem",
              margin: "0.5rem 0",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button
          onClick={() => { logout(); navigate("/"); }}
          style={{ marginTop: "2rem", backgroundColor: "#d9534f", color: "#fff", border: "none", borderRadius: 8, padding: "0.75rem", cursor: "pointer" }}
        >
          Sair
        </button>
      </aside>

      <main style={{ flex: 1, padding: "2rem", backgroundColor: "#fff" }}>
        {tab === "agenda" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ marginBottom: "1rem" }}>🗓️ Agenda</h2>
              <button
                onClick={() => setShowNovoModal(true)}
                style={{
                  backgroundColor: "#128C7E",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Novo Agendamento
              </button>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <input type="text" value={filtroProfissional} onChange={(e) => setFiltroProfissional(e.target.value)} placeholder="Filtrar por profissional" style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc", flex: 1, minWidth: 200, color: "#000" }} />
              <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc", color: "#000" }} />
              <button onClick={() => { setFiltroData(""); setFiltroProfissional(""); }} style={{ backgroundColor: "#d9534f", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "bold" }}>Limpar</button>
            </div>

            {agendamentosFiltrados.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {agendamentosFiltrados.map((ag) => (
                  <li key={ag.id} onClick={() => setDetalhe(ag)} style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "8px", backgroundColor: "#f7f9fa", borderLeft: "4px solid #128C7E", cursor: "pointer" }}>
                    <strong>{ag.person_nome}</strong> com <em>{ag.profissional_nome || "N/A"}</em><br />
                    <small>{new Date(ag.data_hora).toLocaleString("pt-BR")} — Responsável: {ag.client_user_nome}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#000" }}>Nenhum agendamento encontrado.</p>
            )}
          </>
        )}

        {tab === "mensagens" && <Messages />}
        {tab === "pessoas" && <Pessoas />}
        {tab === "profissionais" && <Profissionais />}
        {tab === "config" && <Configuracoes />}
      </main>

      {showNovoModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "500px", color: "#000" }}>
            <h3 style={{ marginBottom: "1rem" }}>➕ Novo Agendamento</h3>

            {/* Selecionar Pessoa */}
            <select value={novo.person} onChange={(e) => setNovo({ ...novo, person: e.target.value })} style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px" }}>
              <option value="">Selecione a pessoa</option>
              {pessoas.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>

            {/* Selecionar Profissional */}
            <select
              value={novo.profissional}
              onChange={async (e) => {
                const profissionalId = e.target.value;
                setNovo({ ...novo, profissional: profissionalId, data_hora: "" });

                // Buscar horários disponíveis da API
                try {
                  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profissional/${profissionalId}/horarios-disponiveis/`, {
                    headers: { Authorization: `Bearer ${getAccessToken()}` }
                  });
                  const dias = response.data;
                  const horarios: string[] = [];

                  Object.entries(dias as Record<string, string[]>).forEach(([diaSemana, listaHoras]) => {
                    listaHoras.forEach((hora: string) => {
                  
                      const hoje = new Date();
                      const data = new Date();

                      // Encontra a próxima data correspondente ao dia da semana
                      const diasSemana = {
                        domingo: 0, segunda: 1, terca: 2, terça: 2, quarta: 3,
                        quinta: 4, sexta: 5, sabado: 6, sábado: 6
                      };

                      const alvo = diasSemana[diaSemana.toLowerCase() as keyof typeof diasSemana];
                      const atual = hoje.getDay();

                      const diff = (alvo - atual + 7) % 7;
                      data.setDate(hoje.getDate() + diff);

                      // Junta com o horário e formata como ISO
                      const [h, m] = hora.split(":");
                      data.setHours(parseInt(h), parseInt(m), 0, 0);
                      horarios.push(data.toISOString());
                    });
                  });

                  setHorariosDisponiveis(horarios);

                } catch (err) {
                  console.error("Erro ao buscar horários:", err);
                  setHorariosDisponiveis([]);
                }
              }}
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px" }}
            >
              <option value="">Selecione o profissional</option>
              {profissionais.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>

            {/* Selecionar Horário */}
            <select
              value={novo.data_hora}
              onChange={(e) => setNovo({ ...novo, data_hora: e.target.value })}
              disabled={!horariosDisponiveis.length}
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px" }}
            >
              <option value="">Selecione um horário disponível</option>
              {horariosDisponiveis.map(h => (
                <option key={h} value={h}>{new Date(h).toLocaleString("pt-BR")}</option>
              ))}
            </select>

            {/* Observações */}
            <textarea value={novo.observacoes} onChange={(e) => setNovo({ ...novo, observacoes: e.target.value })} rows={3} style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px" }} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={criarNovoAgendamento} style={{ backgroundColor: "#128C7E", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", fontWeight: "bold" }}>Salvar</button>
              <button onClick={() => setShowNovoModal(false)} style={{ backgroundColor: "#ccc", padding: "0.5rem 1.25rem", borderRadius: "8px" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {detalhe && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "10px", maxWidth: "500px", width: "90%" }}>
            <h3 style={{ color: "#075e54" }}>📌 Detalhes do Agendamento</h3>
            <p><strong>Cliente:</strong> {detalhe.person_nome}</p>
            <p><strong>Profissional:</strong> {detalhe.profissional_nome || "N/A"}</p>
            <p><strong>Data/Hora:</strong> {new Date(detalhe.data_hora).toLocaleString("pt-BR")}</p>
            <p><strong>Responsável:</strong> {detalhe.client_user_nome}</p>
            <p><strong>Confirmado:</strong> {detalhe.confirmado ? "✅ Sim" : "❌ Não"}</p>
            {detalhe.observacoes && <p><strong>Obs.:</strong> {detalhe.observacoes}</p>}
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <button onClick={() => alert("Editar agendamento")} style={{ backgroundColor: "#f0ad4e", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "bold" }}>Editar</button>
              <button onClick={() => excluirAgendamento(detalhe.id)} style={{ backgroundColor: "#d9534f", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "bold" }}>Excluir</button>
              <button onClick={() => setDetalhe(null)} style={{ backgroundColor: "#5bc0de", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "bold" }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
