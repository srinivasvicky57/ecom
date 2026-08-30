import { API_BASE_URL } from '../constants/api'

const GenerateInvoiceButton = ({ order }) => {
  const invoiceUrl = order?.invoice?.url

  if (!invoiceUrl) return null

  const handleOpenInvoice = () => {
    const fullUrl = new URL(invoiceUrl, API_BASE_URL).toString()
    window.open(fullUrl, '_blank', 'noopener,noreferrer')
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
