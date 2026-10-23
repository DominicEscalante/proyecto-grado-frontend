import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { LoginFormValues } from '../utils/auth.validators.js';
import { handleApiError } from '../../../api/client.js';

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const user = await login(values);

      // Redireccion inteligente segun rol y estado de verificacion
      if (user.rol_id === 4) {
        // Administrador
        navigate('/admin/usuarios');
      } else if (user.rol_id === 2 || user.rol_id === 3) {
        // Operador Policia o Bomberos
        navigate('/operador/emergencias');
      } else {
        // Ciudadano
        if (!user.identidad_verificada) {
          navigate('/verificar-identidad');
        } else {
          navigate('/ciudadano/reportes');
        }
      }
    } catch (error) {
      setErrorMessage(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleLoginSubmit,
    errorMessage,
    isSubmitting,
    clearError: () => setErrorMessage(null),
  };
}
