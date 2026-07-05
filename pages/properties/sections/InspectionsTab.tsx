import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Property } from '../../../types';
import { PropertyInspection } from '../../../components/properties/PropertyInspection';

interface InspectionsTabProps {
  property: Property;
}

export const InspectionsTab: React.FC<InspectionsTabProps> = ({ property }) => {
  const [, setSearchParams] = useSearchParams();

  return (
    <div className='animate-fadeIn'>
      <PropertyInspection
        property={property}
        onClose={() => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('tab', 'overview');
            return next;
          });
        }}
      />
    </div>
  );
};
