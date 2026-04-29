import { useEffect } from "react";
import useDashboardStore from "../store/dashboardStore";

export default function useDashboard(filter = "thang") {
  const {
    summary, financial, monthly, campaigns, activities,
    loading, loadingFinancial,
    fetchAll, fetchFinancial,
  } = useDashboardStore();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchFinancial(filter);
  }, [filter]);

  return {
    summary, financial, monthly, campaigns, activities,
    loading, loadingFinancial,
  };
}