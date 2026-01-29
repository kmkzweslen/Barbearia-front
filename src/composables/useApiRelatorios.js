import { api } from '@/utils/api'

export function useApiRelatorios() {
    async function buscarServicosMaisVendidos(inicio, fim) {
        return await api('/relatorios/servicosMaisVendidos', {
            method: 'GET',
            params: { inicio, fim }
        })
    }

    async function buscarClientesMaisFrequentes(inicio, fim) {
        return await api('/relatorios/clientesMaisFrequentes', {
            method: 'GET',
            params: { inicio, fim }
        })
    }

    return {
        buscarServicosMaisVendidos,
        buscarClientesMaisFrequentes
    }
}
