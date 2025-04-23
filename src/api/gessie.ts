import axios from "axios";

export async function gessieAgendarConsulta(payload: any) {
  const res = await axios.post("http://localhost:8000/api/gessie_agendar/", payload);
  return res.data;
}
