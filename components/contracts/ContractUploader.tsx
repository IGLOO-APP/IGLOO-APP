import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ContractUploaderProps {
  onUploadComplete: (file: File) => void;
}

export const ContractUploader: React.FC<ContractUploaderProps> = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Apenas PDF ou DOCX.');
      return false;
    }
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 10MB.');
      return false;
    }
    return true;
  };

  const processFile = (file: File) => {
    setError(null);
    if (validateFile(file)) {
      setFile(file);
      simulateUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const simulateUpload = (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('done');
          onUploadComplete(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="w-full">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed transition-all ${
            dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploadStatus === 'idle' ? (
            <>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <div className="p-3 bg-white dark:bg-surface-dark rounded-full shadow-sm mb-3">
                        <UploadCloud className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="mb-2 text-sm text-slate-900 dark:text-white font-bold">
                        <button type="button" onClick={() => inputRef.current?.click()} className="text-primary hover:underline">Clique para enviar</button> ou arraste aqui
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF ou DOCX (MAX. 10MB)</p>
                </div>
                <input 
                    ref={inputRef}
                    type="file" 
                    className="hidden" 
                    onChange={handleChange}
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
            </>
        ) : (
            <div className="w-full px-8 flex flex-col items-center">
                <FileText size={40} className="text-slate-400 mb-4 animate-bounce" />
                <div className="w-full flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Enviando {file?.name}</span>
                    <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
                {uploadStatus === 'done' && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg animate-fadeIn">
                        <CheckCircle size={16} /> Upload Concluído!
                    </div>
                )}
            </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
            <AlertCircle size={16} />
            {error}
        </div>
      )}

      {file && uploadStatus === 'done' && (
          <div className="mt-4 p-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="text-red-500" size={20} />
                  </div>
                  <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
              </div>
              <button onClick={removeFile} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                  <X size={18} />
              </button>
          </div>
      )}
    </div>
  );
};
