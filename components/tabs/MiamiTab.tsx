'use client';

import { Paquete } from '@/types';

interface MiamiTabProps {
  paquetes: Paquete[];
  onNewPackage: () => void;
  onViewPdf: (url: string) => void;
}

export default function MiamiTab({ paquetes, onNewPackage, onViewPdf }: MiamiTabProps) {
  const miamiPackages = paquetes.filter(p => p.ubicacionActual === 'TibCourierMiami');

  return (
    <div>
      <div className="sap-breadcrumb">
        <span>Operaciones y Almacenes</span> / <span>Almacén Miami (USA)</span>
      </div>
      <div className="page-title-bar">
        <div>
          <h1 className="page-title">1. Almacén Tib Courier (Miami, USA)</h1>
          <p className="page-subtitle">Ingesta de compras con Guía WR#, Tipo Empaque e Invoices PDF en Cloudflare R2</p>
        </div>
        <button className="btn btn-primary" onClick={onNewPackage}>
          <i className="fa-solid fa-box-open"></i> Registrar en Miami
        </button>
      </div>

      <div className="card-panel">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Guía WR #</th>
                <th>Tracking USA</th>
                <th>Casillero</th>
                <th>Consignatario</th>
                <th>Descripción</th>
                <th>Peso (Kg)</th>
                <th>FOB ($)</th>
                <th>Factura PDF</th>
              </tr>
            </thead>
            <tbody>
              {miamiPackages.map(pkg => (
                <tr key={pkg.id}>
                  <td className="badge-wr">{pkg.numeroReciboBodega}</td>
                  <td className="cell-fw600">{pkg.trackingUsa}</td>
                  <td className="cell-casillero-blue">{pkg.codigoCasillero}</td>
                  <td>{pkg.nombreConsignatario || 'María Torres'}</td>
                  <td>{pkg.descripcion}</td>
                  <td className="cell-bold">{pkg.pesoKg} Kg</td>
                  <td>${pkg.valorDeclaradoUsd.toFixed(2)} USD</td>
                  <td>
                    {pkg.facturaPdfUrl ? (
                      <button className="badge badge-pdf" style={{ border: 'none' }} onClick={() => onViewPdf(pkg.facturaPdfUrl || '')}>
                        <i className="fa-solid fa-file-pdf"></i> Ver PDF R2
                      </button>
                    ) : (
                      <span className="cell-grey">Sin PDF</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
