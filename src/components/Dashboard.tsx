import { useNavigate } from "react-router-dom";
import { getAccessToken, logout } from "../api/auth";
import { useEffect, useState } from "react";
import axios from "axios";

import Messages from "./Messages";
import Pessoas from "./Pessoas";
import Agenda from "./Agenda";
import Configuracoes from "./Configuracoes";


interface Agendamento {
  id: number;
  data_hora: string;
  profissional: string;
  person_nome: string;
  client_user_nome: string;
  client_user_id: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"resumo" | "mensagens" | "agenda" | "pessoas" | "novo" | "config" | "usuarios">("resumo");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/");
    } else {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.user_id);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/agendamentos/", {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        setAgendamentos(response.data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }
    };

    fetchAgendamentos();
  }, []);

  const hoje = new Date().toISOString().split("T")[0];

  const agendamentosDoDia = userId
    ? agendamentos.filter((ag) => {
        const dataAg = new Date(ag.data_hora).toISOString().split("T")[0];
        return ag.client_user_id === userId && dataAg === hoje;
      })
    : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        fontFamily: "Inter, Segoe UI, sans-serif",
        flexWrap: "nowrap",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#075e54",
          padding: "2rem 1rem",
          color: "#fff",
          width: "220px",
          minWidth: "220px",
          maxWidth: "220px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "2rem", fontSize: "1.5rem", textAlign: "center" }}>
            💎 Gessie Virtual
          </h2>
          {[
            { label: "Resumo", key: "resumo" },
            { label: "Mensagens", key: "mensagens" },
            { label: "Agenda", key: "agenda" },
            { label: "Pessoas", key: "pessoas" },
            { label: "Configurações", key: "config" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key as any)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem 1rem",
                margin: "0.25rem 0",
                backgroundColor: tab === item.key ? "#0d806f" : "transparent",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          style={{
            marginTop: "2rem",
            padding: "0.75rem",
            backgroundColor: "#d9534f",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          backgroundColor: "#fff",
          borderTopLeftRadius: "16px",
          borderBottomLeftRadius: "16px",
          boxShadow: "-5px 0 15px rgba(0,0,0,0.05)",
          minWidth: 0,
        }}
      >
        {tab === "resumo" && (
          <div>
            <h2 style={{ color: "#075e54", marginBottom: "1rem" }}>📅 Meus Compromissos de Hoje</h2>
            {agendamentosDoDia.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {agendamentosDoDia.map((ag) => (
                  <li
                    key={ag.id}
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      borderRadius: "8px",
                      backgroundColor: "#f7f9fa",
                      borderLeft: "4px solid #128C7E",
                    }}
                  >
                    <strong>{ag.person_nome}</strong> com <em>{ag.profissional}</em>
                    <br />
                    <small>
                      {new Date(ag.data_hora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "1rem", color: "#666" }}>Nenhum compromisso para hoje.</p>
            )}
          </div>
        )}
        {tab === "mensagens" && <Messages />}
        {tab === "agenda" && <Agenda />}
        {tab === "pessoas" && <Pessoas />}
        {tab === "novo" && <NovoAgendamento />}
        {tab === "config" && <Configuracoes />}
      </main>
    </div>
  );
}
