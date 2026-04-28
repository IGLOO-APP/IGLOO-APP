import React, { useState, useRef } from 'react';
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
  MoreHorizontal,
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
import { supabase } from '../../lib/supabase';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Property } from '../../types';

interface PropertyDocumentsProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ property, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [newDocData, setNewDocData] = useState({
    name: '',
    category: 'Jurídico',
    type: 'PDF'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getNamingSuggestion = (category: string) => {
    const year = new Date().getFullYear();
    switch (category) {
      case 'Jurídico': return `CTR_INQUILINO_${year}`;
      case 'Financeiro': return `IPTU_${year}_COTA_1`;
      case 'Técnico': return `LAUDO_VISTORIA_ENTRADA`;
      default: return `DOC_${year}`;
    }
  };

  React.useEffect(() => {
    if (showUploadModal) {
      setNewDocData(prev => ({ ...prev, name: getNamingSuggestion(prev.category) }));
    }
  }, [showUploadModal, newDocData.category]);

  // Fetch real data
  const fetchDocuments = async () => {
    setIsLoading(true);
    const data = await documentService.getByProperty(property.id.toString());
    setDocuments(data);
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchDocuments();
  }, [property.id]);

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
        setNewDocData(prev => ({ ...prev, name: file.name.split('.')[0] }));
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

  return (
    <ModalWrapper
      onClose={onClose}
      className='md:max-w-4xl'
      title='Documentos do Imóvel'
      showCloseButton={true}
    >
      <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden'>
        {/* 1. Dashboard Header - Unified Dark Theme */}
        <div className='px-8 py-6 bg-white dark:bg-black/10 border-b border-gray-100 dark:border-white/5'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
                <CloudUpload size={24} />
              </div>
              <div>
                <div className='flex items-center gap-2 mb-0.5'>
                  <h3 className='font-black text-slate-900 dark:text-white tracking-tight'>
                    Documentos do Imóvel
                  </h3>
                  <div className='bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-slate-500'>
                    Igloo Drive
                  </div>
                </div>
                <p className='text-xs text-slate-400 font-medium'>
                  <span className='font-black text-slate-600 dark:text-slate-300'>{documents.length}</span> arquivos •{' '}
                  <span className='font-black text-emerald-600'>{documents.filter((d) => d.status === 'Validado').length}</span> validados
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={isUploading}
              className='group w-full md:w-auto h-12 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 hover:bg-slate-800 dark:hover:bg-slate-100'
            >
              {isUploading ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Plus size={16} className='group-hover:rotate-90 transition-transform' />
              )}
              {isUploading ? 'Processando...' : 'Adicionar Documento'}
            </button>
          </div>
        </div>

        {/* 2. Filters & Search - Darker Theme */}
        <div className='px-8 py-5 bg-slate-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/5'>
          <div className='flex flex-col md:flex-row gap-6'>
            <div className='relative flex-1 group'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white placeholder:text-slate-400'
                placeholder='Buscar por nome do arquivo...'
              />
            </div>
            <div className='flex gap-1 bg-white dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 overflow-x-auto hide-scrollbar shrink-0'>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
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
              <Loader2 className='text-primary animate-spin' size={32} />
              <p className='text-xs font-black text-slate-400 uppercase tracking-widest'>Sincronizando Drive...</p>
            </div>
          ) : filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className='group bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex items-center gap-3 md:gap-4'
              >
                {/* File Icon */}
                <div className='w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0'>
                  {getIconByType(doc.type)}
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <h4 className='font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors'>
                      {doc.name}
                    </h4>
                    {doc.status === 'Validado' ? (
                      <CheckCircle2 size={14} className='text-emerald-500 shrink-0' />
                    ) : (
                      <Clock size={14} className='text-amber-500 shrink-0' />
                    )}
                  </div>
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                    <span className='bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500'>
                      {doc.category}
                    </span>
                    <span className='hidden sm:inline'>
                      {doc.type} • {doc.size}
                    </span>
                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                      doc.status === 'Validado' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' 
                        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800'
                    }`}>
                      {doc.status === 'Validado' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {doc.status}
                    </div>
                  </div>
                  <div className='flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                    <span className='flex items-center gap-1.5'>
                      <Filter size={12} className='text-primary' /> {doc.category}
                    </span>
                    <span className='h-1 w-1 bg-slate-200 dark:bg-white/10 rounded-full'></span>
                    <span className='flex items-center gap-1.5'>
                      <FileCode size={12} /> {doc.size}
                    </span>
                    <span className='h-1 w-1 bg-slate-200 dark:bg-white/10 rounded-full'></span>
                    <span className='flex items-center gap-1.5'>
                      <Calendar size={12} /> {doc.uploadDate}
                    </span>
                  </div>
                </div>

                {/* Actions - Stylized Button Group */}
                <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0'>
                  <button
                    className='h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm'
                    title='Visualizar'
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className='h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm'
                    title='Baixar'
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className='h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm'
                    title='Excluir'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className='flex flex-col items-center justify-center py-20 text-center opacity-40'>
              <div className='w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4'>
                <Search size={32} />
              </div>
              <h4 className='font-bold text-slate-900 dark:text-white'>
                Nenhum documento encontrado
              </h4>
              <p className='text-sm text-slate-500 mt-1'>Tente ajustar seus filtros ou busca.</p>
            </div>
          )}
        </div>

        {/* 4. Quick Storage Info Footer */}
        <div className='p-8 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 shrink-0 z-20'>
          <div className='flex justify-between items-center mb-3'>
            <div className='flex items-center gap-2'>
              <Share2 size={14} className='text-primary' />
              <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Storage Capacity (Igloo Drive)
              </span>
            </div>
            <span className='text-xs font-mono font-black text-slate-900 dark:text-white'>
              68.5 MB / <span className='text-slate-400'>5.0 GB</span>
            </span>
          </div>
          <div className='w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-primary to-blue-400 w-[2%] rounded-full'></div>
          </div>
        </div>

        {/* 5. Smart Upload Modal */}
        {showUploadModal && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4'>
            <div className='bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp border border-white/10'>
              <div className='p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center'>
                <div>
                  <h3 className='font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg'>
                    Subir Documento
                  </h3>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Smart Naming Flow</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className='p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 transition-colors'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='p-6 space-y-6'>
                {/* Category Selection */}
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Categoria do Arquivo
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    {['Jurídico', 'Financeiro', 'Técnico', 'Outros'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewDocData({ ...newDocData, category: cat })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          newDocData.category === cat 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                            : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-slate-200 dark:hover:border-white/10'
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
                      <AlertCircle size={10} /> Sugestão Ativa
                    </span>
                  </div>
                  <div className='relative group'>
                    <div className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'>
                      <Hash size={18} />
                    </div>
                    <input
                      type='text'
                      value={newDocData.name}
                      onChange={(e) => setNewDocData({ ...newDocData, name: e.target.value })}
                      className='w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border-2 border-transparent focus:border-primary rounded-2xl outline-none font-bold text-sm text-slate-900 dark:text-white transition-all'
                      placeholder='Ex: CTR_MARIA_SILVA_2024'
                    />
                  </div>
                  <p className='text-[9px] text-slate-400 font-medium px-1 italic'>
                    Dica: Use underscores (_) em vez de espaços para maior segurança.
                  </p>
                </div>

                {/* File Drop Area */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    selectedFile 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/10 hover:border-primary/50'
                  }`}
                >
                  {selectedFile ? (
                    <>
                      <FileCheck size={32} className='mx-auto text-primary mb-2' />
                      <p className='text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest'>{selectedFile.name}</p>
                      <p className='text-[10px] text-primary mt-1 uppercase font-black'>Arquivo Selecionado</p>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className='mx-auto text-slate-300 mb-2' />
                      <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Arraste ou clique para subir</p>
                      <p className='text-[10px] text-slate-300 mt-1 uppercase'>Apenas PDF, JPG ou PNG</p>
                    </>
                  )}
                </button>
              </div>

              <div className='p-6 bg-slate-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex gap-3'>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className='flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all'
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDocument}
                  className='flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all'
                >
                  {isUploading ? 'Salvando...' : 'Salvar Documento'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
