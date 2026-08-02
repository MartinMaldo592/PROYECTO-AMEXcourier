'use client';

import { Cliente } from '@/types';

interface DniTabProps {
  clientes: Cliente[];
  onViewDniImage: (image: { url: string; titulo: string; subtitulo: string }) => void;
}

export default function DniTab({ clientes, onViewDniImage }: DniTabProps) {
  return (
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

      <div className="card-panel">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Código Casillero</th>
                <th>Importador / Cliente</th>
                <th>DNI</th>
                <th>Ubigeo Destino</th>
                <th className="cell-center">Expediente DNI Frente</th>
                <th className="cell-center">Expediente DNI Reverso</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cli => (
                <tr key={cli.id}>
                  <td className="cell-casillero-blue">{cli.codigoCasillero}</td>
                  <td className="cell-bold">{cli.nombre}</td>
                  <td className="cell-mono">{cli.documentoIdentidad}</td>
                  <td>{cli.departamento} / {cli.provincia} / {cli.distrito}</td>
                  <td className="cell-center">
                    {cli.dniFrontalUrl ? (
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => onViewDniImage({ url: cli.dniFrontalUrl || '', titulo: 'DNI FRENTE', subtitulo: `${cli.codigoCasillero} - ${cli.nombre}` })}>
                        <i className="fa-solid fa-image"></i> Ver Imagen
                      </button>
                    ) : (
                      <span className="cell-grey">Sin foto</span>
                    )}
                  </td>
                  <td className="cell-center">
                    {cli.dniReversoUrl ? (
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => onViewDniImage({ url: cli.dniReversoUrl || '', titulo: 'DNI REVERSO', subtitulo: `${cli.codigoCasillero} - ${cli.nombre}` })}>
                        <i className="fa-solid fa-image"></i> Ver Imagen
                      </button>
                    ) : (
                      <span className="cell-grey">Sin foto</span>
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
