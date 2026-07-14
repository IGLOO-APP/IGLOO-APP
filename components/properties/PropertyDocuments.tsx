import React, { useState, useRef, useCallback } from 'react';
import {
  FileText,
  Search,
  Download,
  Trash2,
  Plus,
  X,
  CloudUpload,
  FileCheck,
  FileCode,
  FileImage,
  Share2,
  Filter,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
  Upload,
} from 'lucide-react';
import { documentService, PropertyDocument } from '../../services/documentService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Property } from '../../types';

interface PropertyDocumentsProps {
  property: Property;
  onClose: () => void;
  inline?: boolean;
}

export const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({
  property,
  onClose,
  inline,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [newDocData, setNewDocData] = useState({
    name: '',
    category: 'Jurídico',
    type: 'PDF',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getNamingSuggestion = (category: string) => {
    const year = new Date().getFullYear();
    switch (category) {
      case 'Jurídico':
        return `CTR_INQUILINO_${year}`;
      case 'Financeiro':
        return `IPTU_${year}_COTA_1`;
      case 'Técnico':
        return `LAUDO_VISTORIA_ENTRADA`;
      default:
        return `DOC_${year}`;
    }
  };

  React.useEffect(() => {
    if (showUploadModal) {
      setNewDocData((prev) => ({ ...prev, name: getNamingSuggestion(prev.category) }));
    }
  }, [showUploadModal, newDocData.category]);

  // Fetch real data
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    const data = await documentService.getByProperty(property.id.toString());
    setDocuments(data);
    setIsLoading(false);
  }, [property.id]);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSaveDocument = async () => {
    setIsUploading(true);
    const newDoc = await documentService.create(property.id.toString(), {
      name: newDocData.name + (newDocData.name.toLowerCase().endsWith('.pdf') ? '' : '.pdf'),
      category: newDocData.category as any,
      type: selectedFile ? selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF',
      size: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB',
      status: 'Pendente',
    });

    if (newDoc) {
      setDocuments([newDoc, ...documents]);
      setShowUploadModal(false);
      setNewDocData({ name: '', category: 'Jurídico', type: 'PDF' });
      setSelectedFile(null);
    }
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-populate name if empty
      if (!newDocData.name) {
        setNewDocData((prev) => ({ ...prev, name: file.name.split('.')[0] }));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento permanentemente?')) {
      const success = await documentService.delete(id);
      if (success) {
        setDocuments(documents.filter((d) => d.id !== id));
      }
    }
  };

  const categories = ['Todos', 'Jurídico', 'Financeiro', 'Técnico', 'Outros'];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIconByType = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className='text-red-500' size={24} />;
      case 'DOCX':
        return <FileCheck className='text-blue-500' size={24} />;
      case 'PNG':
      case 'JPG':
        return <FileImage className='text-indigo-500' size={24} />;
      default:
        return <FileCode className='text-slate-400' size={24} />;
    }
  };

  const content = (
    <div className='flex flex-col h-full overflow-hidden'>
      {/* 1. Dashboard Header - Unified Dark Theme */}
      <div className='px-8 py-6 bg-white/5 border-b border-white/10'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
              <CloudUpload size={24} strokeWidth={1.8} />
            </div>
            <div>
              <div className='flex items-center gap-2 mb-0.5'>
                <h3 className='font-black text-slate-900 dark:text-white tracking-tight'>
                  Documentos do Imóvel
                </h3>
                <div className='bg-white/10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-slate-400'>
                  Igloo Drive
                </div>
              </div>
              <p className='text-xs text-slate-400 font-medium'>
                <span className='font-black text-slate-300'>
                  {documents.length}
                </span>{' '}
                arquivos •{' '}
                <span className='font-black text-emerald-400'>
                  {documents.filter((d) => d.status === 'Validado').length}
                </span>{' '}
                validados
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className='group w-full md:w-auto h-12 flex items-center justify-center gap-2 rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all px-8 text-[10px] font-black uppercase tracking-widest'
          >
            {isUploading ? (
              <Loader2 size={16} strokeWidth={1.8} className='animate-spin' />
            ) : (
              <Plus size={16} strokeWidth={1.8} className='group-hover:rotate-90 transition-transform' />
            )}
            {isUploading ? 'Processando...' : 'Adicionar Documento'}
          </button>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className='px-8 py-5 bg-white/5 border-b border-white/10'>
        <div className='flex flex-col md:flex-row gap-6'>
          <div className='relative flex-1 group'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'
              size={18}
              strokeWidth={1.8}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white placeholder:text-slate-400'
              placeholder='Buscar por nome do arquivo...'
            />
          </div>
          <div className='flex gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto hide-scrollbar shrink-0'>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Document List */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-3'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-20 gap-4'>
            <Loader2 className='text-primary animate-spin' size={32} strokeWidth={1.8} />
            <p className='text-xs font-black text-slate-400 uppercase tracking-widest'>
              Sincronizando Drive...
            </p>
          </div>
        ) : filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className='group lg-card lg-card-lift p-4 flex items-center gap-3 md:gap-4'
            >
              {/* File Icon */}
              <div className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0'>
                {getIconByType(doc.type)}
              </div>

              {/* Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-0.5'>
                  <h4 className='font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors'>
                    {doc.name}
                  </h4>
                  {doc.status === 'Validado' ? (
                    <CheckCircle2 size={14} strokeWidth={1.8} className='text-emerald-500 shrink-0' />
                  ) : (
                    <Clock size={14} strokeWidth={1.8} className='text-amber-500 shrink-0' />
                  )}
                </div>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                  <span className='bg-white/10 px-1.5 py-0.5 rounded text-slate-400'>
                    {doc.category}
                  </span>
                  <span className='hidden sm:inline'>
                    {doc.type} • {doc.size}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                      doc.status === 'Validado'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {doc.status === 'Validado' ? <CheckCircle2 size={10} strokeWidth={1.8} /> : <Clock size={10} strokeWidth={1.8} />}
                    {doc.status}
                  </div>
                </div>
                <div className='flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                  <span className='flex items-center gap-1.5'>
                    <Filter size={12} strokeWidth={1.8} className='text-primary' /> {doc.category}
                  </span>
                  <span className='h-1 w-1 bg-white/10 rounded-full'></span>
                  <span className='flex items-center gap-1.5'>
                    <FileCode size={12} strokeWidth={1.8} /> {doc.size}
                  </span>
                  <span className='h-1 w-1 bg-white/10 rounded-full'></span>
                  <span className='flex items-center gap-1.5'>
                    <Calendar size={12} strokeWidth={1.8} /> {doc.uploadDate}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0'>
                <button
                  className='h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-primary hover:text-white transition-all'
                  title='Visualizar'
                >
                  <Eye size={18} strokeWidth={1.8} />
                </button>
                <button
                  className='h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/20 transition-all'
                  title='Baixar'
                >
                  <Download size={18} strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className='h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all'
                  title='Excluir'
                >
                  <Trash2 size={18} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center py-20 text-center opacity-40'>
            <div className='w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4'>
              <Search size={32} strokeWidth={1.8} />
            </div>
            <h4 className='font-bold text-slate-900 dark:text-white'>
              Nenhum documento encontrado
            </h4>
            <p className='text-sm text-slate-500 mt-1'>Tente ajustar seus filtros ou busca.</p>
          </div>
        )}
      </div>

      {/* 4. Quick Storage Info Footer */}
      <div className='p-8 bg-white/5 border-t border-white/10 shrink-0 z-20'>
        <div className='flex justify-between items-center mb-3'>
          <div className='flex items-center gap-2'>
            <Share2 size={14} strokeWidth={1.8} className='text-primary' />
            <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              Storage Capacity (Igloo Drive)
            </span>
          </div>
          <span className='text-xs font-mono font-black text-slate-900 dark:text-white'>
            68.5 MB / <span className='text-slate-400'>5.0 GB</span>
          </span>
        </div>
        <div className='w-full h-1.5 bg-white/10 rounded-full overflow-hidden'>
          <div className='h-full bg-gradient-to-r from-primary to-blue-400 w-[2%] rounded-full'></div>
        </div>
      </div>

      {/* 5. Smart Upload Modal */}
      {showUploadModal && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
          {/* Blobs behind the modal so glass has something to refract */}
          <div className='absolute inset-0 bg-black/80 backdrop-blur-md' />
          <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute w-[50vw] h-[50vw] top-[-8%] left-[-8%] rounded-full opacity-80' style={{ background: 'radial-gradient(circle, var(--lg-blob-1), transparent 70%)', filter: 'blur(90px)', animation: 'lg-drift-1 18s ease-in-out infinite alternate' }} />
            <div className='absolute w-[42vw] h-[42vw] bottom-[-6%] right-[-6%] rounded-full opacity-80' style={{ background: 'radial-gradient(circle, var(--lg-blob-2), transparent 70%)', filter: 'blur(80px)', animation: 'lg-drift-2 22s ease-in-out infinite alternate' }} />
            <div className='absolute w-[30vw] h-[30vw] top-[40%] left-[35%] rounded-full opacity-60' style={{ background: 'radial-gradient(circle, var(--lg-blob-3), transparent 70%)', filter: 'blur(100px)', animation: 'lg-drift-3 26s ease-in-out infinite alternate' }} />
          </div>
          <div className='lg-card lg-card-lift w-full max-w-md rounded-3xl overflow-hidden animate-slideUp z-10'>
            <div className='p-6 border-b border-white/10 flex justify-between items-center'>
              <div>
                <h3 className='font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg'>
                  Subir Documento
                </h3>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  Smart Naming Flow
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className='p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors'
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {/* Category Selection */}
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Categoria do Arquivo
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {['Jurídico', 'Financeiro', 'Técnico', 'Outros'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewDocData({ ...newDocData, category: cat })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        newDocData.category === cat
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white/10 border-white/10 text-slate-400 hover:bg-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Name Input */}
              <div className='space-y-2'>
                <div className='flex justify-between items-center px-1'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Nome Profissional
                  </label>
                  <span className='flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase'>
                    <AlertCircle size={10} strokeWidth={1.8} /> Sugestão Ativa
                  </span>
                </div>
                <div className='relative group'>
                  <div className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'>
                    <Hash size={18} strokeWidth={1.8} />
                  </div>
                  <input
                    type='text'
                    value={newDocData.name}
                    onChange={(e) => setNewDocData({ ...newDocData, name: e.target.value })}
                    className='w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 focus:border-primary rounded-2xl outline-none font-bold text-sm text-slate-900 dark:text-white placeholder-slate-500 transition-all'
                    placeholder='Ex: CTR_MARIA_SILVA_2024'
                  />
                </div>
                <p className='text-[9px] text-slate-400 font-medium px-1 italic'>
                  Dica: Use underscores (_) em vez de espaços para maior segurança.
                </p>
              </div>

              {/* File Drop Area */}
              <input
                type='file'
                ref={fileInputRef}
                className='hidden'
                onChange={handleFileChange}
                accept='.pdf,.jpg,.jpeg,.png'
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full lg-card lg-card-lift border-2 border-dashed p-8 text-center transition-all ${
                  selectedFile
                    ? 'border-primary'
                    : 'border-white/10 hover:border-primary/50'
                }`}
              >
                {selectedFile ? (
                  <>
                    <FileCheck size={32} strokeWidth={1.8} className='mx-auto text-primary mb-2' />
                    <p className='text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest'>
                      {selectedFile.name}
                    </p>
                    <p className='text-[10px] text-primary mt-1 uppercase font-black'>
                      Arquivo Selecionado
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={32} strokeWidth={1.8} className='mx-auto text-slate-300 mb-2' />
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                      Arraste ou clique para subir
                    </p>
                    <p className='text-[10px] text-slate-300 mt-1 uppercase'>
                      Apenas PDF, JPG ou PNG
                    </p>
                  </>
                )}
              </button>
            </div>

            <div className='p-6 bg-white/5 border-t border-white/10 flex gap-3'>
              <button
                onClick={() => setShowUploadModal(false)}
                className='flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10'
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDocument}
                className='flex-1 py-4 rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest'
              >
                {isUploading ? 'Salvando...' : 'Salvar Documento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return inline ? (
    content
  ) : (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-4xl'
        showCloseButton={true}
      >
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Documentos do Imóvel</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
