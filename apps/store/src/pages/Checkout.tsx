import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, DollarSign, Smartphone, Banknote, Loader2 } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { checkShipping, createOrder, fetchExchangeRate } from '../lib/storeApi'

interface ShippingResult {
  deliveryType: string
  shippingUsdCents: number
  available: boolean
  message: string
}

const COUNTRIES = ['Venezuela', 'Colombia', 'Ecuador', 'Perú', 'Panamá', 'Estados Unidos', 'España', 'Otro']
const VENEZUELA_STATES: Record<string, string[]> = {
  'Distrito Capital': ['Caracas'],
  'Miranda': ['Los Teques', 'Altos Mirandinos', 'Valles del Tuy', 'Gualcaipuro', 'Buroz'],
}
const CARACAS_ZONES = ['Libertador', 'Chacao', 'Baruta', 'Sucre', 'El Hatillo']
const LOS_TEQUES_ZONES = ['Zona Centro', 'Zona Norte', 'Zona Sur']

const PAYMENT_METHODS = [
  { value: 'BS', label: 'Bolívares (Bs)', icon: Landmark },
  { value: 'USDT', label: 'USDT (TRC20)', icon: DollarSign },
  { value: 'ZELLE', label: 'Zelle', icon: Smartphone },
  { value: 'CASH_ON_DELIVERY', label: 'Contraentrega', icon: Banknote },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalUsdCents, clearCart } = useCartStore()

  const [exchangeRate, setExchangeRate] = useState(60)
  const [submitting, setSubmitting] = useState(false)
  const [shipping, setShipping] = useState<ShippingResult | null>(null)

  const [country, setCountry] = useState('Venezuela')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [zone, setZone] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BS')
  const [proofRef, setProofRef] = useState('')
  const [notes, setNotes] = useState('')

  const isDigital = paymentMethod !== 'CASH_ON_DELIVERY'
  const total = totalUsdCents()
  const totalBs = total / 100 * exchangeRate
  const shippingCents = shipping?.shippingUsdCents ?? 0
  const grandTotal = total + shippingCents

  useEffect(() => {
    if (items.length === 0) navigate('/tienda')
    fetchExchangeRate().then((res: any) => { if (res.data?.rate) setExchangeRate(res.data.rate) }).catch(() => {})
  }, [items.length, navigate])

  useEffect(() => {
    if (country && city && zone) {
      checkShipping({ country, city, zone }).then((res: any) => {
        if (res.data) setShipping(res.data)
      }).catch(() => {})
    } else {
      setShipping(null)
    }
  }, [country, city, zone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipping?.available) return
    setSubmitting(true)
    try {
      const orderData: any = {
        deliveryLocation: { country, city: city || state, zone, address },
        deliveryType: shipping.deliveryType,
        paymentMethod,
        paymentReference: proofRef || undefined,
        notes: notes || undefined,
        shippingUsdCents: shippingCents,
        items: items.map((i: any) => ({ variantId: i.variantId, quantity: i.quantity })),
      }

      const res: any = await createOrder(orderData)
      if (res.success) {
        clearCart()
        navigate(`/tienda/confirmacion/${res.data.id}`)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Ubicación de entrega</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País *</label>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setState(''); setCity(''); setZone('') }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
              >
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {country === 'Venezuela' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado *</label>
                <select
                  value={state}
                  onChange={(e) => { setState(e.target.value); setCity(''); setZone('') }}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar estado</option>
                  {Object.keys(VENEZUELA_STATES).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            {state && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad *</label>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setZone('') }}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar ciudad</option>
                  {(VENEZUELA_STATES[state] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            {city && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zona *</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar zona</option>
                  {(city === 'Caracas' ? CARACAS_ZONES : city === 'Los Teques' ? LOS_TEQUES_ZONES : []).map((z) => <option key={z} value={z}>{z}</option>)}
                  <option value="otra">Otra zona</option>
                </select>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección detallada *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Calle, edificio, apartamento, referencias..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          {shipping && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              shipping.available
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {shipping.message}
              {shipping.shippingUsdCents > 0 && ` (+$${(shipping.shippingUsdCents / 100).toFixed(2)} USD)`}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Método de pago</h2>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon
              return (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    paymentMethod === pm.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-xs leading-tight">{pm.label}</span>
                </button>
              )
            })}
          </div>

          {isDigital && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paymentMethod === 'BS'
                  ? `Deposita Bs ${totalBs.toFixed(2)} en la cuenta que te indicaremos tras confirmar tu pedido.`
                  : paymentMethod === 'USDT'
                  ? `Envía USDT ${(total / 100).toFixed(2)} (TRC20) a la dirección que te indicaremos.`
                  : `Envía $${(total / 100).toFixed(2)} por Zelle al correo que te indicaremos.`}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° de referencia de pago</label>
                <input
                  value={proofRef}
                  onChange={(e) => setProofRef(e.target.value)}
                  placeholder="Ingresa el número de referencia o hash"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'CASH_ON_DELIVERY' && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Pagas en efectivo cuando recibas el pedido. Te contactaremos para confirmar disponibilidad.
            </p>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas del pedido (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Indicaciones especiales..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Resumen del pedido</h2>
          <div className="space-y-2 text-sm">
            {items.map((item: any) => (
              <div key={item.variantId} className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{item.productName} ({item.size}/{item.color}) x{item.quantity}</span>
                <span>${(item.priceUsdCents * item.quantity / 100).toFixed(2)}</span>
              </div>
            ))}
            {shippingCents > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Envío</span>
                <span>+${(shippingCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <div className="text-right">
                <p>${(grandTotal / 100).toFixed(2)} USD</p>
                {exchangeRate > 0 && (
                  <p className="text-sm text-gray-500">Bs {(grandTotal / 100 * exchangeRate).toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !shipping?.available || items.length === 0 || (isDigital && !proofRef)}
            className="w-full mt-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <><Loader2 className="animate-spin" size={18} /> Procesando...</>
            ) : (
              'Confirmar Pedido'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
