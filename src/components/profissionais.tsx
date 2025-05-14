// Novo layout para o componente Profissionais, mantendo funcionalidades

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAccessToken } from '../api/auth';

interface Disponibilidade {
  id?: number;
  dia_semana: string;
  horarios: string[];
}

interface Especialidade {
  id: number;
  nome: string;
}

interface Profissional {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  especialidades?: Especialidade[];
}

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<Profissional | null>(null);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [novoDia, setNovoDia] = useState('segunda');
  const [novoHorario, setNovoHorario] = useState('');
  const [novaEspecialidade, setNovaEspecialidade] = useState('');

  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

  useEffect(() => {
    fetchProfissionais();
    fetchEspecialidades();
  }, []);

  const fetchProfissionais = async () => {
    try {
      const res = await axios.get('/api/usuarios/', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setProfissionais(res.data);
    } catch (err) {
      alert('Erro ao buscar profissionais.');
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const res = await axios.get('/api/especialidades/', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setEspecialidades(res.data);
    } catch (err) {
      alert('Erro ao buscar especialidades.');
    }
  };

  const fetchDisponibilidades = async (id: number) => {
    const res = await axios.get(`/api/disponibilidades/?client_user_id=${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });

    const corrigido = res.data.map((d: any) => ({
      ...d,
      horarios: typeof d.horarios === 'string' ? JSON.parse(d.horarios.replace(/'/g, '"')) : d.horarios,
    }));

    setDisponibilidades(corrigido);
  };

  const adicionarHorario = () => {
    if (!novoHorario) return;
    setDisponibilidades(prev => {
      const atual = prev.find(d => d.dia_semana === novoDia);
      if (atual) {
        return prev.map(d => d.dia_semana === novoDia ? {
          ...d,
          horarios: [...new Set([...d.horarios, novoHorario])],
        } : d);
      } else {
        return [...prev, { dia_semana: novoDia, horarios: [novoHorario] }];
      }
    });
    setNovoHorario('');
  };

  const salvarDisponibilidades = async () => {
    if (!profissionalSelecionado) return;
    try {
      await Promise.all(
        disponibilidades.map(d => axios.post('/api/disponibilidades/', {
          profissional: profissionalSelecionado.id,
          dia_semana: d.dia_semana,
          horarios: d.horarios,
        }, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        }))
      );
      alert('Disponibilidades salvas!');
    } catch {
      alert('Erro ao salvar disponibilidades.');
    }
  };

  const cadastrarProfissional = async () => {
    try {
      await axios.post('/api/usuarios/', {
        nome: novoNome,
        email: novoEmail,
        telefone: novoTelefone,
        username: novoEmail,
        password: novaSenha,
      }, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setNovoNome('');
      setNovoEmail('');
      setNovoTelefone('');
      setNovaSenha('');
      fetchProfissionais();
    } catch {
      alert('Erro ao cadastrar profissional.');
    }
  };

  const excluirProfissional = async (id: number) => {
    try {
      await axios.delete(`/api/usuarios/${id}/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      fetchProfissionais();
    } catch {
      alert('Erro ao excluir profissional.');
    }
  };

  const cadastrarEspecialidade = async () => {
    try {
      await axios.post('/api/especialidades/', { nome: novaEspecialidade }, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setNovaEspecialidade('');
      fetchEspecialidades();
    } catch {
      alert('Erro ao cadastrar especialidade.');
    }
  };

  const excluirEspecialidade = async (id: number) => {
    try {
      await axios.delete(`/api/especialidades/${id}/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      fetchEspecialidades();
    } catch {
      alert('Erro ao excluir especialidade.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#128C7E', textAlign: 'center', marginBottom: '2rem' }}>Gerenciar Profissionais</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#444' }}>Cadastrar Novo Profissional</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Nome" style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }} />
          <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} placeholder="Email" style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }} />
          <input type="text" value={novoTelefone} onChange={e => setNovoTelefone(e.target.value)} placeholder="Telefone" style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }} />
          <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Senha" style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <button onClick={cadastrarProfissional} style={{ marginTop: '1rem', padding: '0.8rem', width: '100%', background: '#128C7E', color: '#fff', borderRadius: 6, border: 'none', fontWeight: 'bold' }}>Cadastrar</button>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#444', marginBottom: '1rem' }}>Lista de Profissionais</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {profissionais.map(p => (
            <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
              <span>{p.nome}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setProfissionalSelecionado(p); fetchDisponibilidades(p.id); }} style={{ background: 'none', border: 'none', color: '#128C7E', cursor: 'pointer' }}>Detalhes</button>
                <button onClick={() => excluirProfissional(p.id)} style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer' }}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#444', marginBottom: '1rem' }}>Especialidades</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="text" value={novaEspecialidade} onChange={e => setNovaEspecialidade(e.target.value)} placeholder="Nova especialidade" style={{ flexGrow: 1, padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }} />
          <button onClick={cadastrarEspecialidade} style={{ padding: '0.6rem 1rem', background: '#128C7E', color: '#fff', borderRadius: 6, border: 'none' }}>Adicionar</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {especialidades.map(e => (
            <li key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
              <span>{e.nome}</span>
              <button onClick={() => excluirEspecialidade(e.id)} style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer' }}>Excluir</button>
            </li>
          ))}
        </ul>
      </section>

      {profissionalSelecionado && (
        <section style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Disponibilidades de {profissionalSelecionado.nome}</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <select value={novoDia} onChange={e => setNovoDia(e.target.value)} style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }}>
              {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={novoHorario} onChange={e => setNovoHorario(e.target.value)} style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }} />
            <button onClick={adicionarHorario} style={{ padding: '0.6rem 1rem', background: '#128C7E', color: '#fff', borderRadius: 6, border: 'none' }}>Adicionar</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {disponibilidades.map(d => (
              <div key={d.dia_semana} style={{ padding: '0.5rem', background: '#F7F7F7', borderRadius: 6 }}>
                <strong style={{ textTransform: 'capitalize' }}>{d.dia_semana}:</strong> {Array.isArray(d.horarios) ? d.horarios.join(', ') : 'Horários inválidos'}
              </div>
            ))}
          </div>
          <button onClick={salvarDisponibilidades} style={{ marginTop: '1rem', padding: '0.8rem', width: '100%', background: '#0F9D58', color: '#fff', borderRadius: 6, border: 'none', fontWeight: 'bold' }}>Salvar Disponibilidades</button>
        </section>
      )}
    </div>
  );
}
