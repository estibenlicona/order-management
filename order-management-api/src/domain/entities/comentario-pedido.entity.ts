export interface ComentarioPedidoProps {
  readonly id: string;
  readonly pedidoId: string;
  readonly contenido: string;
  readonly usuario?: string;
  readonly usuarioId?: string;
  readonly createdAt: Date;
}

export class ComentarioPedido {
  readonly id: string;
  readonly pedidoId: string;
  readonly contenido: string;
  readonly usuario?: string;
  readonly usuarioId?: string;
  readonly createdAt: Date;

  constructor(props: ComentarioPedidoProps) {
    this.id = props.id;
    this.pedidoId = props.pedidoId;
    this.contenido = props.contenido;
    if (props.usuario !== undefined) this.usuario = props.usuario;
    if (props.usuarioId !== undefined) this.usuarioId = props.usuarioId;
    this.createdAt = props.createdAt;
  }
}
