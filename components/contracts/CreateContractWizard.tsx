import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X } from 'lucide-react';
import { ContractPDFTemplate } from '../pdf/ContractPDFTemplate';
import { ContractWizardHeader } from './ContractWizardHeader';
import { PropertySelectionStep } from './steps/PropertySelectionStep';
import { TenantSelectionStep } from './steps/TenantSelectionStep';
import { ContractValuesStep } from './steps/ContractValuesStep';
import { ContractDurationStep } from './steps/ContractDurationStep';
import { DocumentSignatureStep } from './steps/DocumentSignatureStep';
import { ContractReviewStep } from './steps/ContractReviewStep';
import { useContractWizard, ContractWizardData } from './steps/useContractWizard';

interface CreateContractWizardProps {
  onClose: () => void;
  onComplete: (data: ContractWizardData) => void;
  initialProperty?: string;
  currentUser?: { id: string; name: string };
}

const stepRequirements: Record<number, string> = {
  1: 'Selecione um imóvel',
  2: 'Defina o locatário',
  5: 'Assine o documento',
};

export const CreateContractWizard: React.FC<CreateContractWizardProps> = ({
  onClose,
  onComplete,
  initialProperty,
  currentUser,
}) => {
  const wizard = useContractWizard(initialProperty, onComplete, currentUser);

  return (
    <div className='fixed inset-0 z-50 bg-background text-foreground flex flex-col animate-slideUp overflow-hidden'>
      <ContractWizardHeader
        currentStep={wizard.currentStep}
        canAdvance={wizard.canAdvance()}
        onClose={onClose}
        onBack={wizard.handleBack}
        onNext={wizard.handleNext}
        stepRequirement={stepRequirements[wizard.currentStep]}
      />

      <div className='flex-1 overflow-y-auto bg-muted/30'>
        <div
          className={`mx-auto min-h-full flex flex-col transition-all duration-300 ${
            wizard.currentStep === 5 ? 'max-w-[1600px] w-full p-0' : 'max-w-4xl p-6 md:p-10'
          }`}
        >
          {wizard.currentStep === 1 && (
            <PropertySelectionStep
              loading={wizard.loading}
              properties={wizard.properties}
              selectedProperty={wizard.formData.property}
              onSelect={(propertyId, propertyName, rentValue, depositValue) =>
                wizard.setFormData({
                  ...wizard.formData,
                  property: propertyName,
                  propertyId,
                  rentValue,
                  depositValue,
                })
              }
            />
          )}

          {wizard.currentStep === 2 && (
            <TenantSelectionStep
              loading={wizard.loading}
              tenants={wizard.tenants}
              tenantSearch={wizard.tenantSearch}
              onSearchChange={wizard.setTenantSearch}
              showNewTenantForm={wizard.showNewTenantForm}
              onToggleNewForm={wizard.setShowNewTenantForm}
              selectedTenantId={wizard.selectedTenantId}
              onSelectTenant={(id, name, cpf, email) => {
                wizard.setSelectedTenantId(id);
                wizard.setFormData({
                  ...wizard.formData,
                  tenantName: name,
                  tenantCpf: cpf,
                  tenantEmail: email,
                });
              }}
              formData={wizard.formData}
              onFormDataChange={(data) => wizard.setFormData({ ...wizard.formData, ...data })}
            />
          )}

          {wizard.currentStep === 3 && (
            <ContractValuesStep
              properties={wizard.properties}
              formData={wizard.formData}
              onFormDataChange={(data) => wizard.setFormData({ ...wizard.formData, ...data })}
            />
          )}

          {wizard.currentStep === 4 && (
            <ContractDurationStep
              formData={wizard.formData}
              onFormDataChange={(data) => wizard.setFormData({ ...wizard.formData, ...data })}
              getEndDate={wizard.getEndDate}
              getAdjustmentDate={wizard.getAdjustmentDate}
            />
          )}

          {wizard.currentStep === 5 && (
            <DocumentSignatureStep
              contractPages={wizard.contractPages}
              signatures={wizard.signatures}
              signaturePositions={wizard.signaturePositions}
              movingSignature={wizard.movingSignature}
              showSignatureModal={wizard.showSignatureModal}
              textareaRefs={wizard.textareaRefs}
              isDraggingRef={wizard.isDraggingRef}
              dragStartRef={wizard.dragStartRef}
              formData={{
                landlordName: wizard.formData.landlordName,
                tenantName: wizard.formData.tenantName,
              }}
              onUpdatePageContent={wizard.updatePageContent}
              onShowSignatureModal={wizard.setShowSignatureModal}
              onSignatureConfirm={wizard.handleSignatureConfirm}
              onMoveSignature={wizard.setMovingSignature}
              onRemoveSignature={(index) => {
                const newSigs = { ...wizard.signatures };
                delete newSigs[index];
                wizard.setSignatures(newSigs);
                if (wizard.movingSignature === index) wizard.setMovingSignature(null);
              }}
            />
          )}

          {wizard.currentStep === 6 && (
            <ContractReviewStep
              formData={wizard.formData}
              contractPages={wizard.contractPages}
              docMode={wizard.docMode}
              uploadedFile={wizard.uploadedFile}
              properties={wizard.properties}
              onShowPDFPreview={() => wizard.setShowPDFPreview(true)}
            />
          )}
        </div>
      </div>

      {wizard.showPDFPreview && (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn'>
          <div className='bg-card text-card-foreground rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-border'>
            <div className='p-6 border-b border-border flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter'>
                  Pré-visualização da Minuta
                </h3>
                <p className='text-xs text-slate-500'>
                  Visualize a versão final formatada para impressão
                </p>
              </div>
              <button
                onClick={() => wizard.setShowPDFPreview(false)}
                className='p-2 hover:bg-muted rounded-full transition-all text-muted-foreground hover:text-foreground'
              >
                <X size={20} />
              </button>
            </div>
            <div className='flex-1 bg-muted/40 p-4'>
              <PDFViewer
                width='100%'
                height='100%'
                style={{ border: 'none', borderRadius: '12px' }}
              >
                <ContractPDFTemplate data={wizard.getContractDataMap()} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
