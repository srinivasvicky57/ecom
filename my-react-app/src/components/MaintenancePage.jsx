import { useNavigate } from 'react-router-dom'

const MaintenancePage = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f7f1ea 0%, #efe4d2 100%)',
      padding: '2rem',
      fontFamily: 'Segoe UI, sans-serif',
    }}>
      <div style={{
        maxWidth: '640px',
        width: '100%',
        background: '#fffdf9',
        border: '1px solid #e7d7c4',
        borderRadius: '20px',
        boxShadow: '0 20px 45px rgba(71, 51, 32, 0.12)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🛠️</div>
        <h1 style={{ margin: '0 0 0.75rem', color: '#2e1f12', fontSize: '2.1rem' }}>We are under maintenance</h1>
        <p style={{ margin: '0 0 1.5rem', color: '#5d4538', fontSize: '1rem', lineHeight: 1.7 }}>
          Our store is temporarily unavailable while we improve your shopping experience. Please check back shortly.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            border: 'none',
            borderRadius: '999px',
            background: '#8b5a2b',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '0.9rem 1.6rem',
            fontSize: '0.95rem',
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  )
}

export default MaintenancePage
