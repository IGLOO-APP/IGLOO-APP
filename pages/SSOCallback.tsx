import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

const SSOCallback: React.FC = () => {
  const { handleRedirectCallback } = useClerk();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Clerk processes the OAuth/SSO tokens from the URL automatically
        await handleRedirectCallback({
          afterSignInUrl: '/',
          afterSignUpUrl: '/',
        });
      } catch (err: any) {
        console.error('SSO callback error:', err);
        
        // If the callback has already been consumed or the session already exists,
        // just redirect to the appropriate page
        if (err?.message?.includes('is not a valid callback URL') || 
            err?.message?.includes('already been consumed') ||
            err?.errors?.[0]?.code === 'session_exists') {
          navigate('/', { replace: true });
          return;
        }

        setError(err?.message || 'Erro ao processar autenticação');
        
        // Redirect to login after a short delay on unexpected errors
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [handleRedirectCallback, navigate]);

  if (error) {
    return (
      <div style={{
        height: '100vh',
        background: '#0b1011',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ 
          color: '#f87171', 
          fontSize: '14px', 
          fontFamily: 'sans-serif',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Erro na autenticação</p>
          <p style={{ color: '#94a3b8', fontSize: '12px' }}>{error}</p>
          <p style={{ color: '#64748b', fontSize: '11px', marginTop: '12px' }}>Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      background: '#0b1011',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid rgba(19,200,236,0.2)',
          borderTop: '3px solid #13c8ec',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#4b5563', fontSize: '13px', fontFamily: 'sans-serif' }}>Autenticando...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SSOCallback;
