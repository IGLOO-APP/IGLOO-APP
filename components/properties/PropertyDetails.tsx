import React, { useState } from 'react';
import { MapPin, User, Phone, Mail, FileText, Calendar, CheckCircle, DollarSign, ClipboardCheck } from 'lucide-react';
import { Property } from '../../types';
import { ModalWrapper } from '../ui/ModalWrapper';
import { PropertyInspection } from './PropertyInspection';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose }) => {
  const [showInspections, setShowInspections] = useState(false);

  return (
    <>
      <ModalWrapper onClose={onClose} className="md:max-w-2xl bg-background-light dark:bg-background-dark">
          {/* Cover Image */}
          <div className="h-64 w-full bg-cover bg-center shrink-0 relative" style={{ backgroundImage: `url(${property.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset uppercase tracking-wide mb-2 bg-white/90 backdrop-blur-sm ${property.status_color?.replace('bg-', 'text-').replace('/10', '')}`}>
                      {property.status}
                  </span>
                  <h2 className="text-2xl font-bold text-white leading-tight shadow-sm">{property.name}</h2>
                  <p className="text-gray-200 text-sm flex items-center gap-1 mt-1 font-medium">
                      <MapPin size={16} /> {property.address}
                  </p>
              </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background-light dark:bg-background-dark">
              
              {/* Actions Row */}
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                  <button 
                      onClick={() => setShowInspections(true)}
                      className="flex-1 min-w-[140px] h-14 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center shadow-sm hover:border-primary/50 transition-colors group"
                  >
                      <ClipboardCheck className="text-slate-400 group-hover:text-primary mb-1" size={24} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Vistorias</span>
                  </button>
                  {/* Placeholder buttons for future features */}
                  <button className="flex-1 min-w-[140px] h-14 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center shadow-sm opacity-50 cursor-not-allowed">
                      <FileText className="text-slate-400 mb-1" size={24} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Documentos</span>
                  </button>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Valor Aluguel</p>
                      <p className="text-slate-900 dark:text-white text-xl font-bold mt-0.5">{property.price}</p>
                  </div>
                  <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Área Total</p>
                      <p className="text-slate-900 dark:text-white text-xl font-bold mt-0.5">{property.area}</p>
                  </div>
              </div>

              {/* Tenant Info */}
              {property.tenant ? (
                  <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                              <User size={20} className="text-primary" />
                              Inquilino Atual
                          </h3>
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Em dia</span>
                      </div>
                      <div className="flex items-center gap-4 mb-5">
                          <div className="h-14 w-14 rounded-full bg-cover bg-center border-2 border-slate-100 dark:border-gray-700" style={{ backgroundImage: `url(${property.tenant.image})` }}></div>
                          <div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">{property.tenant.name}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">Contrato vigente</p>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <button className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-sm transition-colors">
                              <Phone size={18} /> Ligar
                          </button>
                          <button className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-sm transition-colors">
                              <Mail size={18} /> Email
                          </button>
                      </div>
                  </div>
              ) : (
                      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-dashed border-gray-300 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-slate-400">
                          <User size={24} />
                      </div>
                      <h3 className="text-slate-900 dark:text-white font-bold">Imóvel Vago</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Este imóvel está disponível para locação.</p>
                      <button className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors">
                          Anunciar Imóvel
                      </button>
                  </div>
              )}

              {/* Contract Info */}
              {property.contract && (
                      <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                              <FileText size={20} className="text-indigo-500" />
                              Detalhes do Contrato
                          </h3>
                          <button className="text-primary text-xs font-bold hover:underline">Ver PDF</button>
                      </div>
                      <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                              <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2"><Calendar size={16} /> Início</span>
                              <span className="text-slate-900 dark:text-white font-semibold text-sm">{property.contract.start_date}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                              <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2"><CheckCircle size={16} /> Término</span>
                              <span className="text-slate-900 dark:text-white font-semibold text-sm">{property.contract.end_date}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                              <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2"><DollarSign size={16} /> Valor Mensal</span>
                              <span className="text-slate-900 dark:text-white font-bold text-sm">{property.contract.value}</span>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </ModalWrapper>

      {showInspections && (
        <PropertyInspection 
          property={property} 
          onClose={() => setShowInspections(false)} 
        />
      )}
    </>
  );
};