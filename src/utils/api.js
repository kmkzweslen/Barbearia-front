import { ofetch } from 'ofetch'

// Usa URL direta do backend (proxy não resolve CORS do backend)
const baseURL = 'https://barbearia-backend-x0st.onrender.com/api'

export const api = ofetch.create({
  baseURL,
  credentials: 'omit', // Não envia cookies para evitar problemas CORS

  async onRequest({ options }) {
    // Verificar primeiro token de admin, depois de cliente
    const tokenAdmin = localStorage.getItem('tokenAdmin');
    const tokenCliente = localStorage.getItem('tokenCliente');
    const token = tokenAdmin || tokenCliente;

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      };
    }
    
    // Headers para tentar evitar problemas CORS
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
  },

  async onResponseError({ response }) {
    console.error('Erro na requisição API:', response._data)

    if (response.status === 503) {
      alert("O servidor da API está `hibernando` (plano gratuito). A primeira requisição pode demorar até 50 segundos. Tente novamente em um minuto.")
    }
  }
})