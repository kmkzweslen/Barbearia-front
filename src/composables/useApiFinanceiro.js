import { api } from '@/utils/api';

// Funções auxiliares para formatação de datas
const formatDateToBackend = (dateString) => {
  // Converte de qualquer formato para YYYY-MM-DD
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Mapeia dados de despesa do backend para o frontend
const mapDespesaBackendToFrontend = (despesa) => {
  if (!despesa) return null;
  return {
    id: despesa.despesaId,
    descricao: despesa.descricao,
    valor: despesa.valor,
    data: despesa.dataDespesa,
    categoria: despesa.categoria || 'Outros'
  };
};

// Mapeia dados de despesa do frontend para o backend
const mapDespesaFrontendToBackend = (despesa) => {
  if (!despesa) return null;
  return {
    despesaId: despesa.id,
    descricao: despesa.descricao,
    valor: despesa.valor,
    dataDespesa: formatDateToBackend(despesa.data)
  };
};

// Mapeia dados de pagamento do backend para o frontend
const mapPagamentoBackendToFrontend = (pagamento) => {
  if (!pagamento) return null;
  return {
    id: pagamento.pagamentoId,
    agendamentoId: pagamento.agendamentoId,
    valor: pagamento.valor,
    dataPagamento: pagamento.dataPagamento,
    formaPagamento: pagamento.formaPagamento
  };
};

export function useApiFinanceiro() {

  // =============== DESPESAS ===============

  // Buscar todas as despesas
  const buscarTodasDespesas = async () => {
    try {
      const data = await api('/despesas', {
        method: 'GET'
      });

      if (data && Array.isArray(data)) {
        const dadosMapeados = data.map(mapDespesaBackendToFrontend);
        return { data: dadosMapeados, error: null };
      }
      return { data: [], error: null };
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
      return { data: null, error: err };
    }
  };

  // Buscar despesas por período (filtragem local após buscar todas)
  const buscarDespesasPorPeriodo = async (dataInicio, dataFim) => {
    try {
      const { data: despesas, error } = await buscarTodasDespesas();
      if (error) return { data: null, error };

      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);

      const filtradas = despesas.filter(d => {
        const dataDespesa = new Date(d.data);
        return dataDespesa >= inicio && dataDespesa <= fim;
      });

      return { data: filtradas, error: null };
    } catch (err) {
      console.error('Erro ao buscar despesas por período:', err);
      return { data: null, error: err };
    }
  };

  // Criar despesa
  const criarDespesa = async (dadosDespesa) => {
    try {
      const dadosParaBackend = mapDespesaFrontendToBackend(dadosDespesa);
      const data = await api('/despesas', {
        method: 'POST',
        body: dadosParaBackend
      });
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao criar despesa:', err);
      return { data: null, error: err };
    }
  };

  // Atualizar despesa
  const atualizarDespesa = async (despesaAtualizada) => {
    try {
      const dadosParaBackend = mapDespesaFrontendToBackend(despesaAtualizada);
      const data = await api('/despesas', {
        method: 'PUT',
        body: dadosParaBackend
      });
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar despesa:', err);
      return { data: null, error: err };
    }
  };

  // Excluir despesa
  const excluirDespesa = async (id) => {
    try {
      await api(`/despesas/${id}`, {
        method: 'DELETE'
      });
      return { success: true, error: null };
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
      return { success: false, error: err };
    }
  };

  // =============== PAGAMENTOS ===============

  // Registrar pagamento
  const registrarPagamento = async (dadosPagamento) => {
    try {
      const data = await api('/pagamentos/registrar', {
        method: 'POST',
        body: dadosPagamento
      });
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err);
      return { data: null, error: err };
    }
  };

  // Buscar pagamento por ID
  const buscarPagamentoPorId = async (pagamentoId) => {
    try {
      const data = await api(`/pagamentos/${pagamentoId}`, {
        method: 'GET'
      });
      return { data: mapPagamentoBackendToFrontend(data), error: null };
    } catch (err) {
      console.error('Erro ao buscar pagamento:', err);
      return { data: null, error: err };
    }
  };

  // Buscar pagamento por agendamento
  const buscarPagamentoPorAgendamento = async (agendamentoId) => {
    try {
      const data = await api(`/pagamentos/agendamento/${agendamentoId}`, {
        method: 'GET'
      });
      return { data: mapPagamentoBackendToFrontend(data), error: null };
    } catch (err) {
      console.error('Erro ao buscar pagamento do agendamento:', err);
      return { data: null, error: err };
    }
  };

  // =============== RESUMO FINANCEIRO ===============

  // Obter resumo financeiro do backend
  const obterResumoFinanceiro = async (dataInicio, dataFim) => {
    try {
      const inicio = formatDateToBackend(dataInicio);
      const fim = formatDateToBackend(dataFim);

      const data = await api(`/financeiro/resumo?inicio=${inicio}&fim=${fim}`, {
        method: 'GET'
      });

      return {
        data: {
          totalEntradas: data.totalEntradas || 0,
          totalSaidas: data.totalSaidas || 0,
          saldo: data.saldo || 0,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim
        },
        error: null
      };
    } catch (err) {
      console.error('Erro ao obter resumo financeiro:', err);
      return { data: null, error: err };
    }
  };

  // Calcular resumo financeiro com detalhes (usa API + busca detalhes de despesas)
  const calcularResumoFinanceiro = async (dataInicio, dataFim) => {
    try {
      // Buscar resumo do backend
      const { data: resumo, error: erroResumo } = await obterResumoFinanceiro(dataInicio, dataFim);
      if (erroResumo) return { data: null, error: erroResumo };

      // Buscar despesas do período para mostrar na tabela
      const { data: despesas, error: erroDespesas } = await buscarDespesasPorPeriodo(dataInicio, dataFim);
      
      // Buscar receitas (agendamentos concluídos) para mostrar na tabela
      const { data: receitas, error: erroReceitas } = await buscarReceitasPorPeriodo(dataInicio, dataFim);

      return {
        data: {
          totalReceitas: resumo.totalEntradas,
          totalDespesas: resumo.totalSaidas,
          lucro: resumo.saldo,
          quantidadeReceitas: receitas ? receitas.length : 0,
          quantidadeDespesas: despesas ? despesas.length : 0,
          receitas: receitas || [],
          despesas: despesas || []
        },
        error: null
      };
    } catch (err) {
      console.error('Erro ao calcular resumo financeiro:', err);
      return { data: null, error: err };
    }
  };

  // =============== RECEITAS (via agendamentos) ===============

  // Buscar receitas dos agendamentos concluídos
  const buscarReceitasAgendamentos = async () => {
    try {
      const data = await api('/agendamento/buscarTodosAgendamentos', {
        method: 'GET'
      });

      if (data && Array.isArray(data)) {
        // Filtrar apenas concluídos e mapear para receitas
        const receitas = data
          .filter(a => a.status === 'CONCLUIDO')
          .map(a => ({
            id: a.id,
            data: a.horario,
            valor: a.servico?.preco || 0,
            servico: a.servico?.nome || 'Serviço',
            barbeiro: a.barbeiro?.nome || 'N/A',
            cliente: a.cliente?.nome || 'N/A'
          }));
        return { data: receitas, error: null };
      }
      return { data: [], error: null };
    } catch (err) {
      console.error('Erro ao buscar receitas:', err);
      return { data: null, error: err };
    }
  };

  // Buscar receitas por período
  const buscarReceitasPorPeriodo = async (dataInicio, dataFim) => {
    try {
      const { data: receitas, error } = await buscarReceitasAgendamentos();
      if (error) return { data: null, error };

      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);

      const filtradas = receitas.filter(r => {
        const dataReceita = new Date(r.data);
        return dataReceita >= inicio && dataReceita <= fim;
      });

      return { data: filtradas, error: null };
    } catch (err) {
      console.error('Erro ao buscar receitas por período:', err);
      return { data: null, error: err };
    }
  };

  // =============== RELATÓRIOS ===============

  // Gerar relatório mensal
  const gerarRelatorioMensal = async (ano, mes) => {
    try {
      // Primeiro e último dia do mês
      const dataInicio = new Date(ano, mes - 1, 1);
      const dataFim = new Date(ano, mes, 0);

      const inicioStr = dataInicio.toISOString().split('T')[0];
      const fimStr = dataFim.toISOString().split('T')[0];

      const resumo = await calcularResumoFinanceiro(inicioStr, fimStr);

      if (resumo.error) return resumo;

      // Agrupar receitas por dia para o gráfico
      const receitasPorDia = {};
      const despesasPorDia = {};
      
      const diasNoMes = dataFim.getDate();
      for (let i = 1; i <= diasNoMes; i++) {
        const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        receitasPorDia[dataKey] = 0;
        despesasPorDia[dataKey] = 0;
      }

      if (resumo.data.receitas) {
        resumo.data.receitas.forEach(r => {
          const dataKey = new Date(r.data).toISOString().split('T')[0];
          if (receitasPorDia[dataKey] !== undefined) {
            receitasPorDia[dataKey] += r.valor || 0;
          }
        });
      }

      if (resumo.data.despesas) {
        resumo.data.despesas.forEach(d => {
          const dataKey = new Date(d.data).toISOString().split('T')[0];
          if (despesasPorDia[dataKey] !== undefined) {
            despesasPorDia[dataKey] += d.valor || 0;
          }
        });
      }

      return {
        data: {
          ...resumo.data,
          receitasPorDia,
          despesasPorDia,
          ano,
          mes,
          nomeMes: new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long' })
        },
        error: null
      };
    } catch (err) {
      console.error('Erro ao gerar relatório mensal:', err);
      return { data: null, error: err };
    }
  };

  // Gerar relatório dos últimos 6 meses
  const gerarRelatorioUltimos6Meses = async () => {
    try {
      const hoje = new Date();
      const relatorios = [];

      for (let i = 0; i < 6; i++) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const resultado = await gerarRelatorioMensal(data.getFullYear(), data.getMonth() + 1);
        if (resultado.data) {
          relatorios.push(resultado.data);
        }
      }

      return { data: relatorios.reverse(), error: null };
    } catch (err) {
      console.error('Erro ao gerar relatório dos últimos 6 meses:', err);
      return { data: null, error: err };
    }
  };

  return {
    // Despesas
    buscarTodasDespesas,
    buscarDespesasPorPeriodo,
    criarDespesa,
    atualizarDespesa,
    excluirDespesa,
    // Pagamentos
    registrarPagamento,
    buscarPagamentoPorId,
    buscarPagamentoPorAgendamento,
    // Receitas
    buscarReceitasAgendamentos,
    buscarReceitasPorPeriodo,
    // Resumo Financeiro
    obterResumoFinanceiro,
    calcularResumoFinanceiro,
    // Relatórios
    gerarRelatorioMensal,
    gerarRelatorioUltimos6Meses
  };
}
