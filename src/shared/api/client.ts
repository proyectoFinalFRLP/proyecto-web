import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message =
        error.response?.data?.error ??
        error.response?.data?.message ??
        error.message

      if (status === 401) {
        localStorage.removeItem('token')
      }

      return Promise.reject(new Error(message))
    }
    return Promise.reject(error)
  },
)
