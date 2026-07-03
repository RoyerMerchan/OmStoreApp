import api from './axios'

export async function fetchProducts(params?: Record<string, string>) {
  const res = await api.get('/store/products', { params })
  return res.data
}

export async function fetchProduct(id: string) {
  const res = await api.get(`/store/products/${id}`)
  return res.data
}

export async function fetchExchangeRate() {
  const res = await api.get('/store/exchange-rate')
  return res.data
}

export async function checkShipping(data: { country: string; city: string; zone: string }) {
  const res = await api.post('/store/orders/check-shipping', data)
  return res.data
}

export async function createOrder(data: any) {
  const res = await api.post('/store/orders', data)
  return res.data
}

export async function fetchOrder(id: string) {
  const res = await api.get(`/store/orders/${id}`)
  return res.data
}

export async function uploadProofFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/store/upload-proof', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
