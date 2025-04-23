import { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../api/auth";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  ativo: boolean;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [novoUsuario, setNovoUsuario] = useState<Omit<Usuario, "id">>({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    ativo: true,
  });

  const carregarUsuarios = async () => {
    const response = await axios.get("http://localhost:8000/api/usuarios/", {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    setUsuarios(response.data);
  };

  const criarUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) return;
    await axios.post("http://localhost:8000/api/usuarios/", novoUsuario, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    setNovoUsuario({ nome: "", email: "", telefone: "", senha: "", ativo: true });
    carregarUsuarios();
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>👨‍💼 Funcionários Cadastrados</h2>

      <table style={{ width: "100%", marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{usuario.telefone}</td>
              <td>{usuario.ativo ? "Ativo" : "Inativo"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>➕ Novo Funcionário</h3>
      <input placeholder="Nome" value={novoUsuario.nome} onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} />
      <input placeholder="Email" value={novoUsuario.email} onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })} />
      <input placeholder="Telefone" value={novoUsuario.telefone} onChange={(e) => setNovoUsuario({ ...novoUsuario, telefone: e.target.value })} />
      <input type="password" placeholder="Senha" value={novoUsuario.senha} onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })} />
      <button onClick={criarUsuario}>Salvar</button>
    </div>
  );
}
