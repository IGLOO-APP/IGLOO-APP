# Implementation Plan — Tenant Onboarding Step 02 Expansion & Owner Configs

We need to expand Step 02 of the tenant onboarding ("Envio de Documentos") to support a dual-warranty flow (Depósito Caução vs. Fiador) depending on the owner's configuration. We also need to add validation to the owner's settings and build the corresponding review interface in the owner's portal.

---

## User Review Required

> [!IMPORTANT]
> The database migrations must be applied to your Supabase instance. We will create the migration file `supabase/migrations/012_payment_config_constraints.sql` for this purpose. If you are using Supabase CLI, it will detect this. Otherwise, please execute the SQL statements in the Supabase Dashboard SQL Editor.

> [!WARNING]
> RLS Policy for `owner_payment_config` was previously restricted to `status = 'active'` contracts. This has been updated to include `pending_signature` and `draft` so the tenant can read the configuration *during* onboarding.

---

## Proposed Changes

### Database & Types

#### [NEW] [012_payment_config_constraints.sql](file:///c:/Users/Mesquita/Downloads/IGLOO-APP-main/supabase/migrations/012_payment_config_constraints.sql)
- Add CHECK constraint to `owner_payment_config` preventing both toggles from being disabled.
- Add `document_type` and `tenant_id` columns to `property_documents` to support receipt linking.
- Update `Tenants can view owner payment config` RLS policy to permit selection during onboarding.

#### [MODIFY] [database.types.ts](file:///c:/Users/Mesquita/Downloads/IGLOO-APP-main/lib/database.types.ts)
- Add `document_type` and `tenant_id` fields to `property_documents` row types.

---

### Services

#### [MODIFY] [documentService.ts](file:///c:/Users/Mesquita/Downloads/IGLOO-APP-main/services/documentService.ts)
- Add `getPaymentReceipt(tenantId)` to fetch the receipt document.
- Fix `create()` method in `documentService` to explicitly insert the `url` column (which was previously omitted from the insert payload).

---

### Owner Settings

#### [MODIFY] [GuaranteeTab.tsx](file:///c:/Users/Mesquita/Downloads/IGLOO-APP-main/pages/settings/sections/GuaranteeTab.tsx)
- Add frontend validation in `handleSave`: at least one toggle (`accepts_deposit` or `accepts_guarantor`) must be active. Show error message using `sonner` toast if not.

---

### Tenant Portal (Onboarding Checklist)

#### [MODIFY] [TenantOnboardingChecklist.tsx](file:///c:/Users/Mesquita/Downloads/IGLOO-APP-main/components/tenant/TenantOnboardingChecklist.tsx)
- Display warning message: *"O proprietário ainda não configurou as opções de garantia. Aguarde."* if no options are valid.
- Filter options: Depósito Caução is visible only if accepts is true and at least one transfer method is configured (Pix or Bank transfer details). Fiador is visible only if accepted.
- If only one flow is available, auto-select it and bypass selection cards.
- If both are enabled, support tabbed view for Pix vs. Bank Transfer inside the payment instructions card.
- Add guarantor CPF mask and validation using `validateCPF` from `utils/formatters.ts`.
- Add guarantor RG formatting mask.
- Enforce validation in `handleUploadDocs` for both flows (requiring receipt or all guarantor details).
- Save receipt in `property_documents` with `document_type: 'payment_receipt'`, linking it to `tenant_id` and `property_id`.

---

### Owner Portal (Review Checklist)

#### [MODIFY] [OwnerOnboardingReviewChecklist.tsx](file:///c:/Users/Mesquita/Downloads/IGLOO-APP-main/components/tenants/OwnerOnboardingReviewChecklist.tsx)
- Load `paymentReceipt` document using `documentService` on mount.
- Implement action handlers: `handleConfirmPaymentReceipt`, `handleRejectPaymentReceipt`, `handleApproveGuarantor`, `handleRejectGuarantor`.
- Automatically invoke `handleApproveStep('documents')` when the warranty is approved and all other documents (`rg`, `income`, etc.) are approved.

#### [MODIFY] [DocumentStepContent.tsx](file:///c:/Users/Mesquita/Downloads/IGLOO-APP-main/components/tenants/onboarding/DocumentStepContent.tsx)
- Add UI sections for both Deposit receipt review and Guarantor personal data/uploads review.
- Render status badges and actions (teal for approve, outline red for reject) for both flows.

---

## Verification Plan

### Automated Tests
- Run `npx vitest run` to ensure formatter and calculation tests continue to pass.
- Run `npm run lint` and `npx tsc --noEmit --skipLibCheck` to guarantee full compilation and linting compliance.

### Manual Verification
1. **Config Validation**: Go to settings under *Garantias*, disable both, hit Save, and ensure toast blocks it.
2. **Tenant Onboarding**: Go to tenant dashboard:
   - Ensure predicted value (3x rent) is displayed.
   - Verify selection behaves as expected.
   - Upload receipt or enter invalid guarantor CPF to test frontend blocking.
3. **Owner Review**: Go to `/tenants/:id` and review:
   - Ensure receipt or guarantor data is visible.
   - Confirm/Approve and ensure database updates and onboarding stage advances automatically if all docs are validated.
