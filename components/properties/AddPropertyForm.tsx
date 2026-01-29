
import React, { useState, useRef } from 'react';
import { 
    MapPin, ChevronDown, ArrowRight, UploadCloud, 
    BedDouble, Bath, Car, Home, DollarSign, 
    FileText, Loader2, X, Image as ImageIcon, Search
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';

interface AddPropertyFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onClose, onSave }) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
      nickname: '',
      type: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      area: '',
      bedrooms: 1,
      bathrooms: 1,
      parking: 0,
      rentValue: '',
      condoValue: '',
      iptuValue: '',
      description: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCounter = (field: 'bedrooms' | 'bathrooms' | 'parking', operation: 'inc' | 'dec') => {
      setFormData(prev => ({
          ...prev,
          [field]: operation === 'inc' ? prev[field] + 1 : Math.max(0, prev[field] - 1)
      }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setCoverImage(ev.target.result as string);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const fetchCep = async () => {
      const cleanCep = formData.cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) return;

      setLoadingCep(true);
      try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await response.json();
          if (!data.erro) {
              setFormData(prev => ({
                  ...prev,
                  street: data.logradouro,
                  neighborhood: data.bairro,
                  city: data.localidade,
                  state: data.uf
              }));
          }
      } catch (error) {
          console.error("Erro ao buscar CEP");
      } finally {
          setLoadingCep(false);
      }
  };

  return (
    <ModalWrapper onClose={onClose} className="md:max-w-2xl" title="Novo Imóvel" showCloseButton={true}>
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            
            {/* 1. Mídia / Capa */}
            <div className="p-6 pb-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">Foto de Capa</label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-48 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
                        coverImage 
                        ? 'border-transparent' 
                        : 'border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-white/5 hover:border-primary hover:bg-primary/5'
                    }`}
                >
                    {coverImage ? (
                        <>
                            <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold flex items-center gap-2"><UploadCloud size={20} /> Trocar Foto</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-primary transition-colors">
                            <div className="p-3 bg-white dark:bg-white/10 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                <ImageIcon size={24} />
                            </div>
                            <span className="text-sm font-bold">Clique para adicionar uma foto</span>
                            <span className="text-xs">JPG ou PNG (Max 5MB)</span>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
            </div>

            <div className="p-6 space-y-8">
                
                {/* 2. Informações Básicas */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Home size={14} /> Informações Básicas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Apelido do Imóvel <span className="text-primary">*</span></label>
                            <input 
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                                placeholder="Ex: Studio Centro"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo de Imóvel <span className="text-primary">*</span></label>
                            <div className="relative">
                                <select 
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full appearance-none px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                                >
                                    <option value="" disabled>Selecione</option>
                                    <option value="Apartamento">Apartamento</option>
                                    <option value="Kitnet">Kitnet</option>
                                    <option value="Studio">Studio</option>
                                    <option value="Casa">Casa</option>
                                    <option value="Comercial">Sala Comercial</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-white/5" />

                {/* 3. Localização (CEP Integration) */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin size={14} /> Localização
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-40 space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">CEP</label>
                                <div className="relative">
                                    <input 
                                        name="cep"
                                        value={formData.cep}
                                        onChange={handleInputChange}
                                        onBlur={fetchCep}
                                        maxLength={9}
                                        className="w-full pl-4 pr-9 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                                        placeholder="00000-000"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        {loadingCep ? <Loader2 size={16} className="animate-spin text-primary" /> : <Search size={16} />}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Endereço</label>
                                <input 
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 outline-none dark:text-white"
                                    placeholder="Rua, Avenida..."
                                    readOnly={!!formData.street} // Readonly if fetched
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Número <span className="text-primary">*</span></label>
                                <input 
                                    name="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Complemento</label>
                                <input 
                                    name="complement"
                                    value={formData.complement}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                                    placeholder="Apt 101"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bairro</label>
                                <input 
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 outline-none dark:text-white"
                                    readOnly={!!formData.neighborhood}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-white/5" />

                {/* 4. Características */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={14} /> Características
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Área (m²)</label>
                            <input 
                                name="area"
                                type="number"
                                value={formData.area}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                                placeholder="0"
                            />
                        </div>
                        
                        {/* Counters */}
                        {[
                            { label: 'Quartos', field: 'bedrooms', icon: BedDouble },
                            { label: 'Banheiros', field: 'bathrooms', icon: Bath },
                            { label: 'Vagas', field: 'parking', icon: Car }
                        ].map((item) => (
                            <div key={item.field} className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <item.icon size={14} className="text-slate-400" /> {item.label}
                                </label>
                                <div className="flex items-center justify-between bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2">
                                    <button 
                                        onClick={() => handleCounter(item.field as any, 'dec')}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                    >-</button>
                                    <span className="font-bold text-slate-900 dark:text-white">{(formData as any)[item.field]}</span>
                                    <button 
                                        onClick={() => handleCounter(item.field as any, 'inc')}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                    >+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-white/5" />

                {/* 5. Financeiro */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DollarSign size={14} /> Composição Financeira
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Aluguel</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                                <input 
                                    name="rentValue"
                                    type="number"
                                    value={formData.rentValue}
                                    onChange={handleInputChange}
                                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-emerald-900 dark:text-emerald-100"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Condomínio</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                                <input 
                                    name="condoValue"
                                    type="number"
                                    value={formData.condoValue}
                                    onChange={handleInputChange}
                                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">IPTU (Mensal)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                                <input 
                                    name="iptuValue"
                                    type="number"
                                    value={formData.iptuValue}
                                    onChange={handleInputChange}
                                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-4"></div>
            </div>
        </div>

        <div className="flex-none p-6 pt-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-white/5 z-20 flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={() => onSave(formData)}
                className="flex-[2] group h-12 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200"
            >
                Salvar Imóvel
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
        </div>
    </ModalWrapper>
  );
};
