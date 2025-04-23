import { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../api/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agendamento: any;
  onSalvar: (dados: any) => void;
}

export default function ModalEditar({ isOpen, onClose, agendamento, onSalvar }: Props) {
  const [form, setForm] = useState({
    data_hora: agendamento?.data_hora || "",
    profissional: agendamento?.profissional || "",
    client_user: agendamento?.client_user || null
  });
  const [funcionarios, setFuncionarios] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:8000/api/funcionarios/", {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      }).then(res => setFuncionarios(res.data));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const prof = funcionarios.find(f => f.id === Number(form.client_user));
    onSalvar({ ...agendamento, ...form, profissional: prof?.nome });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999
    }}>
      <div style={{
        backgroundColor: "#fff", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "400px"
      }}>
        <h3 style={{ marginBottom: "1rem", color: "#075e54" }}>Editar Agendamento</h3>

        <input
          type="datetime-local"
          name="data_hora"
          value={form.data_hora}
          onChange={handleChange}
          style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <select
          name="client_user"
          value={form.client_user}
          onChange={handleChange}
          style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="">Selecione um profissional</option>
          {funcionarios.map((f) => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={onClose} style={{ backgroundColor: "#ccc", padding: "0.5rem 1rem", borderRadius: "6px", border: "none" }}>Cancelar</button>
          <button onClick={handleSubmit} style={{ backgroundColor: "#128C7E", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px", border: "none" }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
