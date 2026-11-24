import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { handleApiError } from '../../../api/client.js';
import { requestRegistrationCode, RegistrationChallenge } from '../api/auth.api.js';
import { RegisterCitizenFormValues } from '../utils/auth.validators.js';

export function useRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<{
    values: RegisterCitizenFormValues;
    challenge: RegistrationChallenge;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (values: RegisterCitizenFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const challenge = await requestRegistrationCode(values);
      setPending({ values, challenge });
    } catch (error) {
      setErrorMessage(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCode = async (code: string) => {
    if (!pending) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await register(pending.values, pending.challenge.solicitudId, code);
      navigate('/ciudadano/reportes', { replace: true });
    } catch (error) {
      setErrorMessage(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    pending,
    errorMessage,
    isSubmitting,
    handleRegisterSubmit,
    confirmCode,
    editDetails: () => {
      setPending(null);
      setErrorMessage(null);
    },
  };
}
