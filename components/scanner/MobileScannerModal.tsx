'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Camera, VideoOff, Barcode, Volume2, ShieldCheck, X, Copy, Check, Zap } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';

interface MobileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string, format: string) => void;
}

interface ScanLog {
  id: string;
  code: string;
  format: string;
  time: string;
}

export default function MobileScannerModal({ isOpen, onClose, onScan }: MobileScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [useNativeGpu, setUseNativeGpu] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1450, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const startCamera = async () => {
    try {
      // Verificar si el navegador soporta la API nativa de deteccion por GPU (BarcodeDetector API)
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        setUseNativeGpu(true);
      }

      if (!scannerRef.current) {
        // Matriz optimizada 1D de lectura ultrarrápida
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

      // Configuración HD de video (1280x720 @ 30 FPS) para nitidez máxima en barras finas
      const config = {
        fps: 30,
        qrbox: (vfWidth: number, vfHeight: number) => {
          return {
            width: Math.floor(vfWidth * 0.94),
            height: Math.floor(vfHeight * 0.55)
          };
        },
        aspectRatio: 1.777778, // 16:9 HD
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
          ...prev.filter(item => item.code !== decodedText).slice(0, 4)
        ]);
      };

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(
            c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('trasera') || c.label.toLowerCase().includes('environment')
          );
          const camId = backCam ? backCam.id : devices[devices.length - 1].id;
          setSelectedCamera(camId);

          await scannerRef.current.start(camId, config, onScanSuccess, () => {});
          setIsScanning(true);
          return;
        }
      } catch {
        // Fallback facingMode
      }

      await scannerRef.current.start({ facingMode: "environment" }, config, onScanSuccess, () => {});
      setIsScanning(true);
    } catch (err) {
      console.log('Error start camera:', err);
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
      }, 250);
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      {/* Inline Responsive Mobile Window */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '94vh',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#020617', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Barcode className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 style={{ fontSize: '13.5px', fontWeight: 800, margin: 0, color: '#ffffff' }}>Escáner Ultrarrápido HD (CODE 128)</h3>
              <p style={{ fontSize: '10px', color: '#34d399', fontFamily: 'JetBrains Mono', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap className="w-3 h-3 text-amber-400" /> Aceleración GPU Hardware 720p HD @ 30 FPS
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1e293b', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Box */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%', backgroundColor: '#020617', borderRadius: '12px', overflow: 'hidden', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1e293b' }}>
            <div id="qr-reader-viewport" style={{ width: '100%' }}></div>

            {/* Laser Line Effect */}
            {isScanning && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
                <div style={{ width: '100%', height: '3px', background: 'linear-gradient(to right, transparent, #ef4444, #38bdf8, #ef4444, transparent)', boxShadow: '0 0 16px #ef4444' }}></div>
                <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#7dd3fc', background: 'rgba(2, 6, 23, 0.85)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.3)' }}>
                  Mantenga la cámara fija a 15-20cm del código `AMX...`
                </div>
              </div>
            )}

            {!isScanning && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                <Camera className="w-10 h-10 mx-auto text-sky-400 mb-2 opacity-80" />
                <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px', margin: 0 }}>Cámara HD en espera</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Toca el botón para iniciar el motor de aceleración GPU
                </p>
              </div>
            )}
          </div>

          {/* Controls Bar Mobile */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isScanning ? (
              <button
                onClick={startCamera}
                style={{ flex: 1, minHeight: '44px', padding: '10px 16px', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Camera className="w-4 h-4" /> Iniciar Escáner GPU HD
              </button>
            ) : (
              <button
                onClick={stopCamera}
                style={{ flex: 1, minHeight: '44px', padding: '10px 16px', background: 'rgba(220, 38, 38, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: 700, fontSize: '13px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <VideoOff className="w-4 h-4" /> Apagar Cámara
              </button>
            )}

            {cameras.length > 1 && (
              <select
                value={selectedCamera}
                onChange={e => {
                  setSelectedCamera(e.target.value);
                  if (isScanning) {
                    stopCamera().then(startCamera);
                  }
                }}
                style={{ background: '#020617', border: '1px solid #1e293b', color: '#cbd5e1', fontSize: '12px', borderRadius: '10px', padding: '0 10px', minHeight: '44px' }}
              >
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Cámara ${cam.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Recent Scans History Log */}
          {scanHistory.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Detección DSI Instantánea GPU</span>
                <span style={{ color: '#34d399', fontSize: '10px', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Volume2 className="w-3 h-3" /> BEEP ACTIVADO
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
                {scanHistory.map(item => (
                  <div
                    key={item.id}
                    style={{ padding: '8px 12px', background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12px' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.code}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', gap: '8px' }}>
                        <span>{item.format}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.code, item.id)}
                      style={{ padding: '8px', background: '#0f172a', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Copiar código"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
