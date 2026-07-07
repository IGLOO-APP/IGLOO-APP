import { contractService } from '../tenancy/contractService';
import { maintenanceService } from '../maintenance/maintenanceService';

// Orquestrador de workflows para gerar ações automáticas
export const workflowOrchestrator = {
  async getUnifiedPendingActions(ownerId: string) {
    const actions: any[] = [];

    // 1. Contratos: Verificar renovações
    const expiringContracts = await contractService.getExpiring(ownerId);
    expiringContracts.forEach(c => {
      actions.push({
        id: `renew-${c.id}`,
        title: `Renovar contrato: ${c.tenant_name}`,
        type: 'tenancy',
        priority: 'high',
        acao_pendente: {
          label: 'Renovar agora',
          endpoint: `/api/contracts/${c.id}/renew`
        }
      });
    });

    // 2. Manutenção: Verificar reparos pendentes
    const pendingMaintenance = await maintenanceService.getPending(ownerId);
    pendingMaintenance.forEach(m => {
      actions.push({
        id: `repair-${m.id}`,
        title: `Manutenção: ${m.title}`,
        type: 'maintenance',
        priority: 'medium',
        acao_pendente: {
          label: 'Ver reparo',
          endpoint: `/api/manutencao/${m.id}/resolve`
        }
      });
    });

    return actions;
  }
};
