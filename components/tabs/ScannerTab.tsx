'use client';

import dynamic from 'next/dynamic';

const MobileScannerModal = dynamic(
  () => import('@/components/scanner/MobileScannerModal'),
  { ssr: false }
);

interface ScannedLog {
  code: string;
  format: string;
  time: string;
}

interface ScannerTabProps {
  scannedLogs: ScannedLog[];
  onConfirm: (code: string, format: string) => void;
}

export default function ScannerTab({ scannedLogs, onConfirm }: ScannerTabProps) {
  return (
    <div>
      <div className="sap-breadcrumb">
        <span>Operaciones y Almacenes</span> / <span>Escáner de Códigos de Barras</span>
      </div>
      <MobileScannerModal
        isOpen={true}
        isInline={true}
        onClose={() => {}}
        onConfirm={onConfirm}
      />

      <div className="card-panel" style={{ marginTop: '18px' }}>
        <div className="panel-title">
          <h3>
            <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginRight: '8px' }}></i> Códigos Confirmados
          </h3>
          <span className="panel-count">
            {scannedLogs.length} registrado{scannedLogs.length === 1 ? '' : 's'}
          </span>
        </div>
        {scannedLogs.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código Extraído</th>
                  <th>Formato</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {scannedLogs.map((log, i) => (
                  <tr key={`${log.code}-${i}`}>
                    <td style={{ color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#2563eb' }}>{log.code}</td>
                    <td><span className="badge badge-type">{log.format}</span></td>
                    <td className="cell-mono">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '28px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            <i className="fa-solid fa-barcode" style={{ fontSize: '28px', marginBottom: '10px', color: '#cbd5e1', display: 'block' }}></i>
            Aún no se han confirmado códigos. Escanea una guía CODE_128 y presiona &quot;Confirmar y Guardar&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
