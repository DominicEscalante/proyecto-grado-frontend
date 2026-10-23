import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { RegisterCitizenFormValues } from '../utils/auth.validators.js';
import { handleApiError } from '../../../api/client.js';

export function useRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (values: RegisterCitizenFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await register(values);
      // Redirigir directamente al flujo de verificacion de identidad del ciudadano
      navigate('/verificar-identidad');
    } catch (error) {
      setErrorMessage(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleRegisterSubmit,
    errorMessage,
    isSubmitting,
    clearError: () => setErrorMessage(null),
  };
}
