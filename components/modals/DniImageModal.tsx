'use client';

import Image from 'next/image';

interface DniImageModalProps {
  image: { url: string; titulo: string; subtitulo: string };
  onClose: () => void;
}

export default function DniImageModal({ image, onClose }: DniImageModalProps) {
  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '700px', height: '90vh' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb' }}>
            <i className="fa-solid fa-id-card"></i> Visor Expediente DNI ({image.titulo})
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            {image.subtitulo}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', minHeight: 0 }}>
            <Image src={image.url} alt={image.titulo} width={800} height={600} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
