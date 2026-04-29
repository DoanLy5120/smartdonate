import { useEffect } from "react";
import useProfileStore from "../store/profileStore";
import useAuthStore from "../store/authStore";

const useProfile = () => {
  const { user } = useAuthStore();

  const {
    profile,
    donations,
    myPosts,
    myCampaigns,
    loadingProfile,
    loadingDonations,
    loadingPosts,
    loadingCampaigns,
    fetchProfile,
    fetchDonations,
    fetchMyPosts,
    fetchMyCampaigns,
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
  } = useProfileStore();

  useEffect(() => {
    fetchProfile();
    fetchDonations();
    fetchMyPosts(user?.id);
    fetchMyCampaigns(true);
  }, [user?.id]);

  return {
    profile,
    donations,
    myPosts,
    myCampaigns,
    loading: loadingProfile,
    loadingDonations,
    loadingPosts,
    loadingCampaigns,
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
  };
};

export default useProfile;