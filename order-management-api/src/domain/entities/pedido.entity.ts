export interface PedidoProps {
  readonly id: string;
  readonly formula: string;
  readonly clienteId: string;
  readonly medicamentoId: string;
  readonly fecha: string;
  readonly cantidadPendiente: number;
  readonly cantidadEntregada: number;
  readonly existencia: number;
  readonly sucursal?: string;
  readonly condicionado: boolean;
  readonly modalidad?: string;
  readonly contrato?: string;
  readonly clasificacion?: string;
  readonly cp?: string;
  readonly cl?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Pedido {
  readonly id: string;
  readonly formula: string;
  readonly clienteId: string;
  readonly medicamentoId: string;
  readonly fecha: string;
  readonly cantidadPendiente: number;
  readonly cantidadEntregada: number;
  readonly existencia: number;
  readonly sucursal?: string;
  readonly condicionado: boolean;
  readonly modalidad?: string;
  readonly contrato?: string;
  readonly clasificacion?: string;
  readonly cp?: string;
  readonly cl?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: PedidoProps) {
    this.id = props.id;
    this.formula = props.formula;
    this.clienteId = props.clienteId;
    this.medicamentoId = props.medicamentoId;
    this.fecha = props.fecha;
    this.cantidadPendiente = props.cantidadPendiente;
    this.cantidadEntregada = props.cantidadEntregada;
    this.existencia = props.existencia;
    if (props.sucursal !== undefined) this.sucursal = props.sucursal;
    this.condicionado = props.condicionado;
    if (props.modalidad !== undefined) this.modalidad = props.modalidad;
    if (props.contrato !== undefined) this.contrato = props.contrato;
    if (props.clasificacion !== undefined) this.clasificacion = props.clasificacion;
    if (props.cp !== undefined) this.cp = props.cp;
    if (props.cl !== undefined) this.cl = props.cl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
