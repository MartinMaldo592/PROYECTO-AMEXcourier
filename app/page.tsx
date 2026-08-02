'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Paquete, Cliente, TipoUbicacion, TipoMetodoEntrega, TipoEstadoEntrega } from '@/types';
import { supabase } from '@/lib/supabase/client';
import HeaderBar from '@/components/HeaderBar';
import Sidebar from '@/components/Sidebar';
import DashboardTab from '@/components/tabs/DashboardTab';
import CustomersTab from '@/components/tabs/CustomersTab';
import DniTab from '@/components/tabs/DniTab';
import MiamiTab from '@/components/tabs/MiamiTab';
import LiquidationsTab from '@/components/tabs/LiquidationsTab';
import ScannerTab from '@/components/tabs/ScannerTab';
import NewClientModal, { NewClientFormData } from '@/components/modals/NewClientModal';
import NewPackageModal, { NewPkgFormData } from '@/components/modals/NewPackageModal';
import ThermalLabelModal from '@/components/modals/ThermalLabelModal';
import PdfViewerModal from '@/components/modals/PdfViewerModal';
import DniImageModal from '@/components/modals/DniImageModal';

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

const DNI_FRONT_URL = "https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/dnis/Dni_anverso.jpeg";
const DNI_BACK_URL = "https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/dnis/Dni_reverso.jpeg";
const ORDER_PDF_URL = "https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev/FOLDER%20AMEX/facturas/Order_Details.pdf";

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
    ubicacionActual: ubicacion as TipoUbicacion,
    metodoEntrega: cli.transportistaPreferido === 'CARRO AMEX' ? 'CarroAmexDomicilio' : 'AgenciaProvincia',
    estadoEntrega: estado as TipoEstadoEntrega,
    facturaPdfUrl: ORDER_PDF_URL,
    creadoEn: '2026-08-01T11:00:00Z'
  };
});

const EMPTY_CLIENT_FORM: NewClientFormData = {
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
};

const EMPTY_PKG_FORM: NewPkgFormData = {
  codigoCasillero: 'AMEX-PER-1001',
  numeroReciboBodega: 'WR-000000',
  trackingUsa: '',
  tipoEmpaque: 'CAJA',
  numeroFactura: '',
  dniConsignatario: '',
  nombreConsignatario: '',
  descripcion: '',
  pesoKg: '1.0',
  valorDeclaradoUsd: '50.0',
  ubicacionActual: 'TibCourierMiami',
  metodoEntrega: 'CarroAmexDomicilio',
  facturaPdfUrl: ''
};

export default function DashboardPage() {
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
  }, []);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    clientes: false,
    almacenes: false,
    despacho: false,
    finanzas: false,
    configuracion: false
  });

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ nombre: string; rol: string } | null>(null);

  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const { user } = await res.json();
          if (user) {
            setCurrentUser(user);
            setIsLoggedIn(true);
          }
        }
      } catch {
        // Sesión no restaurable
      }
    }
    restoreSession();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginUser.email, password: loginUser.password }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || 'Credenciales incorrectas. Verifique su correo y contraseña.');
      }
    } catch {
      setLoginError('Error de conexión. Intente nuevamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // La sesión se limpia igualmente en el cliente
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [paquetes, setPaquetes] = useState<Paquete[]>(INITIAL_PAQUETES);
  const [scannedLogs, setScannedLogs] = useState<{ code: string; format: string; time: string }[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedDniImage, setSelectedDniImage] = useState<{ url: string; titulo: string; subtitulo: string } | null>(null);
  const [selectedThermalPkg, setSelectedThermalPkg] = useState<Paquete | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewPkgModalOpen, setIsNewPkgModalOpen] = useState(false);

  const [newClientForm, setNewClientForm] = useState<NewClientFormData>(EMPTY_CLIENT_FORM);
  const [newPkgForm, setNewPkgForm] = useState<NewPkgFormData>(EMPTY_PKG_FORM);

  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        const [clientesRes, paquetesRes] = await Promise.all([
          supabase.from('clientes').select('*'),
          supabase.from('paquetes').select('*'),
        ]);

        const dbClientes = clientesRes.data;
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

        const dbPaquetes = paquetesRes.data;
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
            ubicacionActual: (p.ubicacion_actual as TipoUbicacion) || 'TibCourierMiami',
            metodoEntrega: (p.metodo_entrega as TipoMetodoEntrega) || 'CarroAmexDomicilio',
            estadoEntrega: (p.estado_entrega as TipoEstadoEntrega) || 'EnAlmacen',
            facturaPdfUrl: p.factura_pdf_url || '',
            creadoEn: p.creado_en || ''
          })));
        }
      } catch {
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
      ubicacionActual: newPkgForm.ubicacionActual as TipoUbicacion,
      metodoEntrega: newPkgForm.metodoEntrega as TipoMetodoEntrega,
      estadoEntrega: 'EnAlmacen' as TipoEstadoEntrega,
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

  const openNewPkgModal = () => {
    setNewPkgForm({
      ...EMPTY_PKG_FORM,
      numeroReciboBodega: `WR-${Math.floor(100000 + Math.random() * 900000)}`
    });
    setIsNewPkgModalOpen(true);
  };

  const handleScanCode = (code: string, format: string) => {
    setScannedLogs(prev => [{ code, format, time: new Date().toLocaleTimeString() }, ...prev]);
  };

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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Correo Electrónico</label>
              <input
                type="email"
                required
                value={loginUser.email}
                onChange={e => setLoginUser({ ...loginUser, email: e.target.value })}
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                placeholder="admin@amexcourier.pe"
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
      <HeaderBar
        currentUser={currentUser}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
      />

      <div className="app-container">
        <Sidebar
          activeTab={activeTab}
          isSidebarCollapsed={isSidebarCollapsed}
          collapsedGroups={collapsedGroups}
          onSelectTab={setActiveTab}
          onToggleGroup={toggleModuleGroup}
        />

        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardTab
              clientes={clientes}
              paquetes={paquetes}
              filteredPaquetes={paquetes}
              onNewClient={() => setIsNewClientModalOpen(true)}
              onNewPackage={openNewPkgModal}
              onPrintLabel={setSelectedThermalPkg}
              onViewPdf={setSelectedPdfUrl}
            />
          )}

          {activeTab === 'sd-customers' && (
            <CustomersTab
              clientes={clientes}
              onNewClient={() => setIsNewClientModalOpen(true)}
              onViewDni={cli => {
                if (cli.dniFrontalUrl) {
                  setSelectedDniImage({ url: cli.dniFrontalUrl, titulo: 'DNI FRENTE', subtitulo: `${cli.codigoCasillero} - ${cli.nombre}` });
                }
              }}
            />
          )}

          {activeTab === 'sd-dni' && (
            <DniTab clientes={clientes} onViewDniImage={setSelectedDniImage} />
          )}

          {activeTab === 'mm-miami' && (
            <MiamiTab
              paquetes={paquetes}
              onNewPackage={openNewPkgModal}
              onViewPdf={setSelectedPdfUrl}
            />
          )}

          {activeTab === 'fico-liquidations' && (
            <LiquidationsTab paquetes={paquetes} />
          )}

          {activeTab === 'mobile-scanner' && (
            <ScannerTab
              scannedLogs={scannedLogs}
onConfirm={handleScanCode}
            />
          )}
        </main>
      </div>

      {isNewClientModalOpen && (
        <NewClientModal
          form={newClientForm}
          onChange={setNewClientForm}
          onSave={handleSaveClient}
          onClose={() => setIsNewClientModalOpen(false)}
        />
      )}

      {isNewPkgModalOpen && (
        <NewPackageModal
          form={newPkgForm}
          clientes={clientes}
          onChange={setNewPkgForm}
          onSave={handleSavePackage}
          onClose={() => setIsNewPkgModalOpen(false)}
        />
      )}

      {selectedThermalPkg && (
        <ThermalLabelModal pkg={selectedThermalPkg} onClose={() => setSelectedThermalPkg(null)} />
      )}

      {selectedPdfUrl && (
        <PdfViewerModal url={selectedPdfUrl} onClose={() => setSelectedPdfUrl(null)} />
      )}

      {selectedDniImage && (
        <DniImageModal image={selectedDniImage} onClose={() => setSelectedDniImage(null)} />
      )}
    </div>
  );
}
