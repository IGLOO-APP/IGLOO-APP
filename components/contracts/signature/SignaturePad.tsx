import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Eraser, CheckCircle, X } from 'lucide-react';

interface SignaturePadProps {
  onClose: () => void;
  onConfirm: (signatureDataUrl: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onClose, onConfirm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
      }
    }
  }, []);

  const getCanvasPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas) onConfirm(canvas.toDataURL());
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn'>
      <div className='bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col'>
        <div className='p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-start'>
          <div>
            <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg'>
              <PenTool size={18} className='text-primary' /> Assinatura Digital
            </h3>
            <p className='text-xs text-slate-500 mt-1 font-medium'>
              Desenhe sua assinatura com o mouse ou toque
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500'
          >
            <X size={20} />
          </button>
        </div>
        <div className='p-6 bg-slate-50 dark:bg-black/20 flex flex-col gap-4'>
          <div className='bg-white dark:bg-surface-dark rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-inner overflow-hidden cursor-crosshair relative'>
            {!isDrawing && (
              <div className='absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400'>
                <PenTool size={24} className='mb-2 opacity-40' />
                <span className='text-xs font-bold uppercase tracking-widest'>
                  Clique e arraste para assinar
                </span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className='w-full h-48 touch-none relative z-10'
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className='flex items-center justify-center gap-4 text-xs font-bold'>
            <button className='text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors'>
              Usar fonte de assinatura
            </button>
            <span className='text-slate-300 dark:text-slate-600'>ou</span>
            <button className='text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors'>
              Carregar imagem
            </button>
          </div>
        </div>
        <div className='p-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-surface-dark'>
          <button
            onClick={clearCanvas}
            className='px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex items-center gap-2'
          >
            <Eraser size={16} /> Limpar
          </button>
          <button
            onClick={handleConfirm}
            className='px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2'
          >
            <CheckCircle size={16} /> Confirmar Assinatura
          </button>
        </div>
      </div>
    </div>
  );
};
