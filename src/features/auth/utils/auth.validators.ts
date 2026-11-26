import { nuevaPasswordSchema } from './password.schema.js';
import { z } from 'zod';

export const loginSchema = z.object({
  identificador: z
    .string()
    .trim()
    .min(3, 'Ingrese su carnet de identidad, celular o correo electronico.'),
  password: z
    .string()
    .min(1, 'La contrasena es requerida.'),
});

export const registerCitizenSchema = z
  .object({
    nombres: z
      .string()
      .trim()
      .min(2, 'Los nombres deben tener al menos 2 caracteres.').max(100).regex(/^[\p{L}\p{M}]+(?:[ .'’-]+[\p{L}\p{M}]+)*$/u, 'Usa letras en nombres y apellidos.'),
    apellidos: z
      .string()
      .trim()
      .min(2, 'Los apellidos deben tener al menos 2 caracteres.').max(100).regex(/^[\p{L}\p{M}]+(?:[ .'’-]+[\p{L}\p{M}]+)*$/u, 'Usa letras en nombres y apellidos.'),
    ci: z
      .string()
      .trim()
      .min(5, 'El CI debe tener al menos 5 digitos.')
      .max(15, 'El CI no puede exceder los 15 caracteres.').regex(/^\d+$/, 'El CI debe contener solo dígitos.'),
    complemento: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]*$/, 'Complemento inválido.').max(5, 'Maximo 5 caracteres.')
      .optional()
      .or(z.literal('')),
    telefono: z
      .string()
      .trim()
      .regex(
        /^[67]\d{7}$/,
        'Ingrese un celular boliviano valido de 8 digitos (iniciando con 6 o 7).'
      ),
    email: z
      .string()
      .trim()
      .email('Formato de correo electronico invalido.').max(254),
    password: nuevaPasswordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Confirme su contrasena.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterCitizenFormValues = z.infer<typeof registerCitizenSchema>;
