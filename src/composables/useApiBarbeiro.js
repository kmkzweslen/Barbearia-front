import { api } from '@/utils/api';

export function useApiBarbeiros() {
  const criarBarbeiro = async (dadosBarbeiro) => {
    try {
      const data = await api('/barbeiro/criarBarbeiro', {
        method: 'POST',
        body: dadosBarbeiro,
      });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const editarBarbeiro = async (dadosBarbeiroAtualizados) => {
    try {
      const data = await api('/barbeiro/atualizarBarbeiro', {
        method: 'PUT',
        body: dadosBarbeiroAtualizados,
      });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const excluirBarbeiro = async (email) => {
    try {
      await api('/barbeiro/deletarBarbeiro', {
        method: 'DELETE',
        query: { email },
      });
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const buscarTodosBarbeiros = async () => {
    try {
      const data = await api('/barbeiro/buscarTodosBarbeiros', { method: 'GET' });
      if (data && Array.isArray(data)) {
        return { data, error: null };
      }
      return { data: [], error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  return {
    criarBarbeiro,
    editarBarbeiro,
    excluirBarbeiro,
    buscarTodosBarbeiros
  };
}
