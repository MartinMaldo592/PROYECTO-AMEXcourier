'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';
import type { Html5QrcodeResult } from 'html5-qrcode';

interface MobileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (decodedText: string, format: string) => void;
  isInline?: boolean;
}

export default function MobileScannerModal({ isOpen, onClose, onConfirm, isInline = false }: MobileScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [backCameras, setBackCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [pendingScan, setPendingScan] = useState<{ code: string; format: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1450, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio fallback
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([90, 45, 90]);
    }
  };

  const handleDecoded = (decodedText: string, result?: Html5QrcodeResult) => {
    playScanBeep();
    const formatName = result?.result?.format?.formatName || 'CODE_128';
    setPendingScan({ code: decodedText, format: formatName });
    freezeScanner();
  };

  const freezeScanner = async () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.pause(true);
        return;
      } catch {
        // fallback: detener cámara por completo
      }
      try {
        await scannerRef.current.stop().catch(() => {});
      } catch {
        // silent
      }
    }
  };

  const resumeScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.getState() === Html5QrcodeScannerState.PAUSED) {
          scannerRef.current.resume();
          return;
        }
      } catch {
        // fallback
      }
    }
    await startCamera();
  };

  const startCamera = async () => {
    try {
      if (!scannerRef.current) {
        // EXCLUSIVO PARA CÓDIGOS DE BARRAS CODE_128 (MÁXIMA PRECISIÓN LOGÍSTICA DE ENVÍOS)
        const onlyCode128 = [
          Html5QrcodeSupportedFormats.CODE_128
        ];

        scannerRef.current = new Html5Qrcode('qr-reader-viewport', {
          formatsToSupport: onlyCode128,
          verbose: false
        });
      }

      const state = scannerRef.current.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        return;
      }

      const config = {
        fps: 15,
        qrbox: (vfWidth: number, vfHeight: number) => {
          return {
            width: Math.floor(vfWidth * 0.6),
            height: Math.floor(vfHeight * 0.25)
          };
        },
        videoConstraints: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 },
          focusMode: "continuous"
        },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
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

          await scannerRef.current.start(selectedId, config, handleDecoded, () => {});
          setIsScanning(true);
          return;
        }
      } catch {
        // Fallback
      }

      await scannerRef.current.start({ facingMode: { exact: "environment" } }, config, handleDecoded, () => {});
      setIsScanning(true);
    } catch {
      try {
        if (scannerRef.current) {
          await scannerRef.current.start({ facingMode: "environment" }, { fps: 15 }, handleDecoded, () => {});
          setIsScanning(true);
        }
      } catch (e) {
        console.log('Error start camera:', e);
      }
    }
  };

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop().catch(() => {});
      } catch {
        // Silent catch
      } finally {
        setIsScanning(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      const timer = setTimeout(() => {
        if (isMounted) startCamera();
      }, 200);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        stopCamera();
      };
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la cámara solo debe iniciarse cuando cambia isOpen
  }, [isOpen, stopCamera]);

  const handleConfirmScan = () => {
    if (!pendingScan) return;
    onConfirm(pendingScan.code, pendingScan.format);
    setPendingScan(null);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => resumeScanner(), 300);
  };

  const handleReScan = () => {
    setPendingScan(null);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => resumeScanner(), 300);
  };

  if (!isOpen) return null;

  const scannerBody = (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-barcode" style={{ color: '#2563eb' }}></i> Escáner Exclusivo CODE_128 (Precisión Logística)
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Filtro de lectura de alta precisión para rótulos y guías `AMX...`</p>
        </div>
        {!isInline && (
          <button onClick={() => { stopCamera(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        )}
      </div>

      {/* FULL MOBILE CAMERA VIEWPORT BOX */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: '#020617',
          borderRadius: '12px',
          overflow: 'hidden',
          minHeight: '220px',
          maxHeight: '48vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #3b82f6',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)'
        }}
      >
        <div id="qr-reader-viewport" style={{ width: '100%', height: '100%' }}></div>

        {/* CENTERED LASER BEAM LINE AND TARGET RETICLE */}
        {isScanning && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            {/* Horizontal Centered Red Laser Line */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '5%',
                right: '5%',
                height: '3px',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(to right, transparent, #ef4444, #ffffff, #ef4444, transparent)',
                boxShadow: '0 0 16px #ef4444, 0 0 6px #ffffff, 0 0 24px rgba(239,68,68,0.8)',
                zIndex: 10
              }}
            ></div>

            {/* Target Reticle Frame Corners */}
            <div style={{ position: 'absolute', top: '15%', left: '8%', width: '24px', height: '24px', borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderRadius: '4px 0 0 0' }}></div>
            <div style={{ position: 'absolute', top: '15%', right: '8%', width: '24px', height: '24px', borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderRadius: '0 4px 0 0' }}></div>
            <div style={{ position: 'absolute', bottom: '15%', left: '8%', width: '24px', height: '24px', borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderRadius: '0 0 0 4px' }}></div>
            <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: '24px', height: '24px', borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderRadius: '0 0 4px 0' }}></div>

            {/* Bottom Instruction Tag */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#ffffff',
                background: 'rgba(2, 6, 23, 0.85)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Lectura Exclusiva CODE_128 Activada
            </div>
          </div>
        )}

        {pendingScan && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, backgroundColor: 'rgba(2, 6, 23, 0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '14px', padding: '22px 20px', boxShadow: '0 20px 50px rgba(0,0,0,0.55)', border: '2px solid #22c55e', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Código Escaneado</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>TEXTO EXTRAÍDO DE LA GUÍA</div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#0f172a',
                  background: '#f1f5f9',
                  border: '1px dashed #94a3b8',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  wordBreak: 'break-all',
                  marginBottom: '6px'
                }}
              >
                {pendingScan.code}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, marginBottom: '16px' }}>Formato: <span style={{ fontFamily: 'JetBrains Mono', color: '#2563eb', fontWeight: 800 }}>{pendingScan.format}</span></div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleConfirmScan}
                  className="btn"
                  style={{ flex: 1, height: '46px', justifyContent: 'center', fontSize: '13px', background: '#16a34a', color: '#ffffff', fontWeight: 800, borderRadius: '10px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
                >
                  <i className="fa-solid fa-check"></i> Confirmar y Guardar
                </button>
                <button
                  onClick={handleReScan}
                  className="btn btn-secondary"
                  style={{ height: '46px', padding: '0 18px', justifyContent: 'center', fontSize: '13px', fontWeight: 700, borderRadius: '10px' }}
                >
                  <RotateCcw className="w-4 h-4" /> Reescanear
                </button>
              </div>
            </div>
          </div>
        )}

        {!isScanning && !pendingScan && (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8' }}>
            <i className="fa-solid fa-camera" style={{ fontSize: '30px', color: '#2563eb', marginBottom: '12px' }}></i>
            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', margin: 0 }}>Cámara Trasera CODE_128 en Espera</p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Presione el botón inferior para encender la lectura de alta precisión</p>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
        {!isScanning ? (
          <button
            onClick={startCamera}
            className="btn btn-primary"
            style={{ flex: 1, height: '44px', justifyContent: 'center', fontSize: '13px', borderRadius: '10px' }}
          >
            <i className="fa-solid fa-camera"></i> Activar Lector Exclusivo CODE_128
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="btn btn-secondary"
            style={{ flex: 1, height: '44px', justifyContent: 'center', fontSize: '13px', background: '#fee2e2', color: '#dc2626', borderRadius: '10px' }}
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
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontSize: '12px', borderRadius: '10px', padding: '0 10px', height: '44px', fontWeight: 600 }}
          >
            {backCameras.map(cam => (
              <option key={cam.id} value={cam.id}>
                {cam.label || `Cámara ${cam.id}`}
              </option>
            ))}
          </select>
        )}
      </div>
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