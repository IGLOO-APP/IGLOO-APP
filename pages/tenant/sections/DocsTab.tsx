import React from 'react';
import { FileText, Search, Download } from 'lucide-react';
import { isValidUrl } from '../../../utils/validation';

interface DocsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenant: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docs: any[];
  onOpenPreview: (url: string, title: string, id?: string) => void;
}

export const DocsTab: React.FC<DocsTabProps> = ({ tenant, docs, onOpenPreview }) => {
  return (
    <div className='animate-fadeIn space-y-6'>
      {tenant.contract && (
        <div className='lg-card lg-card-lift p-6 space-y-4'>
          <div className='flex items-center justify-between border-b border-border pb-3'>
            <div className='flex items-center gap-2'>
              <FileText size={18} strokeWidth={1.8} className='text-primary' />
              <div>
                <h4 className='text-xs font-semibold text-foreground'>
                  Contrato de Locação Padrão
                </h4>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  CTR-{String(tenant.contract.id).substring(0, 6).toUpperCase()}
                </p>
              </div>
            </div>
            <span className='px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider'>
              Vigente
            </span>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-xs'>
            <div>
              <span className='text-xs text-muted-foreground block'>Valor do Aluguel</span>
              <span className='font-semibold text-foreground'>
                R${' '}
                {Number(tenant.contract.monthly_value || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div>
              <span className='text-xs text-muted-foreground block'>Status da Assinatura</span>
              <span
                className={`font-black uppercase tracking-wider text-[10px] ${tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}
              >
                {tenant.onboarding_contract_status === 'approved' ||
                tenant.contract?.status === 'active'
                  ? 'Finalizada'
                  : 'Pendente'}
              </span>
            </div>
            <div>
              <span className='text-xs text-muted-foreground block'>Garantia Locatícia</span>
              <span className='font-semibold text-foreground'>Seguro Fiança / Caução</span>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-4'>
        <h3 className='text-xs font-semibold text-foreground flex items-center gap-1.5 px-1'>
          Documentos Digitais
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {tenant.contract && (
            <div className='flex items-center justify-between lg-card lg-card-lift p-6 hover:border-primary/20 min-h-[80px]'>
              <div className='flex items-center gap-3.5 min-w-0'>
                <div className='w-10 h-10 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm flex items-center justify-center shrink-0'>
                  <FileText size={20} strokeWidth={1.8} />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs font-semibold text-foreground truncate'>
                    Contrato de Locação Assinado
                  </p>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    PDF • {new Date(tenant.contract.start_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() =>
                    onOpenPreview(
                      tenant.contract!.pdf_url!,
                      'Contrato de Locação',
                      `contract-${tenant.contract!.id}`
                    )
                  }
                  className='w-8 h-8 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shrink-0'
                  title='Visualizar Contrato'
                >
                  <Search size={14} strokeWidth={1.8} />
                </button>
                <button
                  onClick={() =>
                    tenant.contract?.pdf_url &&
                    isValidUrl(tenant.contract.pdf_url) &&
                    window.open(tenant.contract.pdf_url, '_blank', 'noopener,noreferrer')
                  }
                  className='w-8 h-8 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shrink-0'
                  title='Baixar Contrato'
                >
                  <Download size={14} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          )}
          {docs.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            docs.map((doc: any, idx: number) => (
              <div
                key={idx}
                className='flex items-center justify-between lg-card lg-card-lift p-6 hover:border-primary/20 min-h-[80px] transition-all duration-200'
              >
                <div className='flex items-center gap-3.5 min-w-0'>
                  <div className='w-10 h-10 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm flex items-center justify-center text-muted-foreground shrink-0'>
                    <FileText size={20} strokeWidth={1.8} />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-xs font-semibold text-foreground truncate'>{doc.name}</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {doc.type || 'PDF'} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => onOpenPreview(doc.url, doc.name, doc.id)}
                    className='w-8 h-8 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shrink-0'
                    title='Visualizar Documento'
                  >
                    <Search size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => {
                      if (doc.url && isValidUrl(doc.url))
                        window.open(doc.url, '_blank', 'noopener,noreferrer');
                    }}
                    className='w-8 h-8 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shrink-0'
                    title='Baixar Documento'
                  >
                    <Download size={14} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className='md:col-span-2 lg-card lg-card-lift p-12 text-center'>
              <p className='text-muted-foreground text-xs font-bold'>
                Nenhum documento complementar anexado pelo inquilino.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
