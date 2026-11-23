// URL del backend Spring Boot
export const IG_API_URL = 'http://localhost:8080';

// ID del rol "estudiante" en tu tabla roles (se usa al registrar una cuenta nueva)
export const IG_ROL_ESTUDIANTE_ID = 1;

// Nota mínima para aprobar una evaluación (igual que en el backend)
export const IG_NOTA_MINIMA = 60;

// Solo se muestran estos idiomas (en minúsculas y sin tildes). Los repetidos se juntan en uno.
export const IG_IDIOMAS_PERMITIDOS = ['quechua', 'aymara'];

// Solo se muestran estos niveles. "Nivel Básico" y "Básico" se consideran el mismo.
export const IG_NIVELES_PERMITIDOS: Record<string, string> = { basico: 'Básico', intermedio: 'Intermedio' };
