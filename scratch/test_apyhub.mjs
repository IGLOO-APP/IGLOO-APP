import dotenv from 'dotenv';
dotenv.config({ path: 'e:/IGLOO/IGLOO-APP/.env.local' });

const APY_TOKEN = process.env.VITE_APYHUB_TOKEN;
console.log('VITE_APYHUB_TOKEN defined?', !!APY_TOKEN);
if (APY_TOKEN) {
  console.log('Token (first 10 chars):', APY_TOKEN.substring(0, 10));
}

// Test a preview request against a publicly accessible image
async function testApyHub() {
  if (!APY_TOKEN) {
    console.error('[ERRO] VITE_APYHUB_TOKEN não encontrada no .env.local');
    return;
  }

  const testUrl = 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg';

  console.log('\n--- Testando ApyHub Preview API ---');
  console.log('URL do documento:', testUrl);
  console.log('Endpoint:', 'https://api.apyhub.com/generate/preview/file');

  try {
    const response = await fetch(
      `https://api.apyhub.com/generate/preview/file?output=test-preview&width=600&auto_orientation=true`,
      {
        method: 'POST',
        headers: {
          'apy-token': APY_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testUrl }),
      }
    );

    console.log('\nStatus HTTP:', response.status, response.statusText);
    const text = await response.text();
    console.log('Resposta raw:', text.substring(0, 500));

    try {
      const json = JSON.parse(text);
      if (json.data) {
        console.log('\n✅ API funcionando! Preview URL:', json.data);
      } else {
        console.log('\n⚠️ API respondeu mas sem campo "data":', json);
      }
    } catch {
      console.log('\nResposta não é JSON:', text);
    }
  } catch (err) {
    console.error('\n❌ Erro de conexão:', err.message);
  }
}

testApyHub();
