import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PropertyInspection } from '../../../components/properties/PropertyInspection';
import { Property } from '../../../types';

interface InspectionModalProps {
  show: boolean;
  property: Property | null;
  onClose: () => void;
  initialView?: 'list' | 'detail';
  isTenant?: boolean;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  show,
  property,
  onClose,
  initialView = 'list',
  isTenant = true,
}) => {
  if (!property) return null;

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-5xl'>
        <PropertyInspection
          property={property}
          onClose={onClose}
          initialView={initialView}
          isTenant={isTenant}
        />
      </DialogContent>
    </Dialog>
  );
};
