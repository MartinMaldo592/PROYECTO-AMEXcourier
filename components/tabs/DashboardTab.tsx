'use client';

import { Cliente, Paquete } from '@/types';

interface DashboardTabProps {
  clientes: Cliente[];
  paquetes: Paquete[];
  filteredPaquetes: Paquete[];
  onNewClient: () => void;
  onNewPackage: () => void;
  onPrintLabel: (pkg: Paquete) => void;
  onViewPdf: (url: string) => void;
}

export default function DashboardTab({ clientes, paquetes, filteredPaquetes, onNewClient, onNewPackage, onPrintLabel, onViewPdf }: DashboardTabProps) {
  return (
    <div>
      <div className="sap-breadcrumb">
        <span>Panel Principal</span> / <span>Resumen & Métricas</span>
      </div>
      <div className="page-title-bar">
        <div>
          <h1 className="page-title">Plataforma Logística Perú (Lince Hub)</h1>
          <p className="page-subtitle">Monitoreo en tiempo real de operaciones, bodega Miami y cobranzas</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={onNewClient}>
            <i className="fa-solid fa-user-plus"></i> Registrar Casillero
          </button>
          <button className="btn btn-secondary" onClick={onNewPackage}>
            <i className="fa-solid fa-box-open"></i> Ingesta Paquete Miami
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Casilleros Activos</h4>
            <div className="kpi-value">{clientes.length}</div>
          </div>
          <div className="kpi-icon blue"><i className="fa-solid fa-id-card"></i></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Hub 1: Miami (USA)</h4>
            <div className="kpi-value">{paquetes.filter(p => p.ubicacionActual === 'TibCourierMiami').length}</div>
          </div>
          <div className="kpi-icon blue"><i className="fa-solid fa-boxes-packing"></i></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>En Ruta (Carro Amex)</h4>
            <div className="kpi-value" style={{ color: '#7c3aed' }}>{paquetes.filter(p => p.estadoEntrega === 'EnRutaCarroAmex').length}</div>
          </div>
          <div className="kpi-icon purple"><i className="fa-solid fa-car-side"></i></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Utilidad Neta Soles</h4>
            <div className="kpi-value" style={{ color: '#059669' }}>S/ 4,850.00</div>
          </div>
          <div className="kpi-icon green"><i className="fa-solid fa-sack-dollar"></i></div>
        </div>
      </div>

      {/* Inventario de Paquetes */}
      <div className="card-panel">
        <div className="panel-title">
          <h3>Inventario de Paquetes en Base de Datos Supabase (`paquetes`)</h3>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Guía WR #</th>
                <th>Tracking USA</th>
                <th>Casillero</th>
                <th>Consignatario SUNAT</th>
                <th>Peso (Kg)</th>
                <th>FOB ($)</th>
                <th>Ubicación Actual</th>
                <th className="cell-center">Rótulo Térmico</th>
                <th className="cell-center">Factura PDF (Cloudflare R2)</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaquetes.map(pkg => (
                <tr key={pkg.id}>
                  <td className="badge-wr">{pkg.numeroReciboBodega}</td>
                  <td className="cell-fw600">{pkg.trackingUsa}</td>
                  <td className="cell-casillero">{pkg.codigoCasillero}</td>
                  <td>{pkg.nombreConsignatario || 'María Torres Pérez'}</td>
                  <td className="cell-bold">{pkg.pesoKg} Kg</td>
                  <td>${pkg.valorDeclaradoUsd.toFixed(2)} USD</td>
                  <td><span className="badge badge-type">{pkg.ubicacionActual}</span></td>
                  <td className="cell-center">
                    <button className="btn btn-car" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => onPrintLabel(pkg)}>
                      <i className="fa-solid fa-print"></i> Imprimir
                    </button>
                  </td>
                  <td className="cell-center">
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
