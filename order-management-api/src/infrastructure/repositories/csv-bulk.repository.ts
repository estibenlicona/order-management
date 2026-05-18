import { PrismaClient } from '@prisma/client';
import { ICsvBulkProcessor } from '@application/ports/i-csv-bulk-processor';
import { ICsvBulkValidator } from '@application/ports/i-csv-bulk-validator';
import { BatchRowResult } from '@application/use-cases/process-csv-batch.use-case';
import { RowValidationResult } from '@application/use-cases/validate-csv-batch.use-case';

interface RowStatusRecord {
  row_index: number | bigint;
  formula: string;
  status: string;
}

interface ValidationRecord {
  row_index: number | bigint;
  formula: string | null;
  identificacion: string | null;
  paciente: string | null;
  producto: string | null;
  missing_identificacion: boolean;
  missing_paciente: boolean;
  missing_formula: boolean;
  missing_producto: boolean;
  missing_codigo: boolean;
  missing_estado: boolean;
  invalid_fecha: boolean;
  exists_in_db: boolean;
  cliente_exists: boolean;
  med_exists: boolean;
}

export class CsvBulkRepository implements ICsvBulkProcessor, ICsvBulkValidator {
  constructor(private readonly prisma: PrismaClient) {}

  async validate(batchId: string, rows: Record<string, string>[]): Promise<RowValidationResult[]> {
    await this.insertToStaging(batchId, rows);

    try {
      // Single SQL: all validations as set-based queries with LEFT JOINs.
      // Returns one row per staging row with boolean flags for each check.
      const records = await this.prisma.$queryRaw<ValidationRecord[]>`
        WITH
        existing_pedidos AS (
          SELECT DISTINCT p.formula
          FROM   pedidos p
          JOIN   csv_staging s
            ON   s.formula  = p.formula
            AND  s.batch_id = ${batchId}::uuid
        ),
        existing_clientes AS (
          SELECT DISTINCT c.identificacion
          FROM   clientes c
          JOIN   csv_staging s
            ON   s.identificacion = c.identificacion
            AND  s.batch_id       = ${batchId}::uuid
        ),
        existing_medicamentos AS (
          SELECT DISTINCT m.codigo
          FROM   medicamentos m
          JOIN   csv_staging s
            ON   s.codigo   = m.codigo
            AND  s.batch_id = ${batchId}::uuid
        )
        SELECT
          s.row_index,
          s.formula,
          s.identificacion,
          s.paciente,
          s.producto,
          (TRIM(COALESCE(s.identificacion, '')) = '')              AS missing_identificacion,
          (TRIM(COALESCE(s.paciente, ''))       = '')              AS missing_paciente,
          (TRIM(COALESCE(s.formula, ''))        = '')              AS missing_formula,
          (TRIM(COALESCE(s.producto, ''))       = '')              AS missing_producto,
          (TRIM(COALESCE(s.codigo, ''))         = '')              AS missing_codigo,
          (TRIM(COALESCE(s.estado, ''))         = '')              AS missing_estado,
          (s.fecha IS NULL OR s.fecha !~ '^[0-9]{8}$')             AS invalid_fecha,
          (ep.formula IS NOT NULL)                                 AS exists_in_db,
          (ec.identificacion IS NOT NULL)                          AS cliente_exists,
          (em.codigo IS NOT NULL)                                  AS med_exists
        FROM csv_staging s
        LEFT JOIN existing_pedidos      ep ON ep.formula       = s.formula
        LEFT JOIN existing_clientes     ec ON ec.identificacion = s.identificacion
        LEFT JOIN existing_medicamentos em ON em.codigo        = s.codigo
        WHERE s.batch_id = ${batchId}::uuid
        ORDER BY s.row_index
      `;

      return records.map(toValidationResult);
    } finally {
      await this.cleanupStaging(batchId);
    }
  }

  async process(batchId: string, rows: Record<string, string>[]): Promise<BatchRowResult[]> {
    await this.insertToStaging(batchId, rows);

    try {
      // Single CTE statement: upsert clientes → upsert medicamentos →
      // insert pedidos → insert estados for new pedidos.
      // Avoids Prisma interactive transactions (incompatible with PgBouncer).
      const statusRows = await this.prisma.$queryRaw<RowStatusRecord[]>`
        WITH
        upsert_clientes AS (
          INSERT INTO clientes (id, identificacion, nombre, direccion, telefono, updated_at)
          SELECT DISTINCT ON (identificacion)
            gen_random_uuid(), identificacion, paciente, direccion, telefono, NOW()
          FROM  csv_staging
          WHERE batch_id = ${batchId}::uuid
            AND identificacion IS NOT NULL
          ORDER BY identificacion, row_index
          ON CONFLICT (identificacion) DO UPDATE SET
            nombre     = EXCLUDED.nombre,
            direccion  = EXCLUDED.direccion,
            telefono   = EXCLUDED.telefono,
            updated_at = NOW()
          RETURNING id, identificacion
        ),
        upsert_medicamentos AS (
          INSERT INTO medicamentos (id, codigo, nombre, tipo_medica, updated_at)
          SELECT DISTINCT ON (codigo)
            gen_random_uuid(), codigo, producto, tipo_medica, NOW()
          FROM  csv_staging
          WHERE batch_id = ${batchId}::uuid
            AND codigo IS NOT NULL
          ORDER BY codigo, row_index
          ON CONFLICT (codigo) DO UPDATE SET
            nombre      = EXCLUDED.nombre,
            tipo_medica = EXCLUDED.tipo_medica,
            updated_at  = NOW()
          RETURNING id, codigo
        ),
        inserted_pedidos AS (
          INSERT INTO pedidos (
            id, formula, fecha, cliente_id, medicamento_id,
            cantidad_pendiente, cantidad_entregada, existencia,
            condicionado, sucursal, modalidad, contrato, clasificacion, cp, cl,
            updated_at
          )
          SELECT
            gen_random_uuid(),
            s.formula,
            TO_DATE(s.fecha, 'YYYYMMDD'),
            c.id,
            m.id,
            CASE WHEN TRIM(COALESCE(s.pendiente,''))  ~ '^[0-9]+$' THEN TRIM(s.pendiente)::int  ELSE 0 END,
            CASE WHEN TRIM(COALESCE(s.entregado,''))  ~ '^[0-9]+$' THEN TRIM(s.entregado)::int  ELSE 0 END,
            CASE WHEN TRIM(COALESCE(s.existencia,'')) ~ '^[0-9]+$' THEN TRIM(s.existencia)::int ELSE 0 END,
            UPPER(TRIM(COALESCE(s.condicionado,''))) = 'SI',
            s.sucursal, s.modalidad, s.contrato, s.clasificacion, s.cp, s.cl,
            NOW()
          FROM  csv_staging       s
          JOIN  upsert_clientes   c ON c.identificacion = s.identificacion
          JOIN  upsert_medicamentos m ON m.codigo       = s.codigo
          WHERE s.batch_id = ${batchId}::uuid
            AND s.formula  IS NOT NULL
            AND s.fecha    ~ '^[0-9]{8}$'
          ON CONFLICT (formula) DO NOTHING
          RETURNING id, formula
        ),
        insert_estados1 AS (
          INSERT INTO estados_pedido (id, pedido_id, estado, fecha, observacion, usuario, created_at)
          SELECT
            gen_random_uuid(), ip.id, s.estado,
            CASE WHEN s.fecha_1 ~ '^[0-9]{8}$' THEN TO_DATE(s.fecha_1, 'YYYYMMDD') ELSE NULL END,
            s.observacion_1,
            s.usuario_1,
            NOW() + INTERVAL '1 microsecond'
          FROM inserted_pedidos ip
          JOIN csv_staging s ON s.formula   = ip.formula
                             AND s.batch_id = ${batchId}::uuid
          WHERE s.fecha_1 IS NOT NULL OR s.observacion_1 IS NOT NULL OR s.usuario_1 IS NOT NULL
          RETURNING id
        ),
        insert_estados2 AS (
          INSERT INTO estados_pedido (id, pedido_id, estado, fecha, observacion, usuario, created_at)
          SELECT
            gen_random_uuid(), ip.id, s.estado,
            CASE WHEN s.fecha_2 ~ '^[0-9]{8}$' THEN TO_DATE(s.fecha_2, 'YYYYMMDD') ELSE NULL END,
            s.observacion_2,
            s.usuario_2,
            NOW() + INTERVAL '2 microseconds'
          FROM inserted_pedidos ip
          JOIN csv_staging s ON s.formula   = ip.formula
                             AND s.batch_id = ${batchId}::uuid
          WHERE s.fecha_2 IS NOT NULL OR s.observacion_2 IS NOT NULL OR s.usuario_2 IS NOT NULL
          RETURNING id
        ),
        insert_estados3 AS (
          INSERT INTO estados_pedido (id, pedido_id, estado, fecha, observacion, usuario, created_at)
          SELECT
            gen_random_uuid(), ip.id, s.estado,
            CASE WHEN s.fecha_3 ~ '^[0-9]{8}$' THEN TO_DATE(s.fecha_3, 'YYYYMMDD') ELSE NULL END,
            s.observacion_3,
            s.usuario_3,
            NOW() + INTERVAL '3 microseconds'
          FROM inserted_pedidos ip
          JOIN csv_staging s ON s.formula   = ip.formula
                             AND s.batch_id = ${batchId}::uuid
          WHERE s.fecha_3 IS NOT NULL OR s.observacion_3 IS NOT NULL OR s.usuario_3 IS NOT NULL
          RETURNING id
        ),
        insert_estados_main AS (
          INSERT INTO estados_pedido (id, pedido_id, estado, fecha, observacion, usuario, created_at)
          SELECT gen_random_uuid(), ip.id, s.estado, NULL, NULL, NULL,
            NOW() + INTERVAL '4 microseconds'
          FROM inserted_pedidos ip
          JOIN csv_staging s ON s.formula   = ip.formula
                             AND s.batch_id = ${batchId}::uuid
          WHERE s.estado IS NOT NULL
          RETURNING id
        )
        SELECT
          s.row_index,
          s.formula,
          CASE WHEN ip.formula IS NOT NULL THEN 'created' ELSE 'skipped' END AS status
        FROM csv_staging s
        LEFT JOIN inserted_pedidos ip ON ip.formula = s.formula
        WHERE s.batch_id = ${batchId}::uuid
        ORDER BY s.row_index
      `;

      return statusRows.map(r => ({
        rowIndex: Number(r.row_index),
        status:   r.status as 'created' | 'skipped',
        formula:  r.formula,
      }));
    } finally {
      await this.cleanupStaging(batchId);
    }
  }

  private async insertToStaging(batchId: string, rows: Record<string, string>[]): Promise<void> {
    // Only the columns we identified — extra keys in the row object are ignored
    // because Prisma's createMany only uses the model fields.
    await this.prisma.csvStaging.createMany({
      data: rows.map((row, i) => ({
        batchId,
        rowIndex:           i,
        identificacion:     row['identificacion']     || null,
        paciente:           row['paciente']           || null,
        formula:            row['formula']            || null,
        fecha:              row['fecha']              || null,
        producto:           row['producto']           || null,
        codigo:             row['codigo']             || null,
        estado:             row['estado']             || null,
        direccion:          row['direccion']          || null,
        telefono:           row['telefono']           || null,
        tipoMedica:         row['tipoMedica']         || null,
        condicionado:       row['condicionado']       || null,
        sucursal:           row['sucursal']           || null,
        modalidad:          row['modalidad']          || null,
        contrato:           row['contrato']           || null,
        clasificacion:      row['clasificacion']      || null,
        cp:                 row['cp']                 || null,
        cl:                 row['cl']                 || null,
        pendiente:          row['pendiente']          || null,
        entregado:          row['entregado']          || null,
        existencia:         row['existencia']         || null,
        ingresoDelProducto: row['ingresoDelProducto'] || null,
        fecha1:             row['fecha1']             || null,
        observacion1:       row['observacion1']       || null,
        usuario1:           row['usuario1']           || null,
        fecha2:             row['fecha2']             || null,
        observacion2:       row['observacion2']       || null,
        usuario2:           row['usuario2']           || null,
        fecha3:             row['fecha3']             || null,
        observacion3:       row['observacion3']       || null,
        usuario3:           row['usuario3']           || null,
      })),
    });
  }

  private async cleanupStaging(batchId: string): Promise<void> {
    await this.prisma.$executeRaw`DELETE FROM csv_staging WHERE batch_id = ${batchId}::uuid`;
  }
}

function toValidationResult(r: ValidationRecord): RowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (r.missing_identificacion) errors.push('Identificacion es requerido');
  if (r.missing_paciente)       errors.push('Paciente es requerido');
  if (r.missing_formula)        errors.push('Formula es requerida');
  if (r.missing_producto)       errors.push('Producto es requerido');
  if (r.missing_codigo)         errors.push('Codigo es requerido');
  if (r.missing_estado)         errors.push('Estado es requerido');
  if (r.invalid_fecha)          errors.push('Fecha debe tener formato YYYYMMDD');

  if (r.exists_in_db)   errors.push(`Formula "${r.formula ?? ''}" ya existe en la base de datos`);
  if (r.cliente_exists) warnings.push('Cliente ya existe — se actualizarán sus datos');
  if (r.med_exists)     warnings.push('Medicamento ya existe — se actualizarán sus datos');

  const result: RowValidationResult = {
    rowIndex: Number(r.row_index),
    valid:    errors.length === 0,
    errors,
    warnings,
  };
  if (r.formula        != null) result.formula        = r.formula;
  if (r.identificacion != null) result.identificacion = r.identificacion;
  if (r.paciente       != null) result.paciente       = r.paciente;
  if (r.producto       != null) result.producto       = r.producto;
  return result;
}
