'use client';

interface HeaderBarProps {
  currentUser: { nombre: string; rol: string } | null;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export default function HeaderBar({ currentUser, isSidebarCollapsed, onToggleSidebar, onLogout }: HeaderBarProps) {
  return (
    <header className="sap-header">
      <div className="sap-brand">
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '4px'
          }}
          aria-label={isSidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <span className="sap-logo-badge">ERP</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>Amex Courier</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#f8fafc' }}>
          <i className="fa-solid fa-user-circle" style={{ fontSize: '16px', color: '#38bdf8' }}></i>
          <span><strong>{currentUser?.nombre || 'Administrador'}</strong> (<span style={{ color: '#cbd5e1' }}>{currentUser?.rol || 'admin'}</span>)</span>
        </div>

        <button
          onClick={onLogout}
          style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          title="Cerrar Sesión"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Salir
        </button>
      </div>
    </header>
  );
}
