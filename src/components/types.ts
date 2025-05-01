export interface Conversation {
  id: number;
  person_nome: string;
  person_telefone: string;
  ultima_mensagem?: string;
  assumido_por_mim?: boolean;
}

export interface Pessoa {
  id: number;
  nome: string;
}

export interface Agendamento {
  id: number;
  data_hora: string;
  profissional: string;
  observacoes: string;
  confirmado: boolean;
  person_nome: string;
  client_user_nome: string;
  client_user_id: number;
}
