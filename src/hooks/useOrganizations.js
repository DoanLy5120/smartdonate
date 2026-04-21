import { useEffect } from "react";
import useOrganizationStore from "../store/organizationStore";

const useOrganizations = (params = null) => {
  const organizations = useOrganizationStore((s) => s.organizations);
  const orgTypes = useOrganizationStore((s) => s.orgTypes);
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations);

  useEffect(() => {
    fetchOrganizations(params || {});
  }, [JSON.stringify(params)]);

  return {
    organizations,
    orgTypes,
  };
};

export default useOrganizations;
