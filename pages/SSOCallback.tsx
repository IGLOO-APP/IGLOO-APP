import { useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const SSOCallback: React.FC = () => {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!signInLoaded || !signUpLoaded) return;

    const handleCallback = async () => {
      try {
        // O Clerk processa automaticamente o callback via URL
        navigate('/');
      } catch (err) {
        console.error('SSO callback error:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [signInLoaded, signUpLoaded]);

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
