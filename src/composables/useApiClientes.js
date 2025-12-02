import { api } from '@/utils/api';

export function useApiClientes() {
  const criarCliente = async (dadosCliente) => {
    try {
      const data = await api('/cliente/criarCliente', {
        method: 'POST',
        body: dadosCliente
      });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const editarCliente = async (dadosClienteAtualizados) => {
    try {
      const data = await api('/cliente/atualizarCliente', {
        method: 'PUT',
        body: dadosClienteAtualizados
      });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const excluirCliente = async (email) => {
    try {
      await api('/cliente/deletarCliente', {
        method: 'DELETE',
        params: { email }
      });
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const buscarCliente = async (email) => {
    try {
      const data = await api('/cliente/buscarCliente', {
        method: 'GET',
        params: { email }
      });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const buscarTodosClientes = async () => {
    try {
      const data = await api('/cliente/buscarTodosClientes', {
        method: 'GET'
      });
      if (data && Array.isArray(data)) {
        return { data, error: null };
      }
      return { data: [], error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const loginComSenha = async (email, password) => {
    try {
      const data = await api('/cliente/auth/login-senha', {
        method: 'POST',
        body: { email, password }
      });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  return {
    criarCliente,
    editarCliente,
    excluirCliente,
    buscarCliente,
    buscarTodosClientes,
    loginComSenha
  };
}
