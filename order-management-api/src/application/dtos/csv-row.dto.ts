import { z } from 'zod';

const nonEmpty = (field: string) =>
  z.string({ required_error: `${field} es requerido` }).trim().min(1, `${field} no puede estar vacío`);

const dateYYYYMMDD = z
  .string()
  .trim()
  .regex(/^\d{8}$/, 'Fecha debe tener formato YYYYMMDD')
  .transform(v => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`);

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform(v => {
    if (!v || v.length === 0) return undefined;
    if (/^\d{8}$/.test(v)) return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
    return v;
  });

const optionalStr = z.string().trim().optional().transform(v => (v && v.length > 0 ? v : undefined));

const coerceInt = z
  .union([z.string(), z.number()])
  .transform(v => {
    const n = Number(v);
    return isNaN(n) ? 0 : Math.round(n);
  });

export const CsvRowSchema = z.object({
  identificacion: nonEmpty('Identificacion'),
  paciente:       nonEmpty('Paciente'),
  direccion:      optionalStr,
  telefono:       optionalStr,
  formula:        nonEmpty('Formula'),
  fecha:          dateYYYYMMDD,
  producto:       nonEmpty('Producto'),
  pendiente:      coerceInt,
  entregado:      coerceInt,
  existencia:     coerceInt,
  codigo:         nonEmpty('Codigo'),
  cp:             optionalStr,
  cl:             optionalStr,
  estado:         nonEmpty('Estado'),
  sucursal:       optionalStr,
  tipoMedica:     optionalStr,
  condicionado:   z.string().trim().optional().transform(v => v?.toUpperCase() === 'SI'),
  modalidad:      optionalStr,
  contrato:       optionalStr,
  clasificacion:  optionalStr,
  // Historial: hasta 3 triplas de fecha/observacion/usuario
  fecha1:       optionalDate,
  observacion1: optionalStr,
  usuario1:     optionalStr,
  fecha2:       optionalDate,
  observacion2: optionalStr,
  usuario2:     optionalStr,
  fecha3:       optionalDate,
  observacion3: optionalStr,
  usuario3:     optionalStr,
});

export type CsvRowDto = z.infer<typeof CsvRowSchema>;

export const CsvBatchSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())).min(1, 'El batch no puede estar vacío'),
});
