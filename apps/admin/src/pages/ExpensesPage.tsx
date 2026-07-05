import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'

interface Expense {
  id: number
  date: string
  concept: string
  category: string
  amount: number
  cashRegister: string
}

interface Category {
  id: number
  name: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPeriod, setTotalPeriod] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [concept, setConcept] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadExpenses()
    loadCategories()
  }, [])

  async function loadExpenses() {
    setLoading(true)
    try {
      const res = await api.get('/expenses')
      if (res.data.success) {
        setExpenses(res.data.data)
        setTotalPeriod(res.data.totalPeriod || 0)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const res = await api.get('/expenses/categories')
      if (res.data.success) setCategories(res.data.data)
    } catch { /* ignore */ }
  }

  function openForm() {
    setConcept('')
    setCategoryId('')
    setAmount(0)
    setNotes('')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!concept) { toast.error('Ingresa el concepto'); return }
    if (!categoryId) { toast.error('Selecciona una categoría'); return }
    if (!amount || amount <= 0) { toast.error('Ingresa un monto válido'); return }

    setSubmitting(true)
    try {
      const res = await api.post('/expenses', { concept, categoryId, amount, notes })
      if (res.data.success) {
        toast.success('Gasto registrado')
        setShowForm(false)
        loadExpenses()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar gasto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Gasto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total del período</span>
          <span className="text-lg font-bold text-gray-900">${totalPeriod?.toLocaleString()}</span>
        </div>
      </div>

      {!showForm && (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Concepto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Categoría</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Monto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Caja</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No hay gastos registrados</td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{e.concept}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 font-medium">
                          -${e.amount?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{e.cashRegister || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-lg bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Gasto</h2>
          <div>
            <label htmlFor="expense-concept" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Concepto</label>
            <input
              id="expense-concept"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <select
              id="expense-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
            <input
              id="expense-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              min={0.01}
              step={0.01}
              required
            />
          </div>
          <div>
            <label htmlFor="expense-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
            <textarea
              id="expense-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Opcional"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {submitting ? 'Registrando...' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
