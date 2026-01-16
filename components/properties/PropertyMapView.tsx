import React, { useState, useMemo, useRef } from 'react';
import { Home, Search, Building2, Flame, TrendingUp, Plus, Minus, Navigation, Layers, X, MapPin, List, ArrowRight } from 'lucide-react';
import { Property } from '../../types';

interface PropertyMapViewProps {
  properties: Property[];
  onBack: () => void;
}

const expansionOpportunities = [
  { 
      id: 'exp1', 
      name: 'Prédio Comercial em Leilão', 
      address: 'Av. Paulista, 2000', 
      price: 'R$ 850.000', 
      type: 'opportunity', 
      top: '40%', 
      left: '60%',
      roi: '15% a.a.',
      status: 'LEILÃO',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300'
  },
  { 
      id: 'exp2', 
      name: 'Terreno Zona Norte', 
      address: 'Rua Voluntários, 123', 
      price: 'R$ 420.000', 
      type: 'opportunity', 
      top: '20%', 
      left: '45%',
      roi: '22% a.a.',
      status: 'VENDA',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=300'
  },
  { 
      id: 'exp3', 
      name: 'Apartamento Reforma', 
      address: 'Rua Augusta, 800', 
      price: 'R$ 380.000', 
      type: 'opportunity', 
      top: '55%', 
      left: '35%',
      roi: '18% a.a.',
      status: 'OPORTUNIDADE',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=300'
  },
];

export const PropertyMapView: React.FC<PropertyMapViewProps> = ({ properties, onBack }) => {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['properties']);
  const [searchTerm, setSearchTerm] = useState('');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Map Navigation State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const getCoordinates = (index: number) => {
    const positions = [
        { top: '50%', left: '50%' },
        { top: '30%', left: '25%' },
        { top: '65%', left: '75%' },
        { top: '25%', left: '70%' },
        { top: '70%', left: '30%' },
    ];
    return positions[index % positions.length];
  };

  const toggleLayer = (layer: string) => {
    if (activeLayers.includes(layer)) {
      setActiveLayers(activeLayers.filter(l => l !== layer));
    } else {
      setActiveLayers([...activeLayers, layer]);
    }
  };

  const handlePinClick = (id: string | number) => {
    setSelectedId(id);
    setBottomSheetOpen(true);
  };

  // Zoom Handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const visibleItems = useMemo(() => {
    let items: any[] = [];
    
    if (activeLayers.includes('properties')) {
      items = [...items, ...properties.map((p, i) => ({ ...p, type: 'property', ...getCoordinates(i) }))];
    }
    
    if (activeLayers.includes('expansion')) {
      items = [...items, ...expansionOpportunities];
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(lower) || i.address.toLowerCase().includes(lower));
    }

    return items;
  }, [activeLayers, properties, searchTerm]);

  const selectedItem = visibleItems.find(i => i.id === selectedId);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-100 dark:bg-slate-900 font-sans">
      
      {/* Map Canvas */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center origin-center will-change-transform" 
        style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBg2hJrVlXyFhowT4lpA7MSKs1UeugFAUnJ8_twIuf6OCGT-hkYxI-nQt6fRMj3hFy0LyAsAZYPg21fYDplAUa9VYmvGJXJf9Q3tp7cOoBK9UB5amJYAvwsBR0Ts0S3aydWE7IWareyL59VwSLEMc2qJ3WkH7NCf5sJfC3P4p2m_6KYK83L6QCGvD6sSfPh-EhSbtAL-sb_gfXgHTLjbXMtQmdPRv3y14eQiyKtWvsaqsCglIjICh-MD00DnnKeTMS6wreJZxfG1O1')",
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => { setBottomSheetOpen(false); }}
      >
        <div className="absolute inset-0 bg-white/60 dark:bg-[#101f22]/60 backdrop-blur-[1px]"></div>
        
        {/* Heatmap Overlay */}
        <div 
            className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${activeLayers.includes('heatmap') ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
                background: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.25) 0%, transparent 40%), radial-gradient(circle at 25% 30%, rgba(239, 68, 68, 0.2) 0%, transparent 35%)',
                mixBlendMode: 'multiply' 
            }}
        ></div>

        {/* Pins */}
        {visibleItems.map(item => (
            <div 
                key={item.id}
                style={{ top: item.top, left: item.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group hover:z-50"
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking pin
                onClick={(e) => { e.stopPropagation(); handlePinClick(item.id); }}
            >
                <div className={`relative flex items-center justify-center transition-transform duration-300 ${selectedId === item.id ? 'scale-125 z-20' : 'hover:scale-110'}`}>
                    
                    {selectedId === item.id && (
                        <div className={`w-12 h-12 rounded-full absolute animate-ping opacity-75 ${item.type === 'opportunity' ? 'bg-indigo-500/30' : 'bg-primary/30'}`}></div>
                    )}

                    <div className={`w-10 h-10 rounded-full border-2 shadow-lg flex items-center justify-center transition-colors 
                        ${item.type === 'opportunity' 
                            ? (selectedId === item.id ? 'bg-indigo-600 border-white text-white' : 'bg-white border-indigo-600 text-indigo-600')
                            : (selectedId === item.id ? 'bg-primary border-white text-white' : 'bg-white border-primary text-primary')
                        }
                    `}>
                        {item.type === 'opportunity' ? (
                            <TrendingUp size={18} fill="currentColor" />
                        ) : (
                            <Home size={18} fill="currentColor" />
                        )}
                    </div>
                    
                    {/* Tooltip Label (scales inversely to stay readable-ish, or let it scale) */}
                    <div 
                        className={`absolute -top-10 bg-white dark:bg-surface-dark px-2.5 py-1.5 rounded-lg shadow-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border border-gray-100 dark:border-gray-700
                        ${selectedId === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
                        `}
                        style={{ transform: `scale(${1/scale})` }} // Optional: Inverse scale to keep text size constant
                    >
                        <span className="text-slate-900 dark:text-white">{item.price}</span>
                        <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white dark:border-t-surface-dark"></div>
                    </div>
                </div>
                <div className="w-1 h-3 bg-black/20 rounded-full mt-1 mx-auto blur-[1px]"></div>
            </div>
        ))}
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full z-20 flex flex-col gap-3 px-4 pt-4 pb-4 bg-gradient-to-b from-white/95 via-white/80 to-transparent dark:from-black/90 dark:via-black/60 pointer-events-none">
        
        <div className="flex gap-2 pointer-events-auto">
            <div className="flex-1 shadow-lg shadow-black/5 rounded-xl">
                <label className="flex flex-col h-11">
                    <div className="flex w-full flex-1 items-stretch rounded-xl bg-white dark:bg-surface-dark overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-primary transition-all">
                        <div className="text-slate-400 dark:text-slate-500 flex border-none items-center justify-center pl-3 rounded-l-xl">
                            <Search size={18} />
                        </div>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-white border-none bg-transparent h-full placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 pl-2 text-sm font-medium focus:ring-0" 
                            placeholder="Endereço ou apelido..." 
                        />
                    </div>
                </label>
            </div>

            <button 
                onClick={onBack}
                className="h-11 px-4 bg-white dark:bg-surface-dark text-slate-700 dark:text-white rounded-xl shadow-lg shadow-black/5 ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
                <List size={16} /> <span className="hidden sm:inline">Voltar para Lista</span>
            </button>
        </div>
        
        <div className="pointer-events-auto flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button 
                onClick={() => toggleLayer('properties')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 shadow-sm transition-all active:scale-95 border ${
                    activeLayers.includes('properties') 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' 
                    : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
            >
                <Building2 size={16} />
                <p className="text-xs font-bold leading-normal">Meus Imóveis</p>
            </button>

            <button 
                onClick={() => toggleLayer('heatmap')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 shadow-sm transition-all active:scale-95 border ${
                    activeLayers.includes('heatmap') 
                    ? 'bg-orange-500 text-white border-orange-600' 
                    : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
            >
                <Flame size={16} />
                <p className="text-xs font-bold leading-normal">Mapa de Calor</p>
            </button>
            
            <button 
                onClick={() => toggleLayer('expansion')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 shadow-sm transition-all active:scale-95 border ${
                    activeLayers.includes('expansion') 
                    ? 'bg-indigo-600 text-white border-indigo-700' 
                    : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
            >
                <TrendingUp size={16} />
                <p className="text-xs font-bold leading-normal">Expansão</p>
            </button>
        </div>
      </div>

      {/* Map Controls - Consolidated Vertical Stack */}
      <div className="absolute right-4 top-40 z-20 flex flex-col gap-4 pointer-events-none">
        
        {/* Layers / Map Style Toggle */}
        <button 
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-surface-dark shadow-lg shadow-black/5 ring-1 ring-slate-100 dark:ring-white/10 pointer-events-auto text-slate-700 dark:text-slate-200 hover:text-primary transition-colors active:scale-95"
            title="Camadas"
        >
            <Layers size={22} />
        </button>

        {/* Zoom Group */}
        <div className="flex flex-col gap-0.5 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-surface-dark pointer-events-auto ring-1 ring-slate-100 dark:ring-white/10">
            <button 
                onClick={handleZoomIn}
                className="flex h-11 w-11 items-center justify-center bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Zoom In"
            >
                <Plus size={22} />
            </button>
            <div className="h-[1px] w-full bg-slate-100 dark:bg-white/10"></div>
            <button 
                onClick={handleZoomOut}
                className="flex h-11 w-11 items-center justify-center bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Zoom Out"
            >
                <Minus size={22} />
            </button>
        </div>

        {/* Reset / Center Location */}
        <button 
            onClick={handleReset}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-surface-dark shadow-lg shadow-black/5 ring-1 ring-slate-100 dark:ring-white/10 pointer-events-auto text-slate-700 dark:text-slate-200 hover:text-primary active:scale-95 transition-all"
            title="Resetar Visão"
        >
            <Navigation size={22} className={scale !== 1 || position.x !== 0 ? 'text-primary fill-primary/20' : ''} />
        </button>
      </div>

      {/* Bottom Sheet Details */}
      <div className={`absolute bottom-0 left-0 w-full z-30 flex flex-col justify-end pointer-events-none transition-transform duration-300 ease-out ${bottomSheetOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}>
        <div className="w-full bg-surface-light dark:bg-surface-dark rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] pointer-events-auto pb-6 relative ring-1 ring-black/5 dark:ring-white/10">
            <div 
                className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
            >
                <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <button 
                onClick={() => setBottomSheetOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
            >
                <X size={16} />
            </button>
            
            {selectedItem && (
                <div className="px-5 pb-2">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div 
                                className="w-24 h-24 rounded-xl bg-cover bg-center shrink-0 shadow-sm relative overflow-hidden group" 
                                style={{ backgroundImage: `url('${selectedItem.image}')` }}
                            >
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="flex flex-col flex-1 justify-between py-0.5 min-w-0">
                                <div>
                                    <div className="flex justify-between items-start">
                                        {selectedItem.type === 'opportunity' ? (
                                             <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 uppercase tracking-wide">
                                                {selectedItem.status}
                                             </span>
                                        ) : (
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset uppercase tracking-wide ${selectedItem.status_color?.replace('bg-', 'text-').replace('/10', '') || 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'}`}>
                                                {selectedItem.status}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white leading-tight truncate pr-4">{selectedItem.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-1 flex items-center gap-1">
                                        <MapPin size={12} /> {selectedItem.address}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-2.5 flex flex-col items-center justify-center border border-slate-100 dark:border-white/5">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">{selectedItem.type === 'opportunity' ? 'Investimento' : 'Aluguel'}</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedItem.price}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-2.5 flex flex-col items-center justify-center border border-slate-100 dark:border-white/5">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">{selectedItem.type === 'opportunity' ? 'Retorno Est.' : 'Contrato'}</span>
                                <span className={`text-sm font-bold mt-0.5 ${selectedItem.type === 'opportunity' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                    {selectedItem.type === 'opportunity' ? selectedItem.roi : 'Ativo'}
                                </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-2.5 flex flex-col items-center justify-center border border-slate-100 dark:border-white/5">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">{selectedItem.type === 'opportunity' ? 'Risco' : 'Próx. Venc'}</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                     {selectedItem.type === 'opportunity' ? 'Médio' : '10/Out'}
                                </span>
                            </div>
                        </div>

                        {selectedItem.type === 'opportunity' ? (
                            <button className="w-full group flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors gap-2 px-4 shadow-lg shadow-indigo-600/20 active:scale-95">
                                <span className="text-sm font-bold leading-normal tracking-wide">Analisar Oportunidade</span>
                                <TrendingUp size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button className="w-full group flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-primary text-white hover:bg-primary-dark transition-colors gap-2 px-4 shadow-lg shadow-primary/20 active:scale-95">
                                <span className="text-sm font-bold leading-normal tracking-wide">Gerenciar Imóvel</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};