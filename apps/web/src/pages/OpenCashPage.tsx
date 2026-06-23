import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import api from '../lib/axios'

export default function OpenCashPage() {
  const navigate = useNavigate()
  const [openingAmount, setOpeningAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (openingAmount <= 0) {
      toast.error('El monto inicial debe ser mayor a 0')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/cash/open', {
        openingAmount,
        notes: notes.trim() || undefined,
      })
      toast.success('Caja abierta exitosamente')
      navigate('/caja')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al abrir caja'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/caja')}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Abrir Caja</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto Inicial
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                type="number"
                min={1}
                step={100}
                value={openingAmount}
                onChange={(e) => setOpeningAmount(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="0"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              rows={4}
              placeholder="Notas sobre la apertura..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Abriendo caja...
              </>
            ) : (
              'Abrir Caja'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
