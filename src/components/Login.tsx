import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { saveAccessToken } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

   try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/token/`, {
      username: email,
      password: senha,
    });
      saveAccessToken(response.data.access);
      navigate("/Agenda");
    } catch (err) {
      setErro("E-mail ou senha incorretos.");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(to right, #128C7E, #075e54)",
      fontFamily: "Inter, Segoe UI, sans-serif"
    }}>
      <form onSubmit={handleLogin} style={{
        backgroundColor: "#fff",
        padding: "3rem 2rem",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", color: "#075e54", marginBottom: "2rem" }}> Gessie Virtual</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>E-mail</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
        </div>

        {erro && <p style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}>{erro}</p>}

        <button type="submit" style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#128C7E",
          color: "white",
          fontWeight: 600,
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
          transition: "background 0.3s"
        }}>
          Entrar
        </button>
      </form>
    </div>
  );
}


