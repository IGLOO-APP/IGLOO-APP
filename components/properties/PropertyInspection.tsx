import React from 'react';
import { Property } from '../../types';
import { usePropertyInspection, ROOM_TEMPLATES } from './hooks/usePropertyInspection';
import { InspectionListView } from './sections/InspectionListView';
import { InspectionCreateForm } from './sections/InspectionCreateForm';
import { InspectionDetailView } from './sections/InspectionDetailView';
import { InspectionCompareView } from './sections/InspectionCompareView';
import { SignatureModal } from './sections/SignatureModal';

interface PropertyInspectionProps {
  property: Property;
  onClose: () => void;
  initialView?: 'list' | 'detail';
  isTenant?: boolean;
}

export const PropertyInspection: React.FC<PropertyInspectionProps> = ({
  property,
  initialView = 'list',
  isTenant = false,
}) => {
  const {
    view,
    setView,
    inspections,
    selectedForComparison,
    setSelectedForComparison,
    selectedInspection,
    selectedInspectionRooms,
    selectedInspectionSignatures,
    compareIns1,
    compareIns2,
    compareRooms1,
    compareRooms2,
    isLoading,
    isSubmitting,
    uploadingRoom,
    uploadingVideoRoom,
    newType,
    setNewType,
    newDate,
    setNewDate,
    newInspector,
    setNewInspector,
    newVisibility,
    setNewVisibility,
    newRooms,
    setNewRooms,
    expandedRoom,
    setExpandedRoom,
    newGeneralNotes,
    setNewGeneralNotes,
    newPendingItems,
    setNewPendingItems,
    showSignModal,
    setShowSignModal,
    signName,
    setSignName,
    signCpf,
    setSignCpf,
    fetchInspectionDetails,
    handleCreateInspection,
    handlePhotoUpload,
    handleRemovePhoto,
    handleVideoUpload,
    handleRemoveVideo,
    handleOpenSignature,
    handleSignInspection,
    handleComparison,
    toggleSelectForComparison,
  } = usePropertyInspection({ property, initialView, isTenant });

  return (
    <div className='flex-1 overflow-hidden flex flex-col h-full text-slate-900 dark:text-white relative'>
      {view === 'list' && (
        <InspectionListView
          inspections={inspections}
          isLoading={isLoading}
          isTenant={isTenant}
          selectedForComparison={selectedForComparison}
          propertyName={property.name}
          onToggleSelect={toggleSelectForComparison}
          onCompare={handleComparison}
          onViewDetail={fetchInspectionDetails}
          onCreateNew={() => setView('create')}
        />
      )}

      {view === 'create' && (
        <InspectionCreateForm
          newType={newType}
          setNewType={setNewType}
          newDate={newDate}
          setNewDate={setNewDate}
          newInspector={newInspector}
          setNewInspector={setNewInspector}
          newVisibility={newVisibility}
          setNewVisibility={setNewVisibility}
          newRooms={newRooms}
          setNewRooms={setNewRooms}
          expandedRoom={expandedRoom}
          setExpandedRoom={setExpandedRoom}
          newGeneralNotes={newGeneralNotes}
          setNewGeneralNotes={setNewGeneralNotes}
          newPendingItems={newPendingItems}
          setNewPendingItems={setNewPendingItems}
          isSubmitting={isSubmitting}
          uploadingRoom={uploadingRoom}
          uploadingVideoRoom={uploadingVideoRoom}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={handleRemovePhoto}
          onVideoUpload={handleVideoUpload}
          onRemoveVideo={handleRemoveVideo}
          onSave={handleCreateInspection}
          onBack={() => setView('list')}
        />
      )}

      {view === 'detail' && selectedInspection && (
        <InspectionDetailView
          inspection={selectedInspection}
          rooms={selectedInspectionRooms}
          signatures={selectedInspectionSignatures}
          isTenant={isTenant}
          onBack={() => setView('list')}
          onOpenSignature={handleOpenSignature}
        />
      )}

      {view === 'compare' && compareIns1 && compareIns2 && (
        <InspectionCompareView
          ins1={compareIns1}
          ins2={compareIns2}
          rooms1={compareRooms1}
          rooms2={compareRooms2}
          roomTemplates={ROOM_TEMPLATES}
          onBack={() => {
            setView('list');
            setSelectedForComparison([]);
          }}
        />
      )}

      <SignatureModal
        show={showSignModal}
        signName={signName}
        setSignName={setSignName}
        signCpf={signCpf}
        setSignCpf={setSignCpf}
        isSubmitting={isSubmitting}
        onClose={() => setShowSignModal(false)}
        onSign={handleSignInspection}
      />
    </div>
  );
};
