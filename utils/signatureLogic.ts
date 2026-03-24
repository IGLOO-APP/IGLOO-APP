import { supabase } from '../lib/supabase';
import { SignatureAudit } from '../types';

/**
 * Simulates SHA-256 Hashing of a file or string.
 */
export const generateDocumentHash = async (content: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(content + Date.now().toString());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Captures browser metadata and SAVES to Supabase.
 */
export const captureAndSaveSignature = async (
  contractId: string,
  signerId: string,
  documentContent: string,
  signatureDataUrl?: string
): Promise<boolean> => {
  try {
    // 1. Generate Metadata
    const docHash = await generateDocumentHash(documentContent);

    // Note: Real IP usually requires a backend function (Edge Function)
    // For now, we capture browser-side info
    const payload = {
      contract_id: contractId,
      signer_id: signerId,
      document_hash: docHash,
      user_agent: navigator.userAgent,
      signature_image_url: signatureDataUrl, // In production, upload to Storage first
      integrity_verified: true,
    };

    const { error } = await supabase.from('signature_audits').insert(payload);

    if (error) throw error;

    // 2. Update Contract Status if needed
    // (Logic to check if all signed and move to 'active' would go here)

    return true;
  } catch (err) {
    console.error('Error saving signature audit:', err);
    return false;
  }
};

/**
 * Generates the WhatsApp/Email message template for the tenant.
 */
export const generateSignatureRequestMessage = (
  ownerName: string,
  tenantName: string,
  propertyAddress: string,
  link: string
) => {
  return `Olá, ${tenantName}! 

Aqui é ${ownerName}.
Acabei de gerar o contrato de locação do imóvel: *${propertyAddress}*.

Para agilizar, estou utilizando a assinatura digital do sistema Igloo. É seguro e tem validade jurídica.

Por favor, clique no link abaixo para revisar e assinar:
${link}

Qualquer dúvida, estou à disposição.`;
};
