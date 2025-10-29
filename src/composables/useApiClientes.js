import { api } from '@/utils/api'

export function useApiClientes() {

    const criarCliente = async (dadosCliente) => {
        try {
            const data = await api('/criarCliente', {
                method: 'POST',
                body: dadosCliente
            });
            return { data: data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    }

    const editarCliente = async (dadosClienteAtualizados) => {
        try {
            const data = await api('/atualizarCliente', {
                method: 'PUT',
                body: dadosClienteAtualizados
            });
            return { data: data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    }

    const excluirCliente = async (email) => {
        try {            await api('/deletarCliente', {
                method: 'DELETE',
                params: { email: email }
            });
            return { success: true, error: null };
        } catch (err) {
            return { success: false, error: err };
        }
    }

    const buscarCliente = async (email) => {
        try {
            const data = await api('/buscarCliente', {
                method: 'GET',
                params: { email: email }
            });
            return { data: data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    }

    const buscarTodosClientes = async () => {
        try {
            const data = await api('/buscarTodosClientes', {
                method: 'GET'
            });
            if (data && Array.isArray(data)) {
                return { data: data, error: null };
            }
            return { data: [], error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    }

    return {
        criarCliente,
        editarCliente,
        excluirCliente,
        buscarCliente,
        buscarTodosClientes
    }
}