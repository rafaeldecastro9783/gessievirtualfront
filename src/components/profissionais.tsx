import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAccessToken } from '../api/auth';

interface UnidadeAtendimento {
  id: number;
  nome: string;
}

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
  disponibilidades?: Disponibilidade[];
  unidades?: UnidadeAtendimento[];
}

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<Profissional | null>(null);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [novoDia, setNovoDia] = useState('segunda');
  const [novoHorario, setNovoHorario] = useState('');
  const [modalEspecialidades, setModalEspecialidades] = useState(false);
  const [modalHorarios, setModalHorarios] = useState(false);
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState<number[]>([]);
  const [modalGerenciarEspecialidades, setModalGerenciarEspecialidades] = useState(false);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [modalNovoProfissional, setModalNovoProfissional] = useState(false);
  const [novoProfissional, setNovoProfissional] = useState<Partial<Profissional>>({ nome: '', email: '', telefone: '' });
  const [especialidadesNovo, setEspecialidadesNovo] = useState<number[]>([]);
  const [todasUnidades, setTodasUnidades] = useState<UnidadeAtendimento[]>([]);
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<number[]>([]);

  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

  useEffect(() => {
    fetchProfissionais();
    fetchEspecialidades();
    fetchTodasUnidades();
  }, []);

  useEffect(() => {
    if (profissionalSelecionado) {
      setEspecialidadesSelecionadas(profissionalSelecionado.especialidades?.map(e => e.id) || []);
      setUnidadesSelecionadas(profissionalSelecionado.unidades?.map(u => u.id) || []);
    }
  }, [profissionalSelecionado]);  

  const fetchProfissionais = async () => {
    try {
      const res = await axios.get('/api/usuarios/', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      const profs: Profissional[] = res.data;

      const withExtras = await Promise.all(
        profs.map(async (p) => {
          const [disp, unids] = await Promise.all([
            axios
              .get(`/api/disponibilidades/?client_user_id=${p.id}`, {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
              })
              .then((res) =>
                res.data.map((d: any) => ({
                  ...d,
                  horarios:
                    typeof d.horarios === 'string'
                      ? JSON.parse(d.horarios.replace(/'/g, '"'))
                      : d.horarios,
                }))
              )
              .catch(() => []),

            axios
              .get(`/api/unidades/?client_user_id=${p.id}`, {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
              })
              .then((res) => res.data)
              .catch(() => []),
          ]);

          return { ...p, disponibilidades: disp, unidades: unids };
        })
      );

      setProfissionais(withExtras);
    } catch {
      alert('Erro ao buscar profissionais.');
    }
  }; 

  const fetchTodasUnidades = async () => {
    try {
      const res = await axios.get('/api/unidades/', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setTodasUnidades(res.data);
    } catch {
      alert('Erro ao buscar unidades');
    }
  };
  

  const fetchEspecialidades = async () => {
    try {
      const res = await axios.get('/api/especialidades/', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      setEspecialidades(res.data);
    } catch {
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

  const cadastrarNovoProfissional = async () => {
    if (!novoProfissional.nome) return alert('Nome é obrigatório.');
    try {
      await axios.post('/api/usuarios/', {
        nome: novoProfissional.nome,
        email: novoProfissional.email,
        telefone: novoProfissional.telefone,
        especialidades_ids: especialidadesNovo,
        senha: '123456',
        password: '123456',
        username: novoProfissional.email || `user_${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      alert('Profissional cadastrado com sucesso!');
      setModalNovoProfissional(false);
      fetchProfissionais();
    } catch (err: any) {
      console.error(err?.response?.data);
      alert('Erro ao cadastrar profissional.');
    }
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
  
  const excluirProfissional = async (id: number) => {
    if (!window.confirm('Deseja excluir este profissional?')) return;
    try {
      await axios.delete(`/api/usuarios/${id}/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      fetchProfissionais();
    } catch {
      alert('Erro ao excluir profissional.');
    }
  };

  const validarEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#128C7E', textAlign: 'center', marginBottom: '2rem' }}>Gerenciar Profissionais</h2>

      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button
          onClick={() => setModalGerenciarEspecialidades(true)}
          style={{ background: '#128C7E', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Gerenciar Especialidades
        </button>

        <button
        onClick={() => setModalNovoProfissional(true)}
        style={{
          background: '#0F9D58', color: '#fff', padding: '0.5rem 1rem', border: 'none',
          borderRadius: 4, cursor: 'pointer', marginLeft: '0.5rem'
        }}
      >
        Novo Profissional
      </button>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#444', marginBottom: '1rem' }}>Lista de Profissionais</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {profissionais.map((p, index) => (
            <li key={p.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
              <input
                value={p.nome}
                onChange={(e) => {
                  const novos = [...profissionais];
                  novos[index].nome = e.target.value;
                  setProfissionais(novos);
                }}
                style={{ fontWeight: 'bold', border: 'none', background: 'transparent', fontSize: '1rem' }}
              />
              <input
                value={p.email || ''}
                onChange={(e) => {
                  const novos = [...profissionais];
                  novos[index].email = e.target.value;
                  setProfissionais(novos);
                }}
                style={{ border: 'none', background: 'transparent', color: validarEmail(p.email || '') ? 'black' : 'red' }}
              />
              <input
                value={p.telefone || ''}
                onChange={(e) => {
                  const novos = [...profissionais];
                  novos[index].telefone = e.target.value;
                  setProfissionais(novos);
                }}
                style={{ border: 'none', background: 'transparent' }}
              />

              <span><strong>Especialidades:</strong> {p.especialidades?.map(e => e.nome).join(', ') || 'Nenhuma'}</span>
              <span><strong>Unidade de Atendimento:</strong> {p.unidades?.map(u => u.nome).join(', ') || 'Nenhuma'}</span>


              {p.disponibilidades && p.disponibilidades.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Horários:</strong>
                  <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                    {p.disponibilidades.map((d, idx) => (
                      <li key={idx}>
                        {d.dia_semana}: {d.horarios.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => {
                  setProfissionalSelecionado(p);
                  setEspecialidadesSelecionadas(p.especialidades?.map(e => e.id) || []);
                  setUnidadesSelecionadas(p.unidades?.map(u => u.id) || []);
                  setModalEspecialidades(true);
                }}>
                  Gerenciar Especialidades
                </button>
                <button onClick={() => {
                  setProfissionalSelecionado(p);
                  fetchDisponibilidades(p.id);
                  setModalHorarios(true);
                }}>Horários</button>
                <button onClick={() => excluirProfissional(p.id)} style={{ color: '#FF3B30' }}>Excluir</button>
              </div>

              <button
                onClick={async () => {
                  try {
                    if (p.email && !validarEmail(p.email)) {
                      alert('Email inválido.');
                      return;
                    }
                    await axios.put(`/api/usuarios/${p.id}/`, {
                      nome: p.nome,
                      email: p.email,
                      telefone: p.telefone,
                    }, {
                      headers: { Authorization: `Bearer ${getAccessToken()}` },
                    });
                    alert('Dados atualizados com sucesso!');
                  } catch {
                    alert('Erro ao salvar alterações.');
                  }
                }}
                style={{
                  marginTop: '0.5rem',
                  alignSelf: 'flex-start',
                  padding: '0.4rem 0.8rem',
                  background: '#0F9D58',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Salvar alterações
              </button>
            </li>
          ))}
        </ul>
      </section>

      {modalHorarios && profissionalSelecionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 8, minWidth: '400px' }}>
            <h3>Horários de {profissionalSelecionado.nome}</h3>
            <select value={novoDia} onChange={e => setNovoDia(e.target.value)}>
              {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={novoHorario} onChange={e => setNovoHorario(e.target.value)} />
            <button onClick={adicionarHorario}>Adicionar</button>
            <ul>
              {disponibilidades.map(d => (
                <li key={d.dia_semana}><strong>{d.dia_semana}</strong>: {d.horarios.join(', ')}</li>
              ))}
            </ul>
            <button onClick={salvarDisponibilidades}>Salvar</button>
            <button onClick={() => setModalHorarios(false)}>Fechar</button>
          </div>
        </div>
      )}
        {modalEspecialidades && profissionalSelecionado && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff', padding: '2rem', borderRadius: 8,
              minWidth: '400px', maxHeight: '80vh', overflowY: 'auto'
            }}>
              <h3>Especialidades de {profissionalSelecionado.nome}</h3>
              <ul>
                {especialidades.map(e => (
                  <li key={e.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={especialidadesSelecionadas.includes(e.id)}
                        onChange={() => {
                          setEspecialidadesSelecionadas(prev =>
                            prev.includes(e.id)
                              ? prev.filter(id => id !== e.id)
                              : [...prev, e.id]
                          );
                        }}
                      />{' '}
                      {e.nome}
                    </label>
                  </li>
                ))}
              </ul>

              <h3 style={{ marginTop: '1rem' }}>Unidades de Atendimento</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {todasUnidades.map(u => (
                  <li key={u.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={unidadesSelecionadas.includes(u.id)}
                        onChange={() =>
                          setUnidadesSelecionadas(prev =>
                            prev.includes(u.id)
                              ? prev.filter(id => id !== u.id)
                              : [...prev, u.id]
                          )
                        }
                      />{' '}
                      {u.nome}
                    </label>
                  </li>
                ))}
              </ul>

              <button
                onClick={async () => {
                  try {
                    await axios.put(`/api/usuarios/${profissionalSelecionado.id}/`, {
                      nome: profissionalSelecionado.nome,
                      email: profissionalSelecionado.email,
                      telefone: profissionalSelecionado.telefone,
                      especialidades_ids: especialidadesSelecionadas,
                      unidades_ids: unidadesSelecionadas
                    }, {
                      headers: { Authorization: `Bearer ${getAccessToken()}` },
                    });
                    alert('Dados salvos!');
                    fetchProfissionais();
                    setModalEspecialidades(false);
                  } catch {
                    alert('Erro ao salvar');
                  }
                }}
                style={{ marginTop: '1rem', marginRight: '1rem' }}
              >
                Salvar
              </button>
              <button onClick={() => setModalEspecialidades(false)}>Fechar</button>
            </div>
          </div>
        )}

      {modalNovoProfissional && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 8, minWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Novo Profissional</h3>
            <input
              type="text"
              placeholder="Nome"
              value={novoProfissional.nome || ''}
              onChange={e => setNovoProfissional({ ...novoProfissional, nome: e.target.value })}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <input
              type="email"
              placeholder="Email"
              value={novoProfissional.email || ''}
              onChange={e => setNovoProfissional({ ...novoProfissional, email: e.target.value })}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <input
              type="text"
              placeholder="Telefone"
              value={novoProfissional.telefone || ''}
              onChange={e => setNovoProfissional({ ...novoProfissional, telefone: e.target.value })}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div style={{ marginBottom: '1rem' }}>
              <strong>Especialidades:</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {especialidades.map(e => (
                  <li key={e.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={especialidadesNovo.includes(e.id)}
                        onChange={() => {
                          setEspecialidadesNovo(prev =>
                            prev.includes(e.id) ? prev.filter(id => id !== e.id) : [...prev, e.id]
                          );
                        }}
                      /> {e.nome}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={cadastrarNovoProfissional} style={{ marginRight: '1rem' }}>Salvar</button>
            <button onClick={() => setModalNovoProfissional(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {modalGerenciarEspecialidades && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 8, minWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Gerenciar Especialidades</h3>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Nova especialidade"
                value={novaEspecialidade}
                onChange={e => setNovaEspecialidade(e.target.value)}
                style={{ padding: '0.4rem', width: '70%', marginRight: '0.5rem' }}
              />
              <button
                onClick={async () => {
                  if (!novaEspecialidade.trim()) return;
                  try {
                    await axios.post('/api/especialidades/', { nome: novaEspecialidade }, {
                      headers: { Authorization: `Bearer ${getAccessToken()}` },
                    });
                    setNovaEspecialidade('');
                    fetchEspecialidades();
                  } catch {
                    alert('Erro ao criar especialidade.');
                  }
                }}
              >
                Adicionar
              </button>
            </div>
            <ul>
              {especialidades.map(e => (
                <li key={e.id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  {editandoId === e.id ? (
                    <>
                      <input
                        type="text"
                        value={nomeEditado}
                        onChange={(ev) => setNomeEditado(ev.target.value)}
                        style={{ flexGrow: 1, marginRight: '0.5rem' }}
                      />
                      <button
                        onClick={async () => {
                          try {
                            await axios.put(`/api/especialidades/${e.id}/`, { nome: nomeEditado }, {
                              headers: { Authorization: `Bearer ${getAccessToken()}` },
                            });
                            setEditandoId(null);
                            fetchEspecialidades();
                          } catch {
                            alert('Erro ao editar especialidade.');
                          }
                        }}
                      >
                        Salvar
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ flexGrow: 1 }}>{e.nome}</span>
                      <button
                        onClick={() => {
                          setEditandoId(e.id);
                          setNomeEditado(e.nome);
                        }}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Editar
                      </button>
                    </>
                  )}
                  <button
                    onClick={async () => {
                      if (!window.confirm('Deseja excluir esta especialidade?')) return;
                      try {
                        await axios.delete(`/api/especialidades/${e.id}/`, {
                          headers: { Authorization: `Bearer ${getAccessToken()}` },
                        });
                        fetchEspecialidades();
                      } catch {
                        alert('Erro ao excluir especialidade.');
                      }
                    }}
                    style={{ color: '#FF3B30', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button onClick={() => setModalGerenciarEspecialidades(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
