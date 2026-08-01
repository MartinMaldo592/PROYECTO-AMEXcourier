'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Camera, VideoOff, Barcode, Volume2, ShieldCheck, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface MobileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string, format: string) => void;
}

export default function MobileScannerModal({ isOpen, onClose, onScan }: MobileScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [lastScanned, setLastScanned] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6 pitch
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext fallback
    }

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  };

  const startCamera = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-viewport');
      }

      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        let backCam = devices.find(
          c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('trasera')
        );
        const camId = backCam ? backCam.id : devices[devices.length - 1].id;
        setSelectedCamera(camId);

        await scannerRef.current.start(
          camId,
          { fps: 15, qrbox: { width: 250, height: 180 } },
          (decodedText, result) => {
            setLastScanned(decodedText);
            playScanBeep();
            const formatName = result?.result?.format?.formatName || 'QR_CODE / BARCODE';
            onScan(decodedText, formatName);
          },
          () => {}
        );
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Error al iniciar cámara:', err);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error al detener cámara:', err);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base">Escáner Móvil en Tiempo Real</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full bg-black rounded-xl overflow-hidden min-h-[260px] flex items-center justify-center border border-slate-800">
            <div id="qr-reader-viewport" className="w-full"></div>
            {!isScanning && (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto text-sky-400 mb-2 opacity-80" />
                <p className="font-semibold text-white">Cámara Apagada</p>
                <p className="text-xs text-slate-400 mt-1">
                  Inicia la cámara para escanear códigos de barras de paquetes AMEX
                </p>
              </div>
            )}
          </div>

          <div className="w-full mt-4 flex gap-3">
            {!isScanning ? (
              <button
                onClick={startCamera}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <Camera className="w-4 h-4" /> Activar Cámara
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all"
              >
                <VideoOff className="w-4 h-4" /> Detener Cámara
              </button>
            )}
          </div>

          {cameras.length > 1 && (
            <select
              value={selectedCamera}
              onChange={e => {
                setSelectedCamera(e.target.value);
                if (isScanning) {
                  stopCamera().then(startCamera);
                }
              }}
              className="w-full mt-3 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5"
            >
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Cámara ${cam.id}`}
                </option>
              ))}
            </select>
          )}

          {lastScanned && (
            <div className="w-full mt-4 p-3 bg-slate-800/80 border border-sky-500/30 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Última lectura</div>
                <div className="font-mono font-bold text-sky-400 truncate">{lastScanned}</div>
              </div>
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
