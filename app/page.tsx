'use client';

import React, { useState, useEffect } from 'react';
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
  BarChart3,
  IdCard,
  Printer,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Sliders,
  LogOut,
  UserCheck,
  Boxes,
  User
} from 'lucide-react';
import MobileScannerModal from '@/components/scanner/MobileScannerModal';
import { Paquete, Cliente, EmbarqueMaster, OrdenLiquidacion, UsuarioSession } from '@/types';
import { supabase } from '@/lib/supabase/client';

// Initial Mock Datasets for instant rendering fallback
const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'c-1',
    codigoCasillero: 'AMEX-PER-1001',
    nombre: 'María Torres Pérez',
    documentoIdentidad: '72819204',
    telefono: '+51 987654321',
    email: 'mtorres@gmail.com',
    departamento: 'LAMBAYEQUE',
    provincia: 'CHICLAYO',
    distrito: 'CHICLAYO CENTRO',
    direccionEntrega: 'Av. Balta 456, Int. 201',
    transportistaPreferido: 'SHALOM',
    agenciaDestino: 'SHALOM - CHICLAYO CENTRO',
    dniFrontalUrl: 'https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/dnis/72819204_front.jpg',
    dniReversoUrl: 'https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/dnis/72819204_back.jpg',
    creadoEn: '2026-08-01T10:00:00Z'
  },
  {
    id: 'c-2',
    codigoCasillero: 'AMEX-PER-1002',
    nombre: 'Carlos Mendoza Ramos',
    documentoIdentidad: '10452399121',
    telefono: '+51 912345678',
    email: 'cmendoza@outlook.com',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LINCE',
    direccionEntrega: 'Av. Arequipa 1850',
    transportistaPreferido: 'CARRO AMEX',
    agenciaDestino: 'REPARTO DOMICILIO LINCE',
    creadoEn: '2026-08-01T10:15:00Z'
  }
];

const INITIAL_PAQUETES: Paquete[] = [
  {
    id: 'p-101',
    codigoCasillero: 'AMEX-PER-1001',
    numeroReciboBodega: 'WR-000451',
    trackingUsa: '1Z9999999999999',
    tipoEmpaque: 'CAJA',
    numeroFactura: 'INV-8899',
    dniConsignatario: '72819204',
    nombreConsignatario: 'María Torres Pérez',
    descripcion: 'Ropa y calzado deportivo Nike',
    pesoKg: 4.5,
    valorDeclaradoUsd: 149.99,
    ubicacionActual: 'TibCourierMiami',
    metodoEntrega: 'AgenciaProvincia',
    estadoEntrega: 'EnAlmacen',
    facturaPdfUrl: 'https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/facturas/test_conexion.txt',
    creadoEn: '2026-08-01T11:00:00Z'
  },
  {
    id: 'p-102',
    codigoCasillero: 'AMEX-PER-1002',
    numeroReciboBodega: 'WR-000452',
    trackingUsa: '940010000000000000',
    tipoEmpaque: 'SOBRE',
    numeroFactura: 'INV-9021',
    dniConsignatario: '10452399121',
    nombreConsignatario: 'Carlos Mendoza Ramos',
    descripcion: 'Componentes electrónicos e impresos',
    pesoKg: 1.2,
    valorDeclaradoUsd: 85.0,
    ubicacionActual: 'AmexLince',
    metodoEntrega: 'CarroAmexDomicilio',
    estadoEntrega: 'EnRutaCarroAmex',
    facturaPdfUrl: 'https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/facturas/test_conexion.txt',
    creadoEn: '2026-08-01T11:20:00Z'
  }
];

export default function DashboardPage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    clientes: true,
    almacenes: true,
    despacho: true,
    finanzas: true,
    configuracion: true
  });

  // Data States
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [paquetes, setPaquetes] = useState<Paquete[]>(INITIAL_PAQUETES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI Modal States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedLogs, setScannedLogs] = useState<{ code: string; format: string; time: string }[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedDniClient, setSelectedDniClient] = useState<Cliente | null>(null);
  const [selectedThermalPkg, setSelectedThermalPkg] = useState<Paquete | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewPkgModalOpen, setIsNewPkgModalOpen] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // New Client Form State
  const [newClientForm, setNewClientForm] = useState({
    nombre: '',
    documentoIdentidad: '',
    telefono: '',
    email: '',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LINCE',
    direccionEntrega: '',
    transportistaPreferido: 'CARRO AMEX',
    agenciaDestino: 'REPARTO DOMICILIO LINCE'
  });

  // New Package Form State
  const [newPkgForm, setNewPkgForm] = useState({
    codigoCasillero: 'AMEX-PER-1001',
    numeroReciboBodega: `WR-${Math.floor(100000 + Math.random() * 900000)}`,
    trackingUsa: '',
    tipoEmpaque: 'CAJA',
    numeroFactura: '',
    dniConsignatario: '',
    nombreConsignatario: '',
    descripcion: '',
    pesoKg: 1.0,
    valorDeclaradoUsd: 50.0,
    ubicacionActual: 'TibCourierMiami',
    metodoEntrega: 'CarroAmexDomicilio',
    facturaPdfUrl: ''
  });

  // Cargar datos en vivo desde Supabase
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        const { data: dbClientes } = await supabase.from('clientes').select('*');
        if (dbClientes && dbClientes.length > 0) {
          const mapped: Cliente[] = dbClientes.map(c => ({
            id: c.id,
            codigoCasillero: c.codigo_casillero,
            nombre: c.nombre,
            documentoIdentidad: c.documento_identidad,
            telefono: c.telefono || '',
            email: c.email || '',
            departamento: c.departamento || 'LIMA',
            provincia: c.provincia || 'LIMA',
            distrito: c.distrito || 'LINCE',
            direccionEntrega: c.direccion_entrega || '',
            transportistaPreferido: c.transportista_preferido || 'CARRO AMEX',
            agenciaDestino: c.agencia_destino || '',
            dniFrontalUrl: c.dni_frontal_url || '',
            dniReversoUrl: c.dni_reverso_url || '',
            creadoEn: c.creado_en || ''
          }));
          setClientes(mapped);
        }

        const { data: dbPaquetes } = await supabase.from('paquetes').select('*');
        if (dbPaquetes && dbPaquetes.length > 0) {
          const mappedPkgs: Paquete[] = dbPaquetes.map(p => ({
            id: p.id,
            codigoCasillero: p.codigo_casillero,
            numeroReciboBodega: p.numero_recibo_bodega,
            trackingUsa: p.tracking_usa,
            tipoEmpaque: p.tipo_empaque || 'CAJA',
            numeroFactura: p.numero_factura || '',
            dniConsignatario: p.dni_consignatario || '',
            nombreConsignatario: p.nombre_consignatario || '',
            descripcion: p.descripcion || '',
            pesoKg: Number(p.peso_kg || 0),
            valorDeclaradoUsd: Number(p.valor_declarado_usd || 0),
            ubicacionActual: (p.ubicacion_actual as any) || 'TibCourierMiami',
            metodoEntrega: (p.metodo_entrega as any) || 'CarroAmexDomicilio',
            estadoEntrega: (p.estado_entrega as any) || 'EnAlmacen',
            facturaPdfUrl: p.factura_pdf_url || '',
            creadoEn: p.creado_en || ''
          }));
          setPaquetes(mappedPkgs);
        }
      } catch (err) {
        console.log('Using local state fallback for Supabase queries:', err);
      }
    }
    loadDataFromSupabase();
  }, []);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleScanCode = (code: string, format: string) => {
    setScannedLogs(prev => [
      { code, format, time: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  // Crear Cliente en Supabase & Estado Local
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextLockerNum = 1000 + clientes.length + 1;
    const newLockerCode = `AMEX-PER-${nextLockerNum}`;

    const newClienteItem: Cliente = {
      id: `c-${Date.now()}`,
      codigoCasillero: newLockerCode,
      nombre: newClientForm.nombre,
      documentoIdentidad: newClientForm.documentoIdentidad,
      telefono: newClientForm.telefono,
      email: newClientForm.email,
      departamento: newClientForm.departamento,
      provincia: newClientForm.provincia,
      distrito: newClientForm.distrito,
      direccionEntrega: newClientForm.direccionEntrega,
      transportistaPreferido: newClientForm.transportistaPreferido,
      agenciaDestino: newClientForm.agenciaDestino,
      creadoEn: new Date().toISOString()
    };

    setClientes(prev => [newClienteItem, ...prev]);
    setIsNewClientModalOpen(false);

    try {
      await supabase.from('clientes').insert({
        codigo_casillero: newLockerCode,
        nombre: newClientForm.nombre,
        documento_identidad: newClientForm.documentoIdentidad,
        telefono: newClientForm.telefono,
        email: newClientForm.email,
        departamento: newClientForm.departamento,
        provincia: newClientForm.provincia,
        distrito: newClientForm.distrito,
        direccion_entrega: newClientForm.direccionEntrega,
        transportista_preferido: newClientForm.transportistaPreferido,
        agencia_destino: newClientForm.agenciaDestino
      });
    } catch (err) {
      console.error('Error al guardar cliente en Supabase:', err);
    }
  };

  // Analizar Factura PDF con Gemini AI API Route
  const handleInvoiceAiScan = async (file: File) => {
    setIsAnalyzingAi(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Subir primero a Cloudflare R2
      const r2Res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });
      const r2Data = await r2Res.json();
      if (r2Data.url) {
        setNewPkgForm(prev => ({ ...prev, facturaPdfUrl: r2Data.url }));
      }

      // Analizar con Gemini AI
      const aiRes = await fetch('/api/ai/analyze-invoice', {
        method: 'POST',
        body: formData
      });
      const aiData = await aiRes.json();

      if (aiData.tracking_usa) setNewPkgForm(prev => ({ ...prev, trackingUsa: aiData.tracking_usa }));
      if (aiData.invoice_number) setNewPkgForm(prev => ({ ...prev, numeroFactura: aiData.invoice_number }));
      if (aiData.descripcion_mercancia) setNewPkgForm(prev => ({ ...prev, descripcion: aiData.descripcion_mercancia }));
      if (aiData.valor_usd) setNewPkgForm(prev => ({ ...prev, valorDeclaradoUsd: Number(aiData.valor_usd) }));
      if (aiData.peso_kg) setNewPkgForm(prev => ({ ...prev, pesoKg: Number(aiData.peso_kg) }));
    } catch (err) {
      console.error('Error al analizar factura con IA:', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Guardar Paquete WR#
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPkg: Paquete = {
      id: `p-${Date.now()}`,
      codigoCasillero: newPkgForm.codigoCasillero,
      numeroReciboBodega: newPkgForm.numeroReciboBodega,
      trackingUsa: newPkgForm.trackingUsa || '940010000000000000',
      tipoEmpaque: newPkgForm.tipoEmpaque,
      numeroFactura: newPkgForm.numeroFactura,
      dniConsignatario: newPkgForm.dniConsignatario,
      nombreConsignatario: newPkgForm.nombreConsignatario,
      descripcion: newPkgForm.descripcion,
      pesoKg: Number(newPkgForm.pesoKg),
      valorDeclaradoUsd: Number(newPkgForm.valorDeclaradoUsd),
      ubicacionActual: newPkgForm.ubicacionActual as any,
      metodoEntrega: newPkgForm.metodoEntrega as any,
      estadoEntrega: 'EnAlmacen',
      facturaPdfUrl: newPkgForm.facturaPdfUrl,
      creadoEn: new Date().toISOString()
    };

    setPaquetes(prev => [newPkg, ...prev]);
    setIsNewPkgModalOpen(false);

    try {
      await supabase.from('paquetes').insert({
        codigo_casillero: newPkgForm.codigoCasillero,
        numero_recibo_bodega: newPkgForm.numeroReciboBodega,
        tracking_usa: newPkgForm.trackingUsa,
        tipo_empaque: newPkgForm.tipoEmpaque,
        numero_factura: newPkgForm.numeroFactura,
        dni_consignatario: newPkgForm.dniConsignatario,
        nombre_consignatario: newPkgForm.nombreConsignatario,
        descripcion: newPkgForm.descripcion,
        peso_kg: newPkgForm.pesoKg,
        valor_declarado_usd: newPkgForm.valorDeclaradoUsd,
        ubicacion_actual: newPkgForm.ubicacionActual,
        metodo_entrega: newPkgForm.metodoEntrega,
        factura_pdf_url: newPkgForm.facturaPdfUrl
      });
    } catch (err) {
      console.error('Error guardando paquete en Supabase:', err);
    }
  };

  const filteredPaquetes = paquetes.filter(p =>
    p.numeroReciboBodega.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoCasillero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.trackingUsa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* ─── SIDEBAR ACORDEÓN COMPLETO ────────────────────────────────────────── */}
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

          <nav className="space-y-3">
            {/* 1. Panel Principal */}
            <div>
              <button
                onClick={() => toggleGroup('dashboard')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" /> Panel Principal
                </span>
                {openGroups.dashboard ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.dashboard && (
                <div className="mt-1 space-y-1 pl-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" /> Resumen Operativo
                  </button>
                </div>
              )}
            </div>

            {/* 2. Gestión de Clientes */}
            <div>
              <button
                onClick={() => toggleGroup('clientes')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> Gestión de Clientes
                </span>
                {openGroups.clientes ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.clientes && (
                <div className="mt-1 space-y-1 pl-2">
                  <button
                    onClick={() => setActiveTab('clientes')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'clientes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Directorio de Casilleros
                  </button>
                  <button
                    onClick={() => setActiveTab('dni')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'dni' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <IdCard className="w-4 h-4 text-sky-400" /> Expedientes DNI Digital
                  </button>
                </div>
              )}
            </div>

            {/* 3. Operaciones y Almacenes */}
            <div>
              <button
                onClick={() => toggleGroup('almacenes')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-amber-400" /> Operaciones & Hubs
                </span>
                {openGroups.almacenes ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.almacenes && (
                <div className="mt-1 space-y-1 pl-2">
                  <button
                    onClick={() => setActiveTab('miami')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'miami' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Plane className="w-4 h-4 text-sky-400" /> 1. Almacén Miami (USA)
                  </button>
                  <button
                    onClick={() => setActiveTab('tingo')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'tingo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Boxes className="w-4 h-4 text-emerald-400" /> 2. Almacén Tingo María
                  </button>
                  <button
                    onClick={() => setActiveTab('lince')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'lince' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-purple-400" /> 3. Almacén Sede Lince
                  </button>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-300 border border-sky-500/30 hover:border-sky-400 transition-all mt-1"
                  >
                    <span className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-sky-400 animate-pulse" /> 📱 Escáner Móvil QR
                    </span>
                    <span className="bg-sky-500/30 text-sky-200 text-[9px] px-1.5 py-0.5 rounded font-mono">LIVE</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Despacho y Reparto */}
            <div>
              <button
                onClick={() => toggleGroup('despacho')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" /> Despacho y Reparto
                </span>
                {openGroups.despacho ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.despacho && (
                <div className="mt-1 space-y-1 pl-2">
                  <button
                    onClick={() => setActiveTab('despacho')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'despacho' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4" /> Reparto Carro Amex & Entregas
                  </button>
                  <button
                    onClick={() => setActiveTab('rotulos')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'rotulos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Printer className="w-4 h-4 text-emerald-400" /> Rótulos Térmicos Agencias
                  </button>
                </div>
              )}
            </div>

            {/* 5. Liquidaciones y Finanzas */}
            <div>
              <button
                onClick={() => toggleGroup('finanzas')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Liquidaciones & Cobranzas
                </span>
                {openGroups.finanzas ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openGroups.finanzas && (
                <div className="mt-1 space-y-1 pl-2">
                  <button
                    onClick={() => setActiveTab('liquidaciones')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'liquidaciones' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Cobranzas PEN / USD
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Supabase PostgreSQL + R2</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
      </aside>

      {/* ─── WORKSPACE PRINCIPAL ─────────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header Bar Superior */}
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
                placeholder="Buscar recibo WR#, casillero..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 w-64"
              />
            </div>
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" /> Nuevo Casillero
            </button>
            <button
              onClick={() => setIsNewPkgModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <PackageIcon className="w-4 h-4" /> Registrar Paquete
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD RESUMEN */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Casilleros Activos</span>
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">{clientes.length}</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12% este mes
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Hub 1: Miami (USA)</span>
                  <Plane className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {paquetes.filter(p => p.ubicacionActual === 'TibCourierMiami').length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Paquetes en preparación</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">En Ruta (Carro Amex)</span>
                  <Truck className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-purple-400">
                  {paquetes.filter(p => p.estadoEntrega === 'EnRutaCarroAmex').length}
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

            {/* Inventario de Paquetes en Supabase / Cloudflare R2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <PackageIcon className="w-5 h-5 text-sky-400" /> Inventario de Paquetes en Base de Datos Supabase (`paquetes`)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Almacenamiento de facturas PDF en Cloudflare R2 (`FOLDER AMEX`)</p>
                </div>
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar XLSX
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Recibo Bodega WR#</th>
                      <th className="p-3">Tracking USA</th>
                      <th className="p-3">Casillero</th>
                      <th className="p-3">Consignatario SUNAT</th>
                      <th className="p-3">Peso</th>
                      <th className="p-3">FOB ($)</th>
                      <th className="p-3">Ubicación</th>
                      <th className="p-3 text-center">Rótulo Térmico</th>
                      <th className="p-3 text-center">Factura PDF (R2)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredPaquetes.map(pkg => (
                      <tr key={pkg.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-sky-400">{pkg.numeroReciboBodega}</td>
                        <td className="p-3 font-semibold text-white">{pkg.trackingUsa}</td>
                        <td className="p-3 font-mono text-purple-300 font-bold">{pkg.codigoCasillero}</td>
                        <td className="p-3">{pkg.nombreConsignatario || 'Sin asignar'}</td>
                        <td className="p-3 font-semibold">{pkg.pesoKg} Kg</td>
                        <td className="p-3">${pkg.valorDeclaradoUsd.toFixed(2)} USD</td>
                        <td className="p-3">
                          <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-700">
                            {pkg.ubicacionActual}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedThermalPkg(pkg)}
                            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" /> Imprimir
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          {pkg.facturaPdfUrl ? (
                            <button
                              onClick={() => setSelectedPdfUrl(pkg.facturaPdfUrl || null)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5"
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
          </div>
        )}

        {/* TAB 2: DIRECTORIO DE CASILLEROS (CLIENTES) */}
        {activeTab === 'clientes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Directorio Oficial de Casilleros (`AMEX-PER-XXXX`)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Base de datos de importadores en Supabase PostgreSQL</p>
              </div>
              <button
                onClick={() => setIsNewClientModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Registrar Nuevo Casillero
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Código Casillero</th>
                    <th className="p-3">Cliente Importador</th>
                    <th className="p-3">DNI / RUC</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Ubigeo Entrega</th>
                    <th className="p-3">Transportista Preferido</th>
                    <th className="p-3 text-center">Expediente DNI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {clientes.map(cli => (
                    <tr key={cli.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-purple-300">{cli.codigoCasillero}</td>
                      <td className="p-3 font-semibold text-white">{cli.nombre}</td>
                      <td className="p-3 font-mono text-slate-300">{cli.documentoIdentidad}</td>
                      <td className="p-3">{cli.telefono}</td>
                      <td className="p-3">{cli.departamento} / {cli.provincia} / {cli.distrito}</td>
                      <td className="p-3 font-semibold text-sky-400">{cli.transportistaPreferido}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedDniClient(cli)}
                          className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <IdCard className="w-3.5 h-3.5" /> Ver DNI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EXPEDIENTES DNI DIGITAL */}
        {activeTab === 'dni' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-4">
              <IdCard className="w-5 h-5 text-sky-400" /> Expedientes Digitales DNI (Cloudflare R2 Storage)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Imágenes guardadas de forma segura en `FOLDER AMEX/dnis` para trámites aduaneros SUNAT
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clientes.map(cli => (
                <div key={cli.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-purple-300">{cli.codigoCasillero}</span>
                      <h4 className="font-bold text-white text-sm">{cli.nombre}</h4>
                    </div>
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">DNI: {cli.documentoIdentidad}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">DNI Frontal</span>
                      {cli.dniFrontalUrl ? (
                        <img src={cli.dniFrontalUrl} alt="DNI Frontal" className="w-full h-24 object-cover rounded border border-slate-700" />
                      ) : (
                        <div className="h-24 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs">Sin Foto</div>
                      )}
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">DNI Reverso</span>
                      {cli.dniReversoUrl ? (
                        <img src={cli.dniReversoUrl} alt="DNI Reverso" className="w-full h-24 object-cover rounded border border-slate-700" />
                      ) : (
                        <div className="h-24 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs">Sin Foto</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ALMACÉN MIAMI */}
        {activeTab === 'miami' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Plane className="w-5 h-5 text-sky-400" /> 1. Almacén Hub Miami (USA)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Recepción de bodega WR# e ingreso de facturas mediante Gemini AI</p>
              </div>
              <button
                onClick={() => setIsNewPkgModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Ingresar Paquete WR#
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Recibo Bodega WR#</th>
                    <th className="p-3">Tracking USA</th>
                    <th className="p-3">Casillero</th>
                    <th className="p-3">Descripción Mercancía</th>
                    <th className="p-3">Peso</th>
                    <th className="p-3">FOB ($)</th>
                    <th className="p-3 text-center">Factura PDF (R2)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paquetes.filter(p => p.ubicacionActual === 'TibCourierMiami').map(pkg => (
                    <tr key={pkg.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-400">{pkg.numeroReciboBodega}</td>
                      <td className="p-3 font-semibold text-white">{pkg.trackingUsa}</td>
                      <td className="p-3 font-mono text-purple-300 font-bold">{pkg.codigoCasillero}</td>
                      <td className="p-3">{pkg.descripcion}</td>
                      <td className="p-3 font-semibold">{pkg.pesoKg} Kg</td>
                      <td className="p-3">${pkg.valorDeclaradoUsd.toFixed(2)} USD</td>
                      <td className="p-3 text-center">
                        {pkg.facturaPdfUrl ? (
                          <button
                            onClick={() => setSelectedPdfUrl(pkg.facturaPdfUrl || null)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> Ver PDF R2
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
        )}

        {/* TAB 5: REPARTO CARRO AMEX */}
        {activeTab === 'despacho' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-purple-400" /> Reparto Carro Amex & Entregas a Domicilio
            </h3>
            <p className="text-xs text-slate-400 mb-6">Unidades de reparto programadas para entrega en Lima y provincias</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Recibo Bodega WR#</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Casillero</th>
                    <th className="p-3">Método Entrega</th>
                    <th className="p-3">Estado Reparto</th>
                    <th className="p-3 text-center">Imprimir Rótulo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paquetes.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-400">{pkg.numeroReciboBodega}</td>
                      <td className="p-3 font-semibold text-white">{pkg.nombreConsignatario || 'María Torres'}</td>
                      <td className="p-3 font-mono text-purple-300 font-bold">{pkg.codigoCasillero}</td>
                      <td className="p-3 font-semibold text-purple-400">{pkg.metodoEntrega}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30">
                          {pkg.estadoEntrega}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedThermalPkg(pkg)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Rótulo Térmico
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: LIQUIDACIONES & COBRANZAS */}
        {activeTab === 'liquidaciones' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Liquidaciones Aduaneras & Cobranzas (PEN / USD)
            </h3>
            <p className="text-xs text-slate-400 mb-6">Cálculo automatizado de fletes por kilo + cargo administrativo de $5.00 USD</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Casillero</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Recibo WR#</th>
                    <th className="p-3">Flete ($)</th>
                    <th className="p-3">Admin Fee ($)</th>
                    <th className="p-3">Total USD</th>
                    <th className="p-3">Total Soles (S/)</th>
                    <th className="p-3">Estado Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paquetes.map(pkg => {
                    const flete = pkg.pesoKg * 12.0;
                    const admin = 5.0;
                    const totalUsd = flete + admin;
                    const totalPen = totalUsd * 3.80;
                    return (
                      <tr key={pkg.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-purple-300">{pkg.codigoCasillero}</td>
                        <td className="p-3 font-semibold text-white">{pkg.nombreConsignatario || 'María Torres'}</td>
                        <td className="p-3 font-mono text-sky-400">{pkg.numeroReciboBodega}</td>
                        <td className="p-3">${flete.toFixed(2)}</td>
                        <td className="p-3">${admin.toFixed(2)}</td>
                        <td className="p-3 font-bold text-white">${totalUsd.toFixed(2)} USD</td>
                        <td className="p-3 font-bold text-emerald-400">S/ {totalPen.toFixed(2)}</td>
                        <td className="p-3">
                          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30">
                            PAGADO YAPE / BCP
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: REGISTRAR NUEVO CASILLERO */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" /> Registrar Nuevo Casillero AMEX
              </h3>
              <button onClick={() => setIsNewClientModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez Morales"
                  value={newClientForm.nombre}
                  onChange={e => setNewClientForm({ ...newClientForm, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">DNI / RUC</label>
                  <input
                    type="text"
                    required
                    placeholder="72819204"
                    value={newClientForm.documentoIdentidad}
                    onChange={e => setNewClientForm({ ...newClientForm, documentoIdentidad: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+51 987654321"
                    value={newClientForm.telefono}
                    onChange={e => setNewClientForm({ ...newClientForm, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  placeholder="Av. Arequipa 1850"
                  value={newClientForm.direccionEntrega}
                  onChange={e => setNewClientForm({ ...newClientForm, direccionEntrega: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Guardar Casillero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR PAQUETE WR# CON IA GEMINI */}
      {isNewPkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-white">
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-sky-400" /> Ingresar Nuevo Paquete WR# (Hub Miami)
              </h3>
              <button onClick={() => setIsNewPkgModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="p-6 space-y-4 text-xs">
              {/* Escáner de Factura Gemini AI */}
              <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Autocompletar con IA Gemini 2.0 (Factura PDF)
                  </span>
                  {isAnalyzingAi && <span className="text-emerald-400 animate-pulse text-[10px]">Analizando Factura...</span>}
                </div>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleInvoiceAiScan(file);
                  }}
                  className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Recibo Bodega WR#</label>
                  <input
                    type="text"
                    required
                    value={newPkgForm.numeroReciboBodega}
                    onChange={e => setNewPkgForm({ ...newPkgForm, numeroReciboBodega: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Casillero Asignado</label>
                  <select
                    value={newPkgForm.codigoCasillero}
                    onChange={e => setNewPkgForm({ ...newPkgForm, codigoCasillero: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {clientes.map(cli => (
                      <option key={cli.id} value={cli.codigoCasillero}>
                        {cli.codigoCasillero} - {cli.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tracking USA</label>
                <input
                  type="text"
                  required
                  placeholder="1Z9999999999999"
                  value={newPkgForm.trackingUsa}
                  onChange={e => setNewPkgForm({ ...newPkgForm, trackingUsa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Peso (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPkgForm.pesoKg}
                    onChange={e => setNewPkgForm({ ...newPkgForm, pesoKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Valor Declarado USD ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPkgForm.valorDeclaradoUsd}
                    onChange={e => setNewPkgForm({ ...newPkgForm, valorDeclaradoUsd: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewPkgModalOpen(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Guardar Paquete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RÓTULO TÉRMICO IMPRIMIBLE (@media print) */}
      {selectedThermalPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-purple-400" /> Vista Previa de Rótulo Térmico Imprimible
              </h3>
              <button onClick={() => setSelectedThermalPkg(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Térmico en Blanco y Negro */}
            <div className="bg-white text-black p-6 rounded-xl border-4 border-black font-sans text-xs space-y-3 shadow-2xl">
              <div className="border-b-2 border-black pb-2 flex justify-between items-center">
                <span className="font-extrabold text-lg tracking-wider">AMEX COURIER PERÚ</span>
                <span className="bg-black text-white px-2 py-0.5 font-bold rounded text-xs">{selectedThermalPkg.codigoCasillero}</span>
              </div>

              <div className="bg-black text-white text-center py-2 font-extrabold text-base rounded uppercase">
                {selectedThermalPkg.metodoEntrega === 'CarroAmexDomicilio' ? 'REPARTO DOMICILIO LINCE' : 'AGENCIA SHALOM / OLVA'}
              </div>

              <div>
                <div className="font-bold text-[10px] uppercase text-gray-600">CONSIGNATARIO:</div>
                <div className="font-bold text-sm">{selectedThermalPkg.nombreConsignatario || 'María Torres Pérez'}</div>
                <div className="text-xs">DNI: {selectedThermalPkg.dniConsignatario || '72819204'}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-b border-gray-400 py-2">
                <div>
                  <span className="font-bold block">WR RECIBO:</span>
                  <span className="font-mono font-extrabold text-sm">{selectedThermalPkg.numeroReciboBodega}</span>
                </div>
                <div>
                  <span className="font-bold block">PESO:</span>
                  <span className="font-extrabold text-sm">{selectedThermalPkg.pesoKg} Kg</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t-2 border-dashed border-black">
                <div className="font-mono font-extrabold text-base tracking-widest">{selectedThermalPkg.trackingUsa}</div>
                <div className="text-[10px] text-gray-500 mt-1">CÓDIGO DE BARRAS DE SEGURIDAD AMEX</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedThermalPkg(null)}
                className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Printer className="w-4 h-4" /> Imprimir en Ticketera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VISOR PDF DE FACTURA (CLOUD FLARE R2) */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-sm">Visor Factura PDF (Cloudflare R2 Storage HTTPS)</h3>
              </div>
              <button onClick={() => setSelectedPdfUrl(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-800 relative">
              <iframe src={selectedPdfUrl} className="w-full h-full border-none" title="Visor PDF R2"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: VISOR EXPEDIENTE DNI */}
      {selectedDniClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-purple-300 font-bold">{selectedDniClient.codigoCasillero}</span>
                <h3 className="font-bold text-base">{selectedDniClient.nombre} - DNI {selectedDniClient.documentoIdentidad}</h3>
              </div>
              <button onClick={() => setSelectedDniClient(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block mb-2">DNI Frontal (SUNAT)</span>
                {selectedDniClient.dniFrontalUrl ? (
                  <img src={selectedDniClient.dniFrontalUrl} alt="DNI Frontal" className="w-full h-40 object-cover rounded-lg border border-slate-700" />
                ) : (
                  <div className="h-40 bg-slate-900 flex flex-col items-center justify-center text-slate-500 text-xs">Sin archivo guardado</div>
                )}
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block mb-2">DNI Reverso (SUNAT)</span>
                {selectedDniClient.dniReversoUrl ? (
                  <img src={selectedDniClient.dniReversoUrl} alt="DNI Reverso" className="w-full h-40 object-cover rounded-lg border border-slate-700" />
                ) : (
                  <div className="h-40 bg-slate-900 flex flex-col items-center justify-center text-slate-500 text-xs">Sin archivo guardado</div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedDniClient(null)}
                className="bg-slate-800 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ESCÁNER MÓVIL EN TIEMPO REAL */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
      />
    </div>
  );
}
