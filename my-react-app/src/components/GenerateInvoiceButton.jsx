import { ORDER_URL } from '../constants/api'
import { authFetch } from '../constants/auth'

const GenerateInvoiceButton = ({ order }) => {
  if (!order?.orderId) return null

  const handleOpenInvoice = async () => {
    try {
      const res = await authFetch(`${ORDER_URL}/${order.orderId}/invoice`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to generate invoice')
      }

      const blob = await res.blob()
      const pdfUrl = URL.createObjectURL(blob)
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Invoice open error:', error)
      window.alert(error.message || 'Unable to open invoice')
    }
  }

  return (
    <button
      type="button"
      onClick={handleOpenInvoice}
      style={{
        border: '1px solid #a6622c',
        background: '#fff7f0',
        color: '#7d3d1d',
        borderRadius: '999px',
        padding: '0.45rem 0.9rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#fce9db'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#fff7f0'
      }}
    >
      View Invoice
    </button>
  )
}

export default GenerateInvoiceButton
