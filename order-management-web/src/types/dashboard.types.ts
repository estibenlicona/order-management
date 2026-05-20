export type DashboardRange = 3 | 6 | 12;

export interface DashboardTotals {
  activos: number;
  entregados: number;
  total: number;
}

export interface DashboardCriticidad {
  menor15: number;
  entre16y30: number;
  entre31y60: number;
  mayor60: number;
}

export interface DashboardAtendidos {
  atendidos: number;
  sinAtender: number;
  porcentaje: number;
}

export interface DashboardMensualEntry {
  mes: string;        // 'YYYY-MM'
  creados: number;
  entregados: number;
}

export interface DashboardTopUsuario {
  usuario: string;
  total: number;
}

export interface DashboardSucursalEntry {
  sucursal: string;
  activos: number;
  entregados: number;
  total: number;
}

export interface DashboardMetrics {
  totals: DashboardTotals;
  criticidad: DashboardCriticidad;
  atendidos: DashboardAtendidos;
  mensual: DashboardMensualEntry[];
  topUsuarios: DashboardTopUsuario[];
  porSucursal: DashboardSucursalEntry[];
}
