import { contractService } from '../tenancy/contractService';
import { maintenanceService } from '../maintenance/maintenanceService';

export async function executeWorkflowAction(endpoint: string): Promise<void> {
  const matchContract = endpoint.match(/\/api\/contracts\/([^/]+)\/renew/);
  const matchMaintenance = endpoint.match(/\/api\/manutencao\/([^/]+)\/resolve/);
  const matchPriceSuggestion = endpoint === '/api/imoveis/sugestao-preco';
  const matchRepair = endpoint === '/api/manutencao/resolver';

  if (matchContract) {
    const id = matchContract[1];
    const existing = await contractService.getById(id);
    if (!existing) throw new Error('Contrato não encontrado');

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    await contractService.renew(id, {
      newEndDate: endDate.toISOString(),
      newValue: existing.numeric_value || 0,
      observations: 'Renovação automática via Governance Hub',
    });
  } else if (matchMaintenance) {
    const id = matchMaintenance[1];
    await maintenanceService.update(id, { status: 'resolved' });
  } else if (matchPriceSuggestion || matchRepair) {
    // Placeholder para lógica futura de precificação em lote
    console.warn('Ação em lote ainda não implementada:', endpoint);
  } else {
    console.warn('Endpoint de ação não reconhecido:', endpoint);
  }
}
