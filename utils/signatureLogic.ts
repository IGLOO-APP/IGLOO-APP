import { SignatureAudit } from '../types';

/**
 * Simulates SHA-256 Hashing of a file or string.
 * In a real backend, this would hash the actual file buffer.
 */
export const generateDocumentHash = async (content: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(content + Date.now().toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Captures browser metadata for the Audit Trail.
 * Note: IP Address retrieval usually requires a backend service. 
 * We will simulate a random IP for this frontend demo.
 */
export const captureSignerMetadata = async (identifier: string): Promise<SignatureAudit> => {
    // Simulate IP fetching
    const mockIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    // Simulate document content hash
    const docHash = await generateDocumentHash("contract_content_simulation");

    return {
        signed_at: new Date().toISOString(),
        signer_ip: mockIp,
        user_agent: navigator.userAgent,
        signer_identifier: identifier,
        document_hash: docHash,
        integrity_verified: true
    };
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
