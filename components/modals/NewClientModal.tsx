'use client';

export interface NewClientFormData {
  nombre: string;
  documentoIdentidad: string;
  telefono: string;
  email: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccionEntrega: string;
  transportistaPreferido: string;
  agenciaDestino: string;
}

interface NewClientModalProps {
  form: NewClientFormData;
  onChange: (form: NewClientFormData) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function NewClientModal({ form, onChange, onSave, onClose }: NewClientModalProps) {
  const set = (key: keyof NewClientFormData, value: string) => onChange({ ...form, [key]: value });

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            <i className="fa-solid fa-user-plus" style={{ color: '#2563eb', marginRight: '8px' }}></i> Crear Nuevo Casillero AMEX
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
        <form onSubmit={onSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nombre Completo del Cliente / Razon Social</label>
              <input type="text" required className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: María Torres Pérez" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">DNI / RUC Fiscal</label>
                <input type="text" required className="form-control" value={form.documentoIdentidad} onChange={e => set('documentoIdentidad', e.target.value)} placeholder="72819204" />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Contacto</label>
                <input type="text" className="form-control" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+51 987654321" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Dirección de Entrega</label>
              <input type="text" className="form-control" value={form.direccionEntrega} onChange={e => set('direccionEntrega', e.target.value)} placeholder="Av. Balta 456, Int 201" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Casillero</button>
          </div>
        </form>
      </div>
    </div>
  );
}
