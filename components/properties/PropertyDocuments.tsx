import React, { useState } from 'react';
import { 
    FileText, Search, Download, Trash2, Plus, 
    X, CloudUpload, FileCheck, FileCode, FileImage, 
    Share2, Filter, MoreHorizontal, Clock, Eye,
    CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Property } from '../../types';

interface PropertyDocument {
    id: string;
    name: string;
    category: 'Jurídico' | 'Financeiro' | 'Técnico' | 'Outros';
    size: string;
    uploadDate: string;
    type: 'PDF' | 'JPG' | 'PNG' | 'DOCX';
    status: 'Validado' | 'Pendente' | 'Expirado';
}

interface PropertyDocumentsProps {
    property: Property;
    onClose: () => void;
}

export const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ property, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [isUploading, setIsUploading] = useState(false);
    
    // Mock robust data for documents
    const [documents, setDocuments] = useState<PropertyDocument[]>([
        { id: '1', name: 'Contrato de Locação Digital - Assinado', category: 'Jurídico', size: '2.4 MB', uploadDate: '10/01/2024', type: 'PDF', status: 'Validado' },
        { id: '2', name: 'Escritura do Imóvel - Cópia Autenticada', category: 'Jurídico', size: '15.2 MB', uploadDate: '05/01/2024', type: 'PDF', status: 'Validado' },
        { id: '3', name: 'IPTU 2024 - Cota Única', category: 'Financeiro', size: '0.8 MB', uploadDate: '15/01/2024', type: 'PDF', status: 'Validado' },
        { id: '4', name: 'Laudo de Vistoria de Entrada', category: 'Técnico', size: '42.1 MB', uploadDate: '10/01/2024', type: 'PDF', status: 'Validado' },
        { id: '5', name: 'Nota Fiscal - Manutenção Ar Condicionado', category: 'Financeiro', size: '1.2 MB', uploadDate: '22/02/2024', type: 'PDF', status: 'Validado' },
        { id: '6', name: 'Planta Hidráulica e Elétrica', category: 'Técnico', size: '8.5 MB', uploadDate: '05/01/2024', type: 'DOCX', status: 'Pendente' },
        { id: '7', name: 'Seguro Fiança - Apólice Atual', category: 'Jurídico', size: '3.1 MB', uploadDate: '12/01/2024', type: 'PDF', status: 'Validado' },
        { id: '8', name: 'Comprovante de Rendimentos Inquilino', category: 'Financeiro', size: '1.5 MB', uploadDate: '08/01/2024', type: 'PNG', status: 'Validado' },
    ]);

    const categories = ['Todos', 'Jurídico', 'Financeiro', 'Técnico', 'Outros'];

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const simulateUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            const newDoc: PropertyDocument = {
                id: Date.now().toString(),
                name: 'Novo Documento Upload.pdf',
                category: 'Outros',
                size: '1.5 MB',
                uploadDate: new Date().toLocaleDateString('pt-BR'),
                type: 'PDF',
                status: 'Pendente'
            };
            setDocuments([newDoc, ...documents]);
            setIsUploading(false);
        }, 2000);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este documento permanentemente?")) {
            setDocuments(documents.filter(d => d.id !== id));
        }
    };

    const getIconByType = (type: string) => {
        switch(type) {
            case 'PDF': return <FileText className="text-red-500" size={24} />;
            case 'DOCX': return <FileCheck className="text-blue-500" size={24} />;
            case 'PNG':
            case 'JPG': return <FileImage className="text-indigo-500" size={24} />;
            default: return <FileCode className="text-slate-400" size={24} />;
        }
    };

    return (
        <ModalWrapper onClose={onClose} className="md:max-w-4xl" title="Documentos do Imóvel" showCloseButton={true}>
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
                
                {/* 1. Dashboard Header */}
                <div className="px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                {property.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{documents.length} arquivos totais • {documents.filter(d => d.status === 'Validado').length} validados</p>
                        </div>
                        <button 
                            onClick={simulateUpload}
                            disabled={isUploading}
                            className="w-full md:w-auto h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                            {isUploading ? 'Subindo...' : 'Fazer Upload'}
                        </button>
                    </div>
                </div>

                {/* 2. Filters & Search */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-black/10 border-b border-gray-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm outline-none focus:border-primary transition-all dark:text-white"
                                placeholder="Buscar documentos por nome..."
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                                        selectedCategory === cat 
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md' 
                                        : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-primary'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Document List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
                    {filteredDocs.length > 0 ? (
                        filteredDocs.map(doc => (
                            <div key={doc.id} className="group bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex items-center gap-4">
                                {/* File Icon */}
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                                    {getIconByType(doc.type)}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{doc.name}</h4>
                                        {doc.status === 'Validado' ? (
                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                        ) : (
                                            <Clock size={14} className="text-amber-500 shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        <span className="bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500">{doc.category}</span>
                                        <span>{doc.type} • {doc.size}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {doc.uploadDate}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 md:gap-2">
                                    <button className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-colors" title="Visualizar">
                                        <Eye size={18} />
                                    </button>
                                    <button className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-colors" title="Baixar">
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-red-500 transition-colors" title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Search size={32} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Nenhum documento encontrado</h4>
                            <p className="text-sm text-slate-500 mt-1">Tente ajustar seus filtros ou busca.</p>
                        </div>
                    )}
                </div>

                {/* 4. Quick Storage Info Footer */}
                <div className="p-4 md:p-6 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 shrink-0 z-20">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Armazenamento em Nuvem (Igloo Drive)</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">68.5 MB de 5.0 GB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[2%] rounded-full"></div>
                    </div>
                </div>

            </div>
        </ModalWrapper>
    );
};