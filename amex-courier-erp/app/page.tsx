'use client';

import React, { useState } from 'react';
import {
  Plane,
  Package as PackageIcon,
  Warehouse,
  QrCode,
  Truck,
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  Lock,
  Sparkles,
  BarChart3
} from 'lucide-react';
import MobileScannerModal from '@/components/scanner/MobileScannerModal';
import { Package, Customer } from '@/types';

// Mock Dataset inicial para demostración de la interfaz ERP
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    lockerCode: 'AMEX-PER-1001',
    name: 'María Torres Pérez',
    taxId: '72819204',
    phone: '+51 987654321',
    email: 'mtorres@gmail.com',
    department: 'LAMBAYEQUE',
    province: 'CHICLAYO',
    district: 'CHICLAYO CENTRO',
    deliveryAddress: 'Av. Balta 456, Int. 201',
    preferredCarrier: 'SHALOM',
    destinationAgency: 'SHALOM - CHICLAYO CENTRO',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'c-2',
    lockerCode: 'AMEX-PER-1002',
    name: 'Carlos Mendoza Ramos',
    taxId: '10452399121',
    phone: '+51 912345678',
    email: 'cmendoza@outlook.com',
    department: 'LIMA',
    province: 'LIMA',
    district: 'LINCE',
    deliveryAddress: 'Av. Arequipa 1850',
    preferredCarrier: 'CARRO AMEX',
    destinationAgency: 'REPARTO DOMICILIO LINCE',
    createdAt: '2026-08-01T10:15:00Z'
  }
];

const MOCK_PACKAGES: Package[] = [
  {
    id: 'p-101',
    lockerCode: 'AMEX-PER-1001',
    warehouseReceiptNumber: 'WR-000451',
    trackingUsa: '1Z9999999999999',
    packageType: 'CAJA',
    invoiceNumber: 'INV-8899',
    customsDni: '72819204',
    customsConsigneeName: 'María Torres Pérez',
    description: 'Ropa y calzado deportivo Nike',
    weightKg: 4.5,
    declaredValueUsd: 149.99,
    currentLocation: 'TibCourierMiami',
    deliveryMethod: 'NationalAgency',
    deliveryStatus: 'InWarehouse',
    invoicePdfUrl: 'https://pub-r2.amexcourier.pe/invoices/INV-8899.pdf',
    createdAt: '2026-08-01T11:00:00Z'
  },
  {
    id: 'p-102',
    lockerCode: 'AMEX-PER-1002',
    warehouseReceiptNumber: 'WR-000452',
    trackingUsa: '940010000000000000',
    packageType: 'SOBRE',
    invoiceNumber: 'INV-9021',
    customsDni: '10452399121',
    customsConsigneeName: 'Carlos Mendoza Ramos',
    description: 'Componentes electrónicos e impresos',
    weightKg: 1.2,
    declaredValueUsd: 85.0,
    currentLocation: 'AmexLince',
    deliveryMethod: 'AmexVehicleDelivery',
    deliveryStatus: 'InTransitAmexVehicle',
    invoicePdfUrl: 'https://pub-r2.amexcourier.pe/invoices/INV-9021.pdf',
    createdAt: '2026-08-01T11:20:00Z'
  }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedLogs, setScannedLogs] = useState<{ code: string; format: string; time: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  const handleScanCode = (code: string, format: string) => {
    const newLog = {
      code,
      format,
      time: new Date().toLocaleTimeString()
    };
    setScannedLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar Acordeón Moderno */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight">AMEX Courier</h1>
              <p className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider">ERP Logístico v2.0</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Panel Operativo
            </button>

            <button
              onClick={() => setActiveTab('clientes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'clientes'
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" /> Casilleros e Importadores
            </button>

            <button
              onClick={() => setActiveTab('miami')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'miami'
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Warehouse className="w-4 h-4 text-sky-400" /> Almacén Miami (USA)
            </button>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-300 border border-sky-500/30 hover:border-sky-400 transition-all mt-2"
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-4 h-4 text-sky-400 animate-pulse" /> 📱 Escáner Móvil QR
              </div>
              <span className="bg-sky-500/30 text-sky-200 text-[10px] px-2 py-0.5 rounded-full font-bold">En Vivo</span>
            </button>

            <button
              onClick={() => setActiveTab('despacho')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'despacho'
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Truck className="w-4 h-4" /> Reparto Carro Amex & Entregas
            </button>

            <button
              onClick={() => setActiveTab('liquidaciones')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'liquidaciones'
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" /> Liquidaciones & Cobranzas
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Stack Next.js + Cloudflare R2</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
      </aside>

      {/* Workspace Principal */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Top bar header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>AMEX ERP</span> / <span className="text-sky-400 font-semibold capitalize">{activeTab}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Plataforma Logística Perú (Lince Hub)</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar WR#, casillero, tracking..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 w-64"
              />
            </div>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/20"
            >
              <QrCode className="w-4 h-4" /> Escanear Código
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">Casilleros Activos</span>
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{MOCK_CUSTOMERS.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% este mes
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">Hub 1: Miami (USA)</span>
              <PackageIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {MOCK_PACKAGES.filter(p => p.currentLocation === 'TibCourierMiami').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Paquetes en preparación</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">En Ruta (Carro Amex)</span>
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              {MOCK_PACKAGES.filter(p => p.deliveryStatus === 'InTransitAmexVehicle').length}
            </div>
            <div className="text-[11px] text-purple-300/80 mt-1">Entregas a domicilio</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">Utilidad Neta Soles</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">S/ 4,850.00</div>
            <div className="text-[11px] text-emerald-300 mt-1">Margen operativo Lince</div>
          </div>
        </div>

        {/* Módulo Principal de Paquetes y Visor Cloudflare R2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-sky-400" /> Inventario de Paquetes en Miami & Almacén Lince
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Archivos PDF servidos desde Cloudflare R2 Storage (S3 API)
              </p>
            </div>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar XLSX
            </button>
          </div>

          {/* Tabla de Paquetes */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Guía WR#</th>
                  <th className="p-3">Tracking USA</th>
                  <th className="p-3">Casillero</th>
                  <th className="p-3">Consignatario SUNAT</th>
                  <th className="p-3">Peso</th>
                  <th className="p-3">FOB ($)</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3 text-center">Factura PDF (Cloudflare R2)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {MOCK_PACKAGES.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-400">{pkg.warehouseReceiptNumber}</td>
                    <td className="p-3 font-semibold text-white">{pkg.trackingUsa}</td>
                    <td className="p-3 font-mono text-purple-300 font-bold">{pkg.lockerCode}</td>
                    <td className="p-3">{pkg.customsConsigneeName}</td>
                    <td className="p-3 font-semibold">{pkg.weightKg} Kg</td>
                    <td className="p-3">${pkg.declaredValueUsd.toFixed(2)} USD</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-700">
                        {pkg.currentLocation}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {pkg.invoicePdfUrl ? (
                        <button
                          onClick={() => setSelectedPdfUrl(pkg.invoicePdfUrl || null)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" /> Ver PDF R2
                        </button>
                      ) : (
                        <span className="text-slate-500">Sin PDF</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial de Lecturas del Escáner Móvil */}
        {scannedLogs.length > 0 && (
          <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-base text-sky-400 flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5" /> Historial de Lecturas de la Sesión Móvil
            </h3>
            <div className="space-y-2">
              {scannedLogs.map((log, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="font-mono font-bold text-sky-400">{log.code}</span>
                  </div>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">{log.format}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Visor de PDF servido desde Cloudflare R2 */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-sm">Visor PDF (Cloudflare R2 HTTPS Storage)</h3>
              </div>
              <button
                onClick={() => setSelectedPdfUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-slate-800 relative">
              <iframe src={selectedPdfUrl} className="w-full h-full border-none" title="Visor PDF R2"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escáner Móvil QR */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
      />
    </div>
  );
}
