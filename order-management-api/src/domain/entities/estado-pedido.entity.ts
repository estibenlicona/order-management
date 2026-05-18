export interface EstadoPedidoProps {
  readonly id: string;
  readonly pedidoId: string;
  readonly estado: string;
  readonly fecha?: string;
  readonly observacion?: string;
  readonly usuario?: string;
  readonly usuarioId?: string;
  readonly createdAt: Date;
}

export class EstadoPedido {
  readonly id: string;
  readonly pedidoId: string;
  readonly estado: string;
  readonly fecha?: string;
  readonly observacion?: string;
  readonly usuario?: string;
  readonly usuarioId?: string;
  readonly createdAt: Date;

  constructor(props: EstadoPedidoProps) {
    this.id = props.id;
    this.pedidoId = props.pedidoId;
    this.estado = props.estado;
    if (props.fecha !== undefined) this.fecha = props.fecha;
    if (props.observacion !== undefined) this.observacion = props.observacion;
    if (props.usuario !== undefined) this.usuario = props.usuario;
    if (props.usuarioId !== undefined) this.usuarioId = props.usuarioId;
    this.createdAt = props.createdAt;
  }
}
