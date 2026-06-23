import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Save } from 'lucide-react'

interface Brand {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

const GENDERS = [
  { value: 'MEN', label: 'Hombre' },
  { value: 'WOMEN', label: 'Mujer' },
  { value: 'BOY', label: 'Niño' },
  { value: 'GIRL', label: 'Niña' },
  { value: 'UNISEX', label: 'Unisex' },
]

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [gender, setGender] = useState('MEN')
  const [basePrice, setBasePrice] = useState('')
  const [baseCost, setBaseCost] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    setLoading(true)
    try {
      const [brRes, catRes] = await Promise.all([
        api.get('/brands'),
        api.get('/categories'),
      ])
      if (brRes.data.success) setBrands(brRes.data.data)
      if (catRes.data.success) setCategories(catRes.data.data)

      if (isEdit) {
        const prodRes = await api.get(`/products/${id}`)
        if (prodRes.data.success) {
          const p = prodRes.data.data
          setName(p.name || '')
          setDescription(p.description || '')
          setBrandId(String(p.brandId || p.brand?.id || ''))
          setCategoryId(String(p.categoryId || p.category?.id || ''))
          setGender(p.gender || 'MEN')
          setBasePrice(String(p.basePrice || ''))
          setBaseCost(String(p.baseCost || ''))
          setImageUrl(p.imageUrl || '')
          setIsActive(p.isActive !== false)
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name,
      description,
      brandId: Number(brandId),
      categoryId: Number(categoryId),
      gender,
      basePrice: Number(basePrice),
      baseCost: Number(baseCost),
      imageUrl: imageUrl || undefined,
      ...(isEdit ? { isActive } : {}),
    }

    try {
      if (isEdit) {
        await api.patch(`/products/${id}`, payload)
        toast.success('Producto actualizado')
      } else {
        await api.post('/products', payload)
        toast.success('Producto creado')
      }
      navigate('/productos')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar producto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/productos')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Nombre del producto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Descripción del producto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Seleccionar marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Género *</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio base *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo base *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL imagen</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Producto activo</span>
          </label>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Producto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/productos')}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
