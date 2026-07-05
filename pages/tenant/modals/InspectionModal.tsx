import React from 'react';
import { ModalWrapper } from '../../../components/ui/ModalWrapper';
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
  if (!show || !property) return null;

  return (
    <ModalWrapper onClose={onClose} className='md:max-w-5xl' showCloseButton={true}>
      <PropertyInspection
        property={property}
        onClose={onClose}
        initialView={initialView}
        isTenant={isTenant}
      />
    </ModalWrapper>
  );
};
