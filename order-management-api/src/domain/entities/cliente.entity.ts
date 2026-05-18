export interface ClienteProps {
  readonly id: string;
  readonly identificacion: string;
  readonly nombre: string;
  readonly direccion?: string;
  readonly telefono?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Cliente {
  readonly id: string;
  readonly identificacion: string;
  readonly nombre: string;
  readonly direccion?: string;
  readonly telefono?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ClienteProps) {
    this.id = props.id;
    this.identificacion = props.identificacion;
    this.nombre = props.nombre;
    if (props.direccion !== undefined) this.direccion = props.direccion;
    if (props.telefono !== undefined) this.telefono = props.telefono;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
