import { api } from '@/utils/api';

// Função para adaptar o objeto do backend para o frontend
const mapBackendToFrontend = (servico) => {
  if (!servico) return null;
  return {
    id: servico.servicoId,
    nome: servico.nome,
    preco: servico.preco,
    descricao: servico.descricao
  };
};

// Função para adaptar o objeto do frontend para o backend
const mapFrontendToBackend = (servico) => {
  if (!servico) return null;
  return {
    servicoId: servico.id,
    nome: servico.nome,
    preco: servico.preco,
    descricao: servico.descricao
  };
};

export function useApiServicos() {

  const buscarTodosServicos = async () => {
    try {
      const data = await api('/servico/buscarTodosServicos', {
        method: 'GET'
      });
      if (data && Array.isArray(data)) {
        const dadosMapeados = data.map(mapBackendToFrontend);
        return { data: dadosMapeados, error: null };
      }
      return { data: [], error: null };
    } catch (err) {
      console.error("Erro no composable (buscarTodosServicos):", err);
      return { data: null, error: err };
    }
  };

  const buscarServico = async (id) => {
    try {
      const data = await api('/servico/buscarServico', {
        method: 'GET',
        query: { servicoId: id }
      });
      return { data: mapBackendToFrontend(data), error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const criarServico = async (dadosServicoFrontend) => {
    try {
      const data = await api('/servico/criarServico', {
        method: 'POST',
        body: dadosServicoFrontend
      });
      return { data: mapBackendToFrontend(data), error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const editarServico = async (servicoFrontend) => {
    try {
      const dadosParaBackend = mapFrontendToBackend(servicoFrontend);
      const data = await api('/servico/atualizarServico', {
        method: 'PUT',
        body: dadosParaBackend
      });
      return { data: mapBackendToFrontend(data), error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const excluirServico = async (idFrontend) => {
    try {
      await api('/servico/deletarServico', {
        method: 'DELETE',
        query: { servicoId: idFrontend }
      });
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    buscarTodosServicos,
    buscarServico,
    criarServico,
    editarServico,
    excluirServico
  };
}
