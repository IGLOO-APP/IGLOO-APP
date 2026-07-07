import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  ExternalLink,
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  CheckCircle,
  PenTool,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { contractService } from '../../services/tenancy/contractService';
import { Contract } from '../../types';
import { getStatusLabel } from '../../utils/contractLogic';

interface ContextType {
  isOnboardingRequired: boolean;
  loadingOnboarding: boolean;
  tenantData: any;
  pendingInspection: any;
  refetchOnboarding: () => void;
}

const TenantContract: React.FC = () => {
  const { tenantData } = useOutletContext<ContextType>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContract = async () => {
      if (!tenantData?.contracts?.length) {
        setLoading(false);
        return;
      }
      try {
        const contractId = tenantData.contracts[0].id;
        const data = await contractService.getById(contractId);
        setContract(data);
      } catch (err) {
        console.error('Error loading contract:', err);
      } finally {
        setLoading(false);
      }
    };
    loadContract();
  }, [tenantData]);

  if (loading) {
    return (
      <div className='min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto space-y-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-64' />
        <Card>
          <CardContent className='grid grid-cols-2 gap-4 pt-6'>
            <Skeleton className='h-16' />
            <Skeleton className='h-16' />
            <Skeleton className='h-16' />
            <Skeleton className='h-16' />
            <Skeleton className='h-2 col-span-2' />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background p-6'>
        <Card className='max-w-md'>
          <CardHeader className='items-center text-center pb-2'>
            <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
              <FileText size={40} className='text-muted-foreground' />
            </div>
            <CardTitle>Nenhum contrato encontrado</CardTitle>
            <CardDescription>Você ainda não possui um contrato de locação ativo.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const calculateProgress = () => {
    const start = new Date(contract.start_date).getTime();
    const end = new Date(contract.end_date).getTime();
    const now = new Date().getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  return (
    <div className='min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>Meu Contrato</h1>
          <p className='text-sm text-muted-foreground'>Detalhes do contrato de locação</p>
        </div>
        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
          {getStatusLabel(contract.status)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Informações do Contrato</CardTitle>
          <CardDescription>Ref: {contract.contract_number}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
                <Building2 size={14} className='text-primary' /> Imóvel
              </span>
              <p className='text-sm font-medium text-card-foreground'>{contract.property}</p>
            </div>
            <div className='space-y-1.5'>
              <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
                <User size={14} className='text-primary' /> Proprietário
              </span>
              <p className='text-sm font-medium text-card-foreground'>{contract.owner_name}</p>
            </div>
            <div className='space-y-1.5'>
              <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
                <Calendar size={14} className='text-primary' /> Início
              </span>
              <p className='text-sm font-medium text-card-foreground'>
                {new Date(contract.start_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className='space-y-1.5'>
              <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
                <Calendar size={14} className='text-primary' /> Término
              </span>
              <p className='text-sm font-medium text-card-foreground'>
                {new Date(contract.end_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <Separator />

          <div className='flex items-center justify-between rounded-lg border bg-card p-4'>
            <div className='space-y-0.5'>
              <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
                <DollarSign size={14} className='text-emerald-500' /> Valor Mensal
              </span>
              <p className='text-lg font-semibold text-emerald-600 dark:text-emerald-400'>
                {contract.value}
              </p>
              <p className='text-xs text-muted-foreground'>Vencimento dia {contract.payment_day}</p>
            </div>
          </div>

          <Separator />

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-xs text-muted-foreground'>Vigência</span>
              <span className='text-xs font-medium text-primary'>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} />
          </div>
        </CardContent>
      </Card>

      {contract.security_deposit && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <DollarSign size={16} className='text-primary' /> Garantia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Caução:{' '}
              <span className='font-medium text-card-foreground'>
                R${' '}
                {contract.security_deposit.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {contract.condominium_value && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <DollarSign size={16} className='text-primary' /> Encargos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <dt className='text-xs text-muted-foreground'>Condomínio</dt>
                <dd className='text-sm font-medium text-card-foreground'>
                  R${' '}
                  {contract.condominium_value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </dd>
              </div>
              {contract.iptu_value && (
                <div className='space-y-1'>
                  <dt className='text-xs text-muted-foreground'>IPTU</dt>
                  <dd className='text-sm font-medium text-card-foreground'>
                    R${' '}
                    {contract.iptu_value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {contract.signers && contract.signers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <PenTool size={16} className='text-primary' /> Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {contract.signers.map((signer, idx) => (
              <div
                key={signer.id || idx}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  {signer.status === 'signed' ? (
                    <CheckCircle size={18} className='text-emerald-500' />
                  ) : (
                    <Clock size={18} className='text-amber-500' />
                  )}
                  <div>
                    <p className='text-sm font-medium leading-none text-card-foreground'>
                      {signer.name}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {signer.role === 'owner'
                        ? 'Proprietário'
                        : signer.role === 'tenant'
                          ? 'Inquilino'
                          : 'Fiador'}
                    </p>
                  </div>
                </div>
                <Badge variant={signer.status === 'signed' ? 'default' : 'outline'}>
                  {signer.status === 'signed' ? 'Assinou' : 'Pendente'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {contract.pdf_url && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <FileText size={16} className='text-primary' /> Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant='secondary' className='w-full' asChild>
              <a href={contract.pdf_url} target='_blank' rel='noopener noreferrer'>
                <ExternalLink size={16} />
                Visualizar Contrato Completo
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantContract;
