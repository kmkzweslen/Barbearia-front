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

    // Buscar agendamentos por cliente (usando email)
    // Tenta primeiro o endpoint com clienteEmail, se falhar usa fallback
    const buscarAgendamentosPorCliente = async (email) => {
        try {
            // Tenta o novo endpoint com clienteEmail
            const data = await api('/agendamento/buscarPorCliente', {
                method: 'GET',
                query: { clienteEmail: email }
            });

            if (data && Array.isArray(data)) {
                const dadosMapeados = data.map(mapBackendToFrontend);
                return { data: dadosMapeados, error: null };
            }
            return { data: [], error: null };
        } catch (err) {
            console.log('Endpoint clienteEmail falhou, usando fallback...');
            
            // Fallback: busca todos e filtra pelo email
            try {
                const allData = await api('/agendamento/buscarTodosAgendamentos', {
                    method: 'GET'
                });

                if (allData && Array.isArray(allData)) {
                    const agendamentosDoCliente = allData.filter(agendamento => {
                        const clienteEmail = agendamento.cliente?.email || agendamento.clienteEmail;
                        return clienteEmail && clienteEmail.toLowerCase() === email.toLowerCase();
                    });
                    
                    const dadosMapeados = agendamentosDoCliente.map(mapBackendToFrontend);
                    return { data: dadosMapeados, error: null };
                }
                return { data: [], error: null };
            } catch (fallbackErr) {
                console.error('Erro ao buscar agendamentos do cliente:', fallbackErr);
                return { data: null, error: fallbackErr };
            }
        }
    };

    // Buscar agendamento por ID
    const buscarAgendamentoPorId = async (id) => {
        try {
            const data = await api('/agendamento/buscarAgendamento', {
                method: 'GET',
                query: { agendamentoId: id }
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

    // Cancelar agendamento (usa PATCH conforme backend)
    const cancelarAgendamento = async (id) => {
        try {
            await api('/agendamento/cancelarAgendamento', {
                method: 'PATCH',
                query: { agendamentoId: id }
            });
            return { success: true, error: null };
        } catch (err) {
            console.error('Erro ao cancelar agendamento:', err);
            return { success: false, error: err };
        }
    };

    // Concluir agendamento (registra pagamento e histórico)
    const concluirAgendamento = async (id, formaPagamento) => {
        try {
            await api('/agendamento/concluirAgendamento', {
                method: 'PATCH',
                query: { agendamentoId: id, formaPagamento }
            });
            return { success: true, error: null };
        } catch (err) {
            console.error('Erro ao concluir agendamento:', err);
            return { success: false, error: err };
        }
    };

    // Buscar agendamentos por intervalo de datas
    const buscarPorIntervaloDeDatas = async (inicio, fim) => {
        try {
            const data = await api('/agendamento/buscarPorIntervaloDeDatas', {
                method: 'GET',
                query: { inicio, fim }
            });

            if (data && Array.isArray(data)) {
                const dadosMapeados = data.map(mapBackendToFrontend);
                return { data: dadosMapeados, error: null };
            }
            return { data: [], error: null };
        } catch (err) {
            console.error('Erro ao buscar agendamentos por intervalo:', err);
            return { data: null, error: err };
        }
    };

    return {
        buscarTodosAgendamentos,
        buscarAgendamentosPorCliente,
        buscarAgendamentoPorId,
        criarAgendamento,
        atualizarAgendamento,
        cancelarAgendamento,
        concluirAgendamento,
        buscarPorIntervaloDeDatas
    };
}
