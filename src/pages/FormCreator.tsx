import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FormBuilder } from "@/components/form-builder/FormBuilder";

const FormCreator = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">

        <div className="text-center mb-16 space-y-3">
          <h1 className="text-4xl font-semibold text-foreground tracking-tight">
            AI Form Builder
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Create professional research and survey forms in seconds with AI
          </p>
        </div>

        <FormBuilder />
      </div>
    </div>
  );
};

export default FormCreator;