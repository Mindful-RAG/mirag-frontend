import { type ReactNode } from 'react';
import { useAuthContext } from '../../contexts/auth-context';
import { LoginButton } from './login-button';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {fallback || (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Welcome to MiRAG</h2>
            <p className="text-muted-foreground">
              Please sign in to access the application
            </p>
            <LoginButton />
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
