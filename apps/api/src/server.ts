import 'dotenv/config'
import app from './app'

const PORT = parseInt(process.env.PORT || '3001', 10)

app.listen(PORT, () => {
  console.log(`🚀 OmStore API running on http://localhost:${PORT}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
})
