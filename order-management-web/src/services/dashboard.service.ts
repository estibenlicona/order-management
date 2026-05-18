import { apiClient } from '@services/api.client';
import type { DashboardMetrics, DashboardRange } from '../types/dashboard.types';

interface BackendResponse<T> {
  data: T;
}

export const dashboardService = {
  getMetrics: async (months: DashboardRange = 6): Promise<DashboardMetrics> => {
    const res = await apiClient.get<BackendResponse<DashboardMetrics>>(
      `/dashboard/metrics?months=${months}`,
    );
    return res.data;
  },
};
