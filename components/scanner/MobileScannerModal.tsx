'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Camera, VideoOff, Barcode, Volume2, ShieldCheck, X, Copy, Check, RotateCcw } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';

interface MobileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string, format: string) => void;
  isInline?: boolean;
}

interface ScanLog {
  id: string;
  code: string;
  format: string;
  time: string;
}

export default function MobileScannerModal({ isOpen, onClose, onScan, isInline = false }: MobileScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [backCameras, setBackCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio fallback
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  };

  const startCamera = async () => {
    try {
      if (!scannerRef.current) {
        const only1DBarcodeFormats = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR
        ];

        scannerRef.current = new Html5Qrcode('qr-reader-viewport', {
          formatsToSupport: only1DBarcodeFormats,
          verbose: false
        });
      }

      const state = scannerRef.current.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        return;
      }

      const config = {
        fps: 30,
        qrbox: (vfWidth: number, vfHeight: number) => {
          return {
            width: Math.floor(vfWidth * 0.95),
            height: Math.floor(vfHeight * 0.95)
          };
        },
        aspectRatio: 1.777778,
        videoConstraints: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30 },
          focusMode: "continuous"
        },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      const onScanSuccess = (decodedText: string, result: any) => {
        playScanBeep();
        const formatName = result?.result?.format?.formatName || 'CODE_128';
        onScan(decodedText, formatName);

        setScanHistory(prev => [
          {
            id: Math.random().toString(),
            code: decodedText,
            format: formatName,
            time: new Date().toLocaleTimeString()
          },
          ...prev.filter(item => item.code !== decodedText).slice(0, 5)
        ]);
      };

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const rearOnly = devices.filter(d => {
            const label = d.label.toLowerCase();
            return !label.includes('front') && !label.includes('user') && !label.includes('selfie') && !label.includes('delantera');
          });

          const activeList = rearOnly.length > 0 ? rearOnly : devices;
          setBackCameras(activeList);

          const selectedId = activeList[activeList.length - 1].id;
          setSelectedCamera(selectedId);

          await scannerRef.current.start(selectedId, config, onScanSuccess, () => {});
          setIsScanning(true);
          return;
        }
      } catch {
        // Fallback
      }

      await scannerRef.current.start({ facingMode: { exact: "environment" } }, config, onScanSuccess, () => {});
      setIsScanning(true);
    } catch (err) {
      try {
        if (scannerRef.current) {
          await scannerRef.current.start({ facingMode: "environment" }, { fps: 30 }, (decodedText, result) => {
            playScanBeep();
            onScan(decodedText, result?.result?.format?.formatName || 'CODE_128');
          }, () => {});
          setIsScanning(true);
        }
      } catch (e) {
        console.log('Error start camera:', e);
      }
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop().catch(() => {});
      } catch {
        // Silent catch
      } finally {
        setIsScanning(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      const timer = setTimeout(() => {
        if (isMounted) startCamera();
      }, 200);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!isOpen) return null;

  // Interfaz limpia e integrada en la misma página (Sin ventana flotante ruidosa)
  const scannerBody = (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            <i className="fa-solid fa-barcode" style={{ color: '#2563eb', marginRight: '8px' }}></i> Escáner de Códigos de Barras (Cámara Trasera 360°)
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Detección de guías `AMX...` desde cualquier ángulo o inclinación</p>
        </div>
        {!isInline && (
          <button onClick={() => { stopCamera(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        )}
      </div>

      {/* Camera View Box */}
      <div style={{ position: 'relative', width: '100%', backgroundColor: '#020617', borderRadius: '12px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1' }}>
        <div id="qr-reader-viewport" style={{ width: '100%' }}></div>

        {/* Laser scan indicator */}
        {isScanning && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ width: '100%', height: '3px', background: 'linear-gradient(to right, transparent, #2563eb, #38bdf8, #2563eb, transparent)', boxShadow: '0 0 12px #2563eb' }}></div>
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#ffffff', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 12px', borderRadius: '6px' }}>
              Pase la etiqueta o código de barras frente al visor
            </div>
          </div>
        )}

        {!isScanning && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
            <i className="fa-solid fa-camera" style={{ fontSize: '36px', color: '#2563eb', marginBottom: '12px' }}></i>
            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', margin: 0 }}>Cámara en Espera</p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Presione el botón inferior para activar la cámara trasera</p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        {!isScanning ? (
          <button
            onClick={startCamera}
            className="btn btn-primary"
            style={{ flex: 1, height: '44px', justifyContent: 'center', fontSize: '13px' }}
          >
            <i className="fa-solid fa-camera"></i> Activar Cámara Trasera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="btn btn-secondary"
            style={{ flex: 1, height: '44px', justifyContent: 'center', fontSize: '13px', background: '#fee2e2', color: '#dc2626' }}
          >
            <i className="fa-solid fa-video-slash"></i> Apagar Cámara
          </button>
        )}

        {backCameras.length > 1 && (
          <select
            value={selectedCamera}
            onChange={e => {
              setSelectedCamera(e.target.value);
              if (isScanning) {
                stopCamera().then(startCamera);
              }
            }}
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontSize: '12.5px', borderRadius: '6px', padding: '0 12px', height: '44px', fontWeight: 600 }}
          >
            {backCameras.map(cam => (
              <option key={cam.id} value={cam.id}>
                {cam.label || `Cámara ${cam.id}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* History Log Table */}
      {scanHistory.length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
            Últimos Códigos de Barras Leídos
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scanHistory.map(item => (
              <div
                key={item.id}
                style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}
              >
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#2563eb' }}>{item.code}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.format} • {item.time}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(item.code, item.id)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                >
                  {copiedId === item.id ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isInline) {
    return scannerBody;
  }

  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        {scannerBody}
      </div>
    </div>
  );
}
