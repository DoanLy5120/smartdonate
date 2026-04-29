import { useEffect, useRef } from "react";
import useCampaignStore from "../store/campaignStore";

/**
 * @param {object} options
 * @param {object|null} options.params  - Truyền params thì fetch list, null thì bỏ qua
 * @param {boolean}     options.featured - true thì fetch featured
 */
export default function useCampaigns({ params = null, featured = false } = {}) {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const pagination = useCampaignStore((s) => s.pagination);
  const featuredList = useCampaignStore((s) => s.featured);
  const loading = useCampaignStore((s) => s.loading);
  const loadingCreate = useCampaignStore((s) => s.loadingCreate);
  const loadingUpdate = useCampaignStore((s) => s.loadingUpdate);
  const loadingExpense = useCampaignStore((s) => s.loadingExpense);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);
  const fetchFeatured = useCampaignStore((s) => s.fetchFeatured);
  const fetchEndingCampaigns = useCampaignStore((s) => s.fetchEndingCampaigns);
  const createCampaign = useCampaignStore((s) => s.createCampaign);

  // Edit + expense actions
  const fetchCampaignForEdit = useCampaignStore((s) => s.fetchCampaignForEdit);
  const handleUpdateCampaign = useCampaignStore((s) => s.handleUpdateCampaign);
  const fetchWithdrawTransactions = useCampaignStore(
    (s) => s.fetchWithdrawTransactions,
  );
  const handleCreateExpense = useCampaignStore((s) => s.handleCreateExpense);

  const paramsKey = params ? JSON.stringify(params) : null;
  const prevParamsKey = useRef(null);

  useEffect(() => {
    if (featured) fetchFeatured();
  }, [featured]);

  useEffect(() => {
    fetchEndingCampaigns();
  }, []);

  useEffect(() => {
    if (paramsKey === null) return;
    if (paramsKey === prevParamsKey.current) return;
    prevParamsKey.current = paramsKey;
    fetchCampaigns(params);
  }, [paramsKey]);

  return {
    campaigns,
    pagination,
    featured: featuredList,
    loading,
    loadingCreate,
    loadingUpdate,
    loadingExpense,
    fetchCampaigns,
    fetchFeatured,
    createCampaign,
    // Edit + expense
    fetchCampaignForEdit,
    handleUpdateCampaign,
    fetchWithdrawTransactions,
    handleCreateExpense,
  };
}
