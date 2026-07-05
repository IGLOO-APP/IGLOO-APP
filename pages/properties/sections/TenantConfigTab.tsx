import React from 'react';
import { TenantProfileConfigPanel } from '../../../components/properties/TenantProfileConfigPanel';
import type { Property } from '../../../types';

interface TenantConfigTabProps {
  property: Property;
}

export const TenantConfigTab: React.FC<TenantConfigTabProps> = ({ property }) => {
  return (
    <div className='animate-fadeIn'>
      <TenantProfileConfigPanel propertyId={property.id.toString()} />
    </div>
  );
};
