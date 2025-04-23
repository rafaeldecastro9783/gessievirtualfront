import { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken, getPayload } from "../api/auth";
import { useNavigate } from "react-router-dom";
import NovoUsuario from "./Usuario";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  client: number;
  ativo: boolean;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [meuUsuario, setMeuUsuario] = useState<Usuario | null>(null);
  const [adminDoClient, setAdminDoClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const payload = getPayload();
        const token = getAccessToken();

        const res = await axios.get("http://localhost:8000/api/usuarios/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const meusDados = res.data.find((u: Usuario) => u.id === payload.user_id);
        setMeuUsuario(meusDados);

        const admin = meusDados?.id === payload.user_id && payload?.is_staff;
        setAdminDoClient(admin);

        if (admin) {
          setUsuarios(res.data);
        } else {
          setUsuarios([meusDados]);
        }
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div>
      <h2 style={{ color: "#075e54", marginBottom: "1rem" }}>👥 Funcionários</h2>

      {adminDoClient && (
        <div style={{ marginBottom: "2rem" }}>
          <NovoUsuario />
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#128C7E", color: "white" }}>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Nome</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Email</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Telefone</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Status</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "0.75rem" }}>{u.nome}</td>
              <td style={{ padding: "0.75rem" }}>{u.email}</td>
              <td style={{ padding: "0.75rem" }}>{u.telefone}</td>
              <td style={{ padding: "0.75rem" }}>{u.ativo ? "Ativo" : "Inativo"}</td>
              <td style={{ padding: "0.75rem" }}>
                <button
                  onClick={() => navigate(`/usuarios/${u.id}`)}
                  style={{
                    backgroundColor: "#0d806f",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
