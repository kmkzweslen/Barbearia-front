import { api } from '@/utils/api';

// Funções auxiliares para formatação
const formatarData = (horarioISO) => {
    if (!horarioISO) return 'N/A';
    const data = new Date(horarioISO);
    return data.toLocaleDateString('pt-BR');
};

const formatarHora = (horarioISO) => {
    if (!horarioISO) return 'N/A';
    const data = new Date(horarioISO);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Mapeia dados do backend para o frontend
const mapBackendToFrontend = (agendamento) => {
    if (!agendamento) return null;

    return {
        id: agendamento.id,
        servico: agendamento.servico?.nome || agendamento.servicoNome || 'N/A',
        servicoId: agendamento.servico?.id || agendamento.servicoId,
        barbeiro: agendamento.barbeiro?.nome || agendamento.barbeiroNome || 'N/A',
        barbeiroEmail: agendamento.barbeiro?.email || agendamento.barbeiroEmail,
        clienteEmail: agendamento.cliente?.email || agendamento.clienteEmail,
        clienteNome: agendamento.cliente?.nome || agendamento.clienteNome,
        horario: agendamento.horario,
        data: formatarData(agendamento.horario),
        hora: formatarHora(agendamento.horario),
        status: agendamento.status || 'PENDENTE'
    };
};

export function useApiAgendamentos() {

    // Buscar todos os agendamentos (Admin)
    const buscarTodosAgendamentos = async () => {
        try {
            const data = await api('/agendamento/buscarTodosAgendamentos', {
                method: 'GET'
            });

            if (data && Array.isArray(data)) {
                const dadosMapeados = data.map(mapBackendToFrontend);
                return { data: dadosMapeados, error: null };
            }
            return { data: [], error: null };
        } catch (err) {
            console.error('Erro ao buscar todos agendamentos:', err);
            return { data: null, error: err };
        }
    };

    // Buscar agendamentos por cliente
    const buscarAgendamentosPorCliente = async (email) => {
        try {
            const data = await api(`/agendamento/buscarPorCliente?email=${email}`, {
                method: 'GET'
            });

            if (data && Array.isArray(data)) {
                const dadosMapeados = data.map(mapBackendToFrontend);
                return { data: dadosMapeados, error: null };
            }
            return { data: [], error: null };
        } catch (err) {
            console.error('Erro ao buscar agendamentos do cliente:', err);
            return { data: null, error: err };
        }
    };

    // Buscar agendamento por ID
    const buscarAgendamentoPorId = async (id) => {
        try {
            const data = await api(`/agendamento/buscarAgendamento?id=${id}`, {
                method: 'GET'
            });
            return { data: mapBackendToFrontend(data), error: null };
        } catch (err) {
            console.error('Erro ao buscar agendamento:', err);
            return { data: null, error: err };
        }
    };

    // Criar agendamento
    const criarAgendamento = async (dadosAgendamento) => {
        try {
            const data = await api('/agendamento/criarAgendamento', {
                method: 'POST',
                body: dadosAgendamento
            });
            return { data: mapBackendToFrontend(data), error: null };
        } catch (err) {
            console.error('Erro ao criar agendamento:', err);
            return { data: null, error: err };
        }
    };

    // Atualizar agendamento
    const atualizarAgendamento = async (id, dadosAtualizados) => {
        try {
            const data = await api('/agendamento/atualizarAgendamento', {
                method: 'PUT',
                body: { id, ...dadosAtualizados }
            });
            return { data: mapBackendToFrontend(data), error: null };
        } catch (err) {
            console.error('Erro ao atualizar agendamento:', err);
            return { data: null, error: err };
        }
    };

    // Cancelar agendamento
    const cancelarAgendamento = async (id) => {
        try {
            await api(`/agendamento/cancelarAgendamento?id=${id}`, {
                method: 'DELETE'
            });
            return { success: true, error: null };
        } catch (err) {
            console.error('Erro ao cancelar agendamento:', err);
            return { success: false, error: err };
        }
    };

    // Deletar agendamento
    const deletarAgendamento = async (id) => {
        try {
            await api(`/agendamento/deletarAgendamento?id=${id}`, {
                method: 'DELETE'
            });
            return { success: true, error: null };
        } catch (err) {
            console.error('Erro ao deletar agendamento:', err);
            return { success: false, error: err };
        }
    };

    return {
        buscarTodosAgendamentos,
        buscarAgendamentosPorCliente,
        buscarAgendamentoPorId,
        criarAgendamento,
        atualizarAgendamento,
        cancelarAgendamento,
        deletarAgendamento
    };
}
