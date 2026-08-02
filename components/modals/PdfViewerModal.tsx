'use client';

interface PdfViewerModalProps {
  url: string;
  onClose: () => void;
}

export default function PdfViewerModal({ url, onClose }: PdfViewerModalProps) {
  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '900px', height: '85vh' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626' }}>
            <i className="fa-solid fa-file-pdf"></i> Visor Factura PDF (Cloudflare R2 Storage)
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} title="Visor PDF R2"></iframe>
        </div>
      </div>
    </div>
  );
}
