'use client';

import React, { useState, useEffect } from 'react';
import MobileScannerModal from '@/components/scanner/MobileScannerModal';
import { Paquete, Cliente } from '@/types';
import { supabase } from '@/lib/supabase/client';

const DNI_FRONT_URL = "https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/dnis/Dni_anverso.jpeg";
const DNI_BACK_URL = "https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/dnis/Dni_reverso.jpeg";
const ORDER_PDF_URL = "https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/facturas/Order_Details.pdf";

const NOMBRES = ["María", "Carlos", "Juan", "Ana", "Luis", "Rosa", "Pedro", "Lucía", "Diego", "Carmen", "Jorge", "Patricia", "Fernando", "Sofía", "Gabriel", "Elena", "Ronaldo", "Valeria", "Mateo", "Camila"];
const APELLIDOS = ["Torres", "Pérez", "Mendoza", "Ramos", "García", "Flores", "Rodríguez", "Sánchez", "Gómez", "Díaz", "Vásquez", "Castro", "Romero", "Alvarez", "Gutierrez", "Navarro", "Salazar", "Castillo", "Vargas", "Guerrero"];
const DEPARTAMENTOS = ["LIMA", "LAMBAYEQUE", "LA LIBERTAD", "AREQUIPA", "CUSCO", "PIURA", "JUNIN", "ICA", "ANCASH", "HUANUCO"];
const PROVINCIAS = ["LIMA", "CHICLAYO", "TRUJILLO", "AREQUIPA", "CUSCO", "PIURA", "HUANCAYO", "ICA", "SANTA", "HUANUCO"];
const DISTRITOS = ["LINCE", "MIRAFLORES", "CHICLAYO CENTRO", "VICTOR LARCO", "YANAHUARA", "SAN ISIDRO", "EL TAMBO", "SURCO", "NUEVO CHIMBOTE", "AMARILIS"];
const CARRIERS = ["CARRO AMEX", "SHALOM", "OLVA COURIER", "MARVISUR", "CARRO AMEX"];
const PRODUCTOS = [
  "Ropa y calzado deportivo Nike", "Lote de componentes electrónicos", "Laptop Dell XPS 15 reacondicionada", "Repuestos automotrices Toyota", "Cosméticos y cremas hidratantes",
  "Smartwatch Apple Watch Series 9", "Zapatillas Adidas Ultraboost", "Suplementos alimenticios Whey Gold", "Juguetes educativos e impresos", "Accesorios fotográficos Sony Alpha",
  "Ropa de bebé y textiles pima", "Audífonos Inalámbricos Bose QC45", "Herramientas manuales DeWalt", "Teclados mecánicos gaming Logitech", "Instrumentos musicales y pedales guitar"
];

const INITIAL_CLIENTES: Cliente[] = Array.from({ length: 105 }, (_, i) => {
  const idx = i + 1;
  const nombre = `${NOMBRES[i % NOMBRES.length]} ${APELLIDOS[i % APELLIDOS.length]} ${APELLIDOS[(i + 3) % APELLIDOS.length]}`;
  const carrier = CARRIERS[i % CARRIERS.length];
  const dist = DISTRITOS[i % DISTRITOS.length];
  return {
    id: `c-${idx}`,
    codigoCasillero: `AMEX-PER-${1000 + idx}`,
    nombre: nombre,
    documentoIdentidad: `${70000000 + idx * 37}`,
    telefono: `+51 98${Math.floor(100000 + (idx * 999) % 899999)}`,
    email: `${NOMBRES[i % NOMBRES.length].toLowerCase()}.${APELLIDOS[i % APELLIDOS.length].toLowerCase()}${idx}@gmail.com`,
    departamento: DEPARTAMENTOS[i % DEPARTAMENTOS.length],
    provincia: PROVINCIAS[i % PROVINCIAS.length],
    distrito: dist,
    direccionEntrega: `Av. ${APELLIDOS[i % APELLIDOS.length]} #${100 + idx * 2}, ${dist}`,
    transportistaPreferido: carrier,
    agenciaDestino: carrier === 'CARRO AMEX' ? 'REPARTO DOMICILIO LINCE' : `${carrier} - ${dist}`,
    dniFrontalUrl: DNI_FRONT_URL,
    dniReversoUrl: DNI_BACK_URL,
    creadoEn: '2026-08-01T10:00:00Z'
  };
});

const INITIAL_PAQUETES: Paquete[] = Array.from({ length: 105 }, (_, i) => {
  const idx = i + 1;
  const cli = INITIAL_CLIENTES[i];
  const ubicacion = i % 3 === 0 ? 'TibCourierMiami' : (i % 3 === 1 ? 'TibTingoMaria' : 'AmexLince');
  const estado = i % 2 === 0 ? 'EnAlmacen' : 'EnRutaCarroAmex';
  return {
    id: `p-${idx}`,
    codigoCasillero: cli.codigoCasillero,
    numeroReciboBodega: `WR-000${100 + idx}`,
    trackingUsa: `1Z999${Math.floor(100000000 + (idx * 8888) % 899999999)}`,
    tipoEmpaque: i % 4 === 0 ? 'SOBRE' : 'CAJA',
    numeroFactura: `INV-${9000 + idx}`,
    dniConsignatario: cli.documentoIdentidad,
    nombreConsignatario: cli.nombre,
    descripcion: PRODUCTOS[i % PRODUCTOS.length],
    pesoKg: Number((0.5 + (idx % 10) * 0.9).toFixed(1)),
    valorDeclaradoUsd: Number((25.0 + (idx % 15) * 11.5).toFixed(2)),
    ubicacionActual: ubicacion as any,
    metodoEntrega: cli.transportistaPreferido === 'CARRO AMEX' ? 'CarroAmexDomicilio' : 'AgenciaProvincia',
    estadoEntrega: estado as any,
    facturaPdfUrl: ORDER_PDF_URL,
    creadoEn: '2026-08-01T11:00:00Z'
  };
});

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    clientes: false,
    almacenes: false,
    despacho: false,
    finanzas: false,
    configuracion: false
  });

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState({ usuario: 'admin', password: 'admin123' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ nombre: string; rol: string } | null>({
    nombre: 'Administrador General AMEX',
    rol: 'admin'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('amex_user_logged');
      if (savedUser) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const { data: dbUser, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', loginUser.usuario)
        .eq('password_hash', loginUser.password)
        .single();

      if (dbUser) {
        setCurrentUser({ nombre: dbUser.nombre_completo, rol: dbUser.rol });
        setIsLoggedIn(true);
        localStorage.setItem('amex_user_logged', JSON.stringify({ nombre: dbUser.nombre_completo, rol: dbUser.rol }));
        return;
      }
    } catch {
      // Fallback
    }

    if (loginUser.usuario === 'admin' && loginUser.password === 'admin123') {
      setCurrentUser({ nombre: 'Administrador General AMEX', rol: 'admin' });
      setIsLoggedIn(true);
      localStorage.setItem('amex_user_logged', JSON.stringify({ nombre: 'Administrador General AMEX', rol: 'admin' }));
    } else {
      setLoginError('Credenciales incorrectas. Verifique su usuario y contraseña.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('amex_user_logged');
  };

  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [paquetes, setPaquetes] = useState<Paquete[]>(INITIAL_PAQUETES);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedLogs, setScannedLogs] = useState<{ code: string; format: string; time: string }[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedDniClient, setSelectedDniClient] = useState<Cliente | null>(null);
  const [selectedThermalPkg, setSelectedThermalPkg] = useState<Paquete | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewPkgModalOpen, setIsNewPkgModalOpen] = useState(false);

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

  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        const { data: dbClientes } = await supabase.from('clientes').select('*');
        if (dbClientes && dbClientes.length > 0) {
          setClientes(dbClientes.map(c => ({
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
          })));
        }

        const { data: dbPaquetes } = await supabase.from('paquetes').select('*');
        if (dbPaquetes && dbPaquetes.length > 0) {
          setPaquetes(dbPaquetes.map(p => ({
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
          })));
        }
      } catch (err) {
        console.log('Supabase sync active.');
      }
    }
    fetchSupabaseData();
  }, []);

  const toggleModuleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLockerCode = `AMEX-PER-${1000 + clientes.length + 1}`;
    const newClient: Cliente = {
      id: `c-${Date.now()}`,
      codigoCasillero: newLockerCode,
      ...newClientForm,
      creadoEn: new Date().toISOString()
    };
    setClientes([newClient, ...clientes]);
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
      console.error('Error insert cliente:', err);
    }
  };

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
    setPaquetes([newPkg, ...paquetes]);
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
      console.error('Error insert paquete:', err);
    }
  };

  const handleScanCode = (code: string, format: string) => {
    setScannedLogs(prev => [{ code, format, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const handleConfirmScan = (code: string, format: string) => {
    setScannedLogs(prev => [{ code, format, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const filteredPaquetes = paquetes.filter(p =>
    p.numeroReciboBodega.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoCasillero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.trackingUsa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 9999 }}>
        <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {/* Brand Header */}
          <div style={{ backgroundColor: '#020617', padding: '28px 24px', textAlign: 'center', borderBottom: '2px solid #2563eb' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="sap-logo-badge" style={{ fontSize: '14px', padding: '6px 12px' }}>ERP</span>
              <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, margin: 0 }}>AMEX COURIER</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Sistema Logístico Integrado de Casilleros</p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleLoginSubmit} style={{ padding: '28px 24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '18px', textAlign: 'center' }}>Iniciar Sesión en el Sistema</h3>

            {loginError && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '16px', fontWeight: 600 }}>
                {loginError}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Usuario / Email</label>
              <input
                type="text"
                required
                value={loginUser.usuario}
                onChange={e => setLoginUser({ ...loginUser, usuario: e.target.value })}
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                placeholder="admin"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Contraseña</label>
              <input
                type="password"
                required
                value={loginUser.password}
                onChange={e => setLoginUser({ ...loginUser, password: e.target.value })}
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                placeholder="••••••••"
              />
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', fontSize: '11.5px', color: '#475569', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div><strong>Credenciales Oficiales Supabase:</strong></div>
              <div style={{ fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>🔑 Usuario:</span> admin | <span style={{ color: '#059669', fontWeight: 700 }}>🔒 Clave:</span> admin123
              </div>
            </div>

            <button
              type="submit"
              style={{ width: '100%', height: '46px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Ingresar al Sistema ERP
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* ─── HEADER BAR ORIGINAL SAP UI ────────────────────────────────────────── */}
      <header className="sap-header">
        <div className="sap-brand">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
            onClick={handleLogout}
            style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Cerrar Sesión"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Salir
          </button>
        </div>
      </header>

      {/* ─── APP CONTAINER & ACCORDION SIDEBAR ─────────────────────────────────── */}
      <div className="app-container">
        <nav className={`sap-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {/* 1.0 LAUNCHPAD */}
          <div className="sap-module-group">
            <div className="sap-module-header" onClick={() => toggleModuleGroup('dashboard')}>
              <span><i className="fa-solid fa-cubes"></i> Panel Principal</span>
              <i className={`fa-solid fa-chevron-down arrow ${collapsedGroups.dashboard ? 'rotate--90' : ''}`}></i>
            </div>
            {!collapsedGroups.dashboard && (
              <div className="sap-sub-menu">
                <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                  <div className="nav-item-left"><i className="fa-solid fa-chart-pie"></i> Resumen & Métricas</div>
                </div>
              </div>
            )}
          </div>

          {/* 2.0 GESTIÓN DE CLIENTES */}
          <div className="sap-module-group">
            <div className="sap-module-header" onClick={() => toggleModuleGroup('clientes')}>
              <span><i className="fa-solid fa-users"></i> Gestión de Clientes</span>
              <i className="fa-solid fa-chevron-down arrow"></i>
            </div>
            {!collapsedGroups.clientes && (
              <div className="sap-sub-menu">
                <div className={`nav-item ${activeTab === 'sd-customers' ? 'active' : ''}`} onClick={() => setActiveTab('sd-customers')}>
                  <div className="nav-item-left"><i className="fa-solid fa-address-book"></i> Directorio de Casilleros</div>
                </div>
                <div className={`nav-item ${activeTab === 'sd-dni' ? 'active' : ''}`} onClick={() => setActiveTab('sd-dni')}>
                  <div className="nav-item-left"><i className="fa-solid fa-id-card"></i> Expedientes DNI Digital</div>
                </div>
              </div>
            )}
          </div>

          {/* 3.0 OPERACIONES Y ALMACENES */}
          <div className="sap-module-group">
            <div className="sap-module-header" onClick={() => toggleModuleGroup('almacenes')}>
              <span><i className="fa-solid fa-warehouse"></i> Operaciones y Almacenes</span>
              <i className="fa-solid fa-chevron-down arrow"></i>
            </div>
            {!collapsedGroups.almacenes && (
              <div className="sap-sub-menu">
                <div className={`nav-item ${activeTab === 'mm-miami' ? 'active' : ''}`} onClick={() => setActiveTab('mm-miami')}>
                  <div className="nav-item-left"><i className="fa-solid fa-plane-departure"></i> 1. Almacén Miami (USA)</div>
                </div>
                <div className={`nav-item ${activeTab === 'mm-tingo' ? 'active' : ''}`} onClick={() => setActiveTab('mm-tingo')}>
                  <div className="nav-item-left"><i className="fa-solid fa-dolly"></i> 2. Almacén Tingo María</div>
                </div>
                <div className={`nav-item ${activeTab === 'mm-lince' ? 'active' : ''}`} onClick={() => setActiveTab('mm-lince')}>
                  <div className="nav-item-left"><i className="fa-solid fa-store"></i> 3. Almacén Sede Lince</div>
                </div>
                <div className={`nav-item ${activeTab === 'mobile-scanner' ? 'active' : ''}`} onClick={() => setActiveTab('mobile-scanner')}>
                  <div className="nav-item-left"><i className="fa-solid fa-barcode" style={{ color: '#38bdf8' }}></i> 📱 Escáner de Códigos de Barras</div>
                </div>
              </div>
            )}
          </div>

          {/* 4.0 DESPACHO Y REPARTO */}
          <div className="sap-module-group">
            <div className="sap-module-header" onClick={() => toggleModuleGroup('despacho')}>
              <span><i className="fa-solid fa-truck-fast"></i> Despacho y Reparto</span>
              <i className="fa-solid fa-chevron-down arrow"></i>
            </div>
            {!collapsedGroups.despacho && (
              <div className="sap-sub-menu">
                <div className={`nav-item ${activeTab === 'shp-deliveries' ? 'active' : ''}`} onClick={() => setActiveTab('shp-deliveries')}>
                  <div className="nav-item-left"><i className="fa-solid fa-car-side"></i> Reparto Carro Amex & Entregas</div>
                </div>
              </div>
            )}
          </div>

          {/* 5.0 LIQUIDACIONES Y FINANZAS */}
          <div className="sap-module-group">
            <div className="sap-module-header" onClick={() => toggleModuleGroup('finanzas')}>
              <span><i className="fa-solid fa-file-invoice-dollar"></i> Liquidaciones y Finanzas</span>
              <i className="fa-solid fa-chevron-down arrow"></i>
            </div>
            {!collapsedGroups.finanzas && (
              <div className="sap-sub-menu">
                <div className={`nav-item ${activeTab === 'fico-liquidations' ? 'active' : ''}`} onClick={() => setActiveTab('fico-liquidations')}>
                  <div className="nav-item-left"><i className="fa-solid fa-coins"></i> Liquidaciones & Cobranzas</div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ─── MAIN WORKSPACE CONTENT ────────────────────────────────────────── */}
        <main className="main-content">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
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
                  <button className="btn btn-primary" onClick={() => setIsNewClientModalOpen(true)}>
                    <i className="fa-solid fa-user-plus"></i> Registrar Casillero
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsNewPkgModalOpen(true)}>
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
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Inventario de Paquetes en Base de Datos Supabase (`paquetes`)</h3>
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
                        <th style={{ textAlign: 'center' }}>Rótulo Térmico</th>
                        <th style={{ textAlign: 'center' }}>Factura PDF (Cloudflare R2)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPaquetes.map(pkg => (
                        <tr key={pkg.id}>
                          <td className="badge-wr">{pkg.numeroReciboBodega}</td>
                          <td style={{ fontWeight: 600 }}>{pkg.trackingUsa}</td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#9333ea' }}>{pkg.codigoCasillero}</td>
                          <td>{pkg.nombreConsignatario || 'María Torres Pérez'}</td>
                          <td style={{ fontWeight: 700 }}>{pkg.pesoKg} Kg</td>
                          <td>${pkg.valorDeclaradoUsd.toFixed(2)} USD</td>
                          <td><span className="badge badge-type">{pkg.ubicacionActual}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="btn btn-car" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setSelectedThermalPkg(pkg)}>
                              <i className="fa-solid fa-print"></i> Imprimir
                            </button>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {pkg.facturaPdfUrl ? (
                              <button className="badge badge-pdf" style={{ border: 'none' }} onClick={() => setSelectedPdfUrl(pkg.facturaPdfUrl || null)}>
                                <i className="fa-solid fa-file-pdf"></i> Ver PDF R2
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Sin PDF</span>
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

          {/* TAB 2: DIRECTORIO DE CASILLEROS */}
          {activeTab === 'sd-customers' && (
            <div>
              <div className="sap-breadcrumb">
                <span>Gestión de Clientes</span> / <span>Directorio de Casilleros</span>
              </div>
              <div className="page-title-bar">
                <div>
                  <h1 className="page-title">Directorio de Casilleros e Importadores</h1>
                  <p className="page-subtitle">Base de datos de casilleros `AMEX-PER-XXXX` con datos fiscales y de despacho</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={() => setIsNewClientModalOpen(true)}>
                    <i className="fa-solid fa-user-plus"></i> Crear Nuevo Casillero
                  </button>
                </div>
              </div>

              <div className="card-panel">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Código Casillero</th>
                        <th>Importador / Cliente</th>
                        <th>DNI / RUC</th>
                        <th>WhatsApp</th>
                        <th>Ubigeo Destino</th>
                        <th>Agencia Destino</th>
                        <th>Expediente DNI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map(cli => (
                        <tr key={cli.id}>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#2563eb' }}>{cli.codigoCasillero}</td>
                          <td style={{ fontWeight: 700 }}>{cli.nombre}</td>
                          <td style={{ fontFamily: 'JetBrains Mono' }}>{cli.documentoIdentidad}</td>
                          <td>{cli.telefono}</td>
                          <td>{cli.departamento} / {cli.provincia} / {cli.distrito}</td>
                          <td><span className="badge badge-type">{cli.transportistaPreferido}</span></td>
                          <td>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setSelectedDniClient(cli)}>
                              <i className="fa-solid fa-id-card"></i> Ver DNI
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPEDIENTES DNI */}
          {activeTab === 'sd-dni' && (
            <div>
              <div className="sap-breadcrumb">
                <span>Gestión de Clientes</span> / <span>Expedientes DNI Digital</span>
              </div>
              <div className="page-title-bar">
                <div>
                  <h1 className="page-title">Gestión de Expedientes Digitales de DNI</h1>
                  <p className="page-subtitle">Verificación de copias digitalizadas de DNI (Anverso y Reverso) en Cloudflare R2</p>
                </div>
              </div>

              <div className="card-panel" style={{ padding: '24px' }}>
                <div className="dni-viewer-grid">
                  {clientes.map(cli => (
                    <div key={cli.id} className="dni-card">
                      <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>{cli.codigoCasillero} - {cli.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>DNI: {cli.documentoIdentidad}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>DNI Frente</span>
                          {cli.dniFrontalUrl ? (
                            <img src={cli.dniFrontalUrl} alt="Frente" />
                          ) : (
                            <div className="dni-card-placeholder"><i className="fa-solid fa-image"></i> Sin foto</div>
                          )}
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>DNI Reverso</span>
                          {cli.dniReversoUrl ? (
                            <img src={cli.dniReversoUrl} alt="Reverso" />
                          ) : (
                            <div className="dni-card-placeholder"><i className="fa-solid fa-image"></i> Sin foto</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALMACÉN MIAMI */}
          {activeTab === 'mm-miami' && (
            <div>
              <div className="sap-breadcrumb">
                <span>Operaciones y Almacenes</span> / <span>Almacén Miami (USA)</span>
              </div>
              <div className="page-title-bar">
                <div>
                  <h1 className="page-title">1. Almacén Tib Courier (Miami, USA)</h1>
                  <p className="page-subtitle">Ingesta de compras con Guía WR#, Tipo Empaque e Invoices PDF en Cloudflare R2</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsNewPkgModalOpen(true)}>
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
                      {paquetes.filter(p => p.ubicacionActual === 'TibCourierMiami').map(pkg => (
                        <tr key={pkg.id}>
                          <td className="badge-wr">{pkg.numeroReciboBodega}</td>
                          <td style={{ fontWeight: 600 }}>{pkg.trackingUsa}</td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#2563eb' }}>{pkg.codigoCasillero}</td>
                          <td>{pkg.nombreConsignatario || 'María Torres'}</td>
                          <td>{pkg.descripcion}</td>
                          <td style={{ fontWeight: 700 }}>{pkg.pesoKg} Kg</td>
                          <td>${pkg.valorDeclaradoUsd.toFixed(2)} USD</td>
                          <td>
                            {pkg.facturaPdfUrl ? (
                              <button className="badge badge-pdf" style={{ border: 'none' }} onClick={() => setSelectedPdfUrl(pkg.facturaPdfUrl || null)}>
                                <i className="fa-solid fa-file-pdf"></i> Ver PDF R2
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Sin PDF</span>
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

          {/* TAB 5: LIQUIDACIONES Y FINANZAS */}
          {activeTab === 'fico-liquidations' && (
            <div>
              <div className="sap-breadcrumb">
                <span>Liquidaciones y Finanzas</span> / <span>Liquidaciones & Cobranzas</span>
              </div>
              <div className="page-title-bar">
                <div>
                  <h1 className="page-title">Liquidaciones Financieras y Cobranzas</h1>
                  <p className="page-subtitle">Desglose de fletes en USD y Soles (PEN) con comprobantes de pago Yape/BCP</p>
                </div>
              </div>

              <div className="card-panel">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Casillero</th>
                        <th>Cliente Importador</th>
                        <th>Guía WR #</th>
                        <th>Flete ($)</th>
                        <th>Admin Fee ($)</th>
                        <th>Total USD ($)</th>
                        <th>Total Soles (S/)</th>
                        <th>Estado Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paquetes.map(pkg => {
                        const flete = pkg.pesoKg * 12.0;
                        const admin = 5.0;
                        const totalUsd = flete + admin;
                        const totalPen = totalUsd * 3.80;
                        return (
                          <tr key={pkg.id}>
                            <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#9333ea' }}>{pkg.codigoCasillero}</td>
                            <td style={{ fontWeight: 700 }}>{pkg.nombreConsignatario || 'María Torres'}</td>
                            <td className="badge-wr">{pkg.numeroReciboBodega}</td>
                            <td>${flete.toFixed(2)}</td>
                            <td>${admin.toFixed(2)}</td>
                            <td style={{ fontWeight: 800 }}>${totalUsd.toFixed(2)} USD</td>
                            <td style={{ fontWeight: 800, color: '#059669' }}>S/ {totalPen.toFixed(2)}</td>
                            <td><span className="badge badge-paid-pen">PAGADO YAPE/BCP</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB ESCÁNER DE CÓDIGOS DE BARRAS INLINE */}
          {activeTab === 'mobile-scanner' && (
            <div>
              <div className="sap-breadcrumb">
                <span>Operaciones y Almacenes</span> / <span>Escáner de Códigos de Barras</span>
              </div>
              <MobileScannerModal
                isOpen={true}
                isInline={true}
                onClose={() => {}}
                onScan={handleScanCode}
                onConfirm={handleConfirmScan}
              />

              <div className="card-panel" style={{ marginTop: '18px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginRight: '8px' }}></i> Códigos Confirmados
                  </h3>
                  <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
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
                            <td style={{ fontFamily: 'JetBrains Mono' }}>{log.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '28px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    <i className="fa-solid fa-barcode" style={{ fontSize: '28px', marginBottom: '10px', color: '#cbd5e1', display: 'block' }}></i>
                    Aún no se han confirmado códigos. Escanea una guía CODE_128 y presiona "Confirmar y Guardar".
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── MODAL CREAR NUEVO CASILLERO ─────────────────────────────────────── */}
      {isNewClientModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <i className="fa-solid fa-user-plus" style={{ color: '#2563eb', marginRight: '8px' }}></i> Crear Nuevo Casillero AMEX
              </h3>
              <button onClick={() => setIsNewClientModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <form onSubmit={handleSaveClient}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo del Cliente / Razon Social</label>
                  <input type="text" required className="form-control" value={newClientForm.nombre} onChange={e => setNewClientForm({ ...newClientForm, nombre: e.target.value })} placeholder="Ej: María Torres Pérez" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">DNI / RUC Fiscal</label>
                    <input type="text" required className="form-control" value={newClientForm.documentoIdentidad} onChange={e => setNewClientForm({ ...newClientForm, documentoIdentidad: e.target.value })} placeholder="72819204" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Contacto</label>
                    <input type="text" className="form-control" value={newClientForm.telefono} onChange={e => setNewClientForm({ ...newClientForm, telefono: e.target.value })} placeholder="+51 987654321" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección de Entrega</label>
                  <input type="text" className="form-control" value={newClientForm.direccionEntrega} onChange={e => setNewClientForm({ ...newClientForm, direccionEntrega: e.target.value })} placeholder="Av. Balta 456, Int 201" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewClientModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Casillero</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL RÓTULO TÉRMICO DE IMPRESIÓN ────────────────────────────────── */}
      {selectedThermalPkg && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}><i className="fa-solid fa-print"></i> Vista Previa de Rótulo Térmico</h3>
              <button onClick={() => setSelectedThermalPkg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body printable-area">
              <div className="shipping-label-card">
                <div className="label-header">
                  <span style={{ fontWeight: 800, fontSize: '18px' }}>AMEX COURIER PERÚ</span>
                  <span style={{ background: '#000', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 800 }}>{selectedThermalPkg.codigoCasillero}</span>
                </div>
                <div className="label-agency-box">
                  {selectedThermalPkg.metodoEntrega === 'CarroAmexDomicilio' ? 'REPARTO DOMICILIO LINCE' : 'AGENCIA SHALOM / OLVA'}
                </div>
                <div className="label-section">
                  <div className="label-title">Consignatario:</div>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{selectedThermalPkg.nombreConsignatario || 'María Torres Pérez'}</div>
                  <div>DNI: {selectedThermalPkg.dniConsignatario || '72819204'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
                  <div>
                    <strong>WR RECIBO:</strong>
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '14px' }}>{selectedThermalPkg.numeroReciboBodega}</div>
                  </div>
                  <div>
                    <strong>PESO:</strong>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{selectedThermalPkg.pesoKg} Kg</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedThermalPkg(null)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => window.print()}><i className="fa-solid fa-print"></i> Imprimir Ticket</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL VISOR PDF CLOUDFLARE R2 ───────────────────────────────────── */}
      {selectedPdfUrl && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '900px', height: '85vh' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626' }}>
                <i className="fa-solid fa-file-pdf"></i> Visor Factura PDF (Cloudflare R2 Storage)
              </h3>
              <button onClick={() => setSelectedPdfUrl(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <iframe src={selectedPdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Visor PDF R2"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ESCÁNER MÓVIL QR & BARRAS ─────────────────────────────────── */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
      />
    </div>
  );
}
