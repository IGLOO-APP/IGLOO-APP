import React from 'react';
import { Property } from '../../../types';
import { PropertyDocuments } from '../../../components/properties/PropertyDocuments';

interface DocsTabProps {
  property: Property;
}

export const DocsTab: React.FC<DocsTabProps> = ({ property }) => {
  return (
    <div className='animate-fadeIn'>
      <PropertyDocuments property={property} onClose={() => {}} inline={true} />
    </div>
  );
};
