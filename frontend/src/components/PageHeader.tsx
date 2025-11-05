import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
}

export default function PageHeader({ title, subtitle, backTo }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div style={{
      backgroundColor: '#2563EB',
      color: 'white',
      padding: '20px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '20px'
            }}
          >
            ← BACK
          </button>
        )}
        <h1 style={{ display: 'inline', margin: 0 }}>{title}</h1>
      </div>
      {subtitle && <p style={{ margin: 0 }}>{subtitle}</p>}
    </div>
  )
}
