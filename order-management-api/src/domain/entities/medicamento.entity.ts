export interface MedicamentoProps {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly tipoMedica?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Medicamento {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly tipoMedica?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: MedicamentoProps) {
    this.id = props.id;
    this.codigo = props.codigo;
    this.nombre = props.nombre;
    if (props.tipoMedica !== undefined) this.tipoMedica = props.tipoMedica;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
