import { propertyService } from '../services/propertyService';

/**
 * Hook para gerenciar serviços de propriedades.
 * Centraliza o acesso ao propertyService para manter compatibilidade com componentes existentes.
 */
export const usePropertyService = () => {
  return {
    getAll: propertyService.getAll,
    getById: propertyService.getById,
    create: propertyService.create,
    update: propertyService.update,
    delete: propertyService.delete,
  };
};

