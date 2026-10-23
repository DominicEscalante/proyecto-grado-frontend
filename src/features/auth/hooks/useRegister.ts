import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { RegisterCitizenFormValues } from '../utils/auth.validators.js';
import { handleApiError } from '../../../api/client.js';
import { sileo } from 'sileo';

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
      sileo.success({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada. Procede con la verificación de identidad.',
      });
      // Redirigir directamente al flujo de verificacion de identidad del ciudadano
      navigate('/verificar-identidad');
    } catch (error) {
      const msg = handleApiError(error);
      setErrorMessage(msg);
      sileo.error({
        title: 'Error de registro',
        description: msg,
      });
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
