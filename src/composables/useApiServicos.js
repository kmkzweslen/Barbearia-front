import { useFetch } from '@vueuse/core' 
import { api } from '@/utils/api' 

export function useApiServicos() {
  
  const criarServico = async (dadosServico) => {
    try {
      const { data, error } = await useFetch('/criarServico', {
        fetch: api, 
        method: 'POST',
        body: dadosServico
      }).json()
      
      if (error.value) throw (error.value)
      return { data: data.value, error: null }
    } catch (err) {
      return { data: null, error: err.data || err }
    }
  }

  const editarServico = async (dadosServicoAtualizados) => {
    try {
      const { data, error } = await useFetch('/atualizarServico', {
        fetch: api,
        method: 'PUT',
        body: dadosServicoAtualizados 
      }).json()

      if (error.value) throw (error.value)
      return { data: data.value, error: null }
    } catch (err) {
      return { data: null, error: err.data || err }
    }
  }

  const excluirServico = async (id) => {
    try {
      const { error } = await useFetch('/deletarServico', {
        fetch: api,
        method: 'DELETE',
        params: { id: id } // ❗️ Usa query param "?id=..."
      })
      
      if (error.value) throw (error.value)
      return { success: true, error: null }
    } catch (err) {
      return { success: false, error: err.data || err }
    }
  }
  
  const buscarServico = async (id) => {
     try {
        const { data, error } = await useFetch('/buscarServico', {
            fetch: api,
            method: 'GET',
            params: { id: id }
        }).json()
        
        if (error.value) throw (error.value)
        return { data: data.value, error: null }
     } catch (err) {
        return { data: null, error: err.data || err }
     }
  }

  return {
    criarServico,
    editarServico,
    excluirServico,
    buscarServico
  }
}