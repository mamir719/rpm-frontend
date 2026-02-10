import React, { useState, useEffect } from "react";
import {
  updateAdminStatusAPI,
  fetchOrganizationsAPI,
  fetchOrganizationAdminsAPI,
} from "../apis/OrganisationApi";
import {
  Building,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Lock,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  AddOrganizationModal,
  EditOrganizationModal,
  AddAdminModal,
  EditAdminModal,
  ResetPasswordModal,
  DeleteOrganizationModal,
  DeleteAdminModal,
} from "../components/OrganizationalModal";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthProvider";
import { LogOut } from "lucide-react";
import { toast } from "react-toastify";

const SuperAdminLayout = () => {
  const { logout } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showManageAdminsModal, setShowManageAdminsModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeAdminDropdown, setActiveAdminDropdown] = useState(null);
  const [organizationAdmins, setOrganizationAdmins] = useState({});

  // Handle click outside to close dropdowns and scroll to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
      if (activeAdminDropdown && !event.target.closest(".dropdown-container")) {
        setActiveAdminDropdown(null);
      }
    };

    const handleScroll = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
      if (activeAdminDropdown) {
        setActiveAdminDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeDropdown, activeAdminDropdown]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetchOrganizationsAPI();
      if (response.ok) {
        setOrganizations(response.organizations || []);
        setOrganizationAdmins({});
      } else {
        toast.error(response.message || "Failed to fetch organizations");
      }
    } catch (err) {
      toast.error("Network error while fetching organizations");
      console.error("Fetch organizations error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admins for a specific organization
  const fetchOrganizationAdmins = async (orgId) => {
    try {
      const response = await fetchOrganizationAdminsAPI(orgId);
      if (response.ok) {
        setOrganizationAdmins((prev) => ({
          ...prev,
          [orgId]: response.admins || [],
        }));
        return response.admins || [];
      } else {
        throw new Error(response.message || "Failed to fetch admins");
      }
    } catch (err) {
      toast.error("Failed to load organization admins");
      console.error("Fetch admins error:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const filteredOrganizations = (organizations || []).filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.org_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddOrganization = async () => {
    try {
      await fetchOrganizations();
      setShowAddOrgModal(false);
      // toast.success("Organization added successfully!");
    } catch (err) {
      console.error("Error adding organization:", err);
      toast.error("Failed to add organization. Please try again.");
    }
  };

  const handleEditOrganization = async () => {
    try {
      await fetchOrganizations();
      setShowEditOrgModal(false);
      setSelectedOrg(null);
      // toast.success("Organization updated successfully!");
    } catch (err) {
      console.error("Error editing organization:", err);
      toast.error("Failed to edit organization. Please try again.");
    }
  };

  const handleAddAdmin = async () => {
    try {
      await fetchOrganizations();
      if (selectedOrg?.id) {
        await fetchOrganizationAdmins(selectedOrg.id);
      }
      setShowAddAdminModal(false);
      setSelectedOrg(null);
      // toast.success("Admin added successfully!");
    } catch (err) {
      console.error("Error adding admin:", err);
      toast.error("Failed to add admin. Please try again.");
    }
  };

  const handleEditAdmin = async () => {
    try {
      await fetchOrganizations();
      if (selectedOrg?.id) {
        await fetchOrganizationAdmins(selectedOrg.id);
      }
      setShowEditAdminModal(false);
      setSelectedAdmin(null);
      // toast.success("Admin updated successfully!");
    } catch (err) {
      console.error("Error editing admin:", err);
      toast.error("Failed to edit admin. Please try again.");
    }
  };

  const handleResetPassword = () => {
    setShowPasswordModal(false);
    setSelectedAdmin(null);
    toast.success("Password reset initiated! Check email for new password.");
  };

  const handleDeleteOrganization = async () => {
    try {
      await fetchOrganizations();
      setShowDeleteOrgModal(false);
      setSelectedOrg(null);
      // toast.success("Organization deleted successfully!");
    } catch (err) {
      console.error("Error deleting organization:", err);
      toast.error("Failed to delete organization. Please try again.");
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await fetchOrganizations();
      if (selectedOrg?.id) {
        await fetchOrganizationAdmins(selectedOrg.id);
      }
      setShowDeleteAdminModal(false);
      setSelectedAdmin(null);
      // toast.success("Admin deleted successfully!");
    } catch (err) {
      console.error("Error deleting admin:", err);
      toast.error("Failed to delete admin. Please try again.");
    }
  };

  const toggleAdminStatus = async (admin) => {
    try {
      const newIsActive = admin.is_active === 1 ? 0 : 1;
      const res = await updateAdminStatusAPI(admin.id, newIsActive);

      if (!res || !res.ok) {
        throw new Error(res?.message || "Failed to update status");
      }

      await fetchOrganizations();
      if (selectedOrg?.id) {
        await fetchOrganizationAdmins(selectedOrg.id);
      }

      const statusMessage = newIsActive === 1 ? "activated" : "deactivated";
      // toast.success(`Admin ${statusMessage} successfully!`);
    } catch (err) {
      toast.error("Failed to update admin status. Please try again.");
      console.error("Status update failed:", err);
    }
  };

  const stats = {
    totalOrgs: organizations?.length || 0,
    totalAdmins:
      organizations?.reduce((acc, org) => acc + (org.admin_count || 0), 0) || 0,
    activeAdmins:
      organizations?.reduce(
        (acc, org) =>
          acc +
          (organizationAdmins[org.id]?.filter((a) => a.is_active === 1)
            ?.length || 0),
        0
      ) || 0,
    inactiveAdmins:
      organizations?.reduce(
        (acc, org) =>
          acc +
          (organizationAdmins[org.id]?.filter((a) => a.is_active === 0)
            ?.length || 0),
        0
      ) || 0,
  };

  const currentOrg = organizations?.find((org) => org.id === selectedOrg?.id);
  const currentOrgAdmins = currentOrg
    ? organizationAdmins[currentOrg.id] || []
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading organizations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 dark:bg-darkModeBackGround min-h-screen transition-colors relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">
            Organization Management
          </h2>
          <p className="text-gray-700 dark:text-gray-200">
            Manage organizations and their admins
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={() => {
              logout();
              toast.info("Logged out successfully");
            }}
            className="inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Logout"
          >
            <LogOut size={18} className="mr-1" />
            Logout
          </button>
          <ThemeToggle />
          <button
            onClick={() => setShowAddOrgModal(true)}
            className="inline-flex items-center px-4 py-2 text-white dark:text-black rounded-lg hover:opacity-90 transition-colors bg-primary dark:bg-darkModeButton"
          >
            <Plus size={20} className="mr-2" />
            Add New Organization
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalOrgs}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Total Organizations
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-darkModeText">
                {stats.totalAdmins}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Total Admins
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-darkModeText">
                {stats.activeAdmins}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Active Admins
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-darkModeText">
                {stats.inactiveAdmins}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Inactive Admins
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {!loading && (
        <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-300"
              />
              <input
                type="text"
                placeholder="Search organizations by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-white focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Organizations Table */}
      {!loading && (
        <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
              Organizations ({filteredOrganizations.length})
            </h3>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Admins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrganizations.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
                          {org.name
                            ?.split(" ")
                            ?.map((n) => n[0])
                            ?.join("") || "N"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {org.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {org.org_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {org.admin_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="relative dropdown-container">
                        <button
                          data-org-id={org.id}
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === org.id ? null : org.id
                            )
                          }
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeDropdown === org.id && (
                          <div
                            className="fixed bg-white dark:bg-innerDarkColor rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] w-48"
                            style={{
                              top: `${
                                filteredOrganizations.findIndex(
                                  (o) => o.id === org.id
                                ) >=
                                filteredOrganizations.length - 2
                                  ? document
                                      .querySelector(
                                        `[data-org-id="${org.id}"]`
                                      )
                                      ?.getBoundingClientRect().top - 180
                                  : document
                                      .querySelector(
                                        `[data-org-id="${org.id}"]`
                                      )
                                      ?.getBoundingClientRect().top
                              }px`,
                              left: `${
                                filteredOrganizations.findIndex(
                                  (o) => o.id === org.id
                                ) >=
                                filteredOrganizations.length - 2
                                  ? document
                                      .querySelector(
                                        `[data-org-id="${org.id}"]`
                                      )
                                      ?.getBoundingClientRect().left - 180
                                  : document
                                      .querySelector(
                                        `[data-org-id="${org.id}"]`
                                      )
                                      ?.getBoundingClientRect().left - 200
                              }px`,
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setShowEditOrgModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-gray-100"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit Organization
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setShowAddAdminModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-gray-100"
                              >
                                <UserPlus size={16} className="mr-2" />
                                Add Admin
                              </button>
                              <button
                                onClick={async () => {
                                  setSelectedOrg(org);
                                  try {
                                    await fetchOrganizationAdmins(org.id);
                                    setShowManageAdminsModal(true);
                                  } catch (err) {
                                    toast.error(
                                      "Failed to load organization admins"
                                    );
                                  }
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-gray-100"
                              >
                                <Users size={16} className="mr-2" />
                                Manage Admins
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setShowDeleteOrgModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 w-full text-left"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete Organization
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12">
              <Building
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
              />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                {searchTerm ? "No organizations found" : "No organizations yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Add your first organization to get started"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddOrgModal && (
        <AddOrganizationModal
          isOpen={showAddOrgModal}
          onClose={() => setShowAddOrgModal(false)}
          onSubmit={handleAddOrganization}
        />
      )}

      {showEditOrgModal && selectedOrg && (
        <EditOrganizationModal
          isOpen={showEditOrgModal}
          onClose={() => {
            setShowEditOrgModal(false);
            setSelectedOrg(null);
          }}
          org={selectedOrg}
          onUpdated={handleEditOrganization}
        />
      )}

      {showAddAdminModal && selectedOrg && (
        <AddAdminModal
          isOpen={showAddAdminModal}
          onClose={() => {
            setShowAddAdminModal(false);
            setSelectedOrg(null);
          }}
          orgId={selectedOrg.id}
          onSubmit={handleAddAdmin}
        />
      )}

      {showEditAdminModal && selectedAdmin && (
        <EditAdminModal
          isOpen={showEditAdminModal}
          onClose={() => {
            setShowEditAdminModal(false);
            setSelectedAdmin(null);
          }}
          admin={selectedAdmin}
          onSubmit={handleEditAdmin}
        />
      )}

      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <ResetPasswordModal
            isOpen={showPasswordModal}
            onClose={() => {
              setShowPasswordModal(false);
              setSelectedAdmin(null);
            }}
            user={selectedAdmin}
            onConfirm={handleResetPassword}
          />
        </div>
      )}

      {showDeleteOrgModal && selectedOrg && (
        <DeleteOrganizationModal
          isOpen={showDeleteOrgModal}
          onClose={() => {
            setShowDeleteOrgModal(false);
            setSelectedOrg(null);
          }}
          org={selectedOrg}
          onDeleteSuccess={handleDeleteOrganization}
        />
      )}

      {showDeleteAdminModal && selectedAdmin && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <DeleteAdminModal
            isOpen={showDeleteAdminModal}
            onClose={() => {
              setShowDeleteAdminModal(false);
              setSelectedAdmin(null);
            }}
            admin={selectedAdmin}
            onDelete={handleDeleteAdmin}
          />
        </div>
      )}

      {showManageAdminsModal && currentOrg && (
        <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-5">
          <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-6xl m-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
                Manage Admins for {currentOrg.name}
              </h3>
              <button
                onClick={() => {
                  setShowManageAdminsModal(false);
                  setSelectedOrg(null);
                }}
                className="text-gray-500 dark:text-darkModeText hover:text-gray-700 dark:hover:text-darkModeText"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[28rem]">
              {currentOrgAdmins.length === 0 ? (
                <div className="text-center py-8">
                  <Users
                    size={48}
                    className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
                  />
                  <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-darkModeText">
                    No admins found for this organization
                  </h4>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-darkModeText">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-darkModeText">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-darkModeText">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-darkModeText">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-darkModeText">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentOrgAdmins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
                              {admin.name
                                ?.split(" ")
                                ?.map((n) => n[0])
                                ?.join("") || "A"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-darkModeText">
                                {admin.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm mb-1 text-gray-900 dark:text-darkModeText">
                            <Mail size={14} className="mr-1" />
                            {admin.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Phone size={14} className="mr-1" />
                            {admin.phone || admin.phoneNumber || "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              admin.is_active === 1
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                            }`}
                          >
                            {admin.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {admin.lastLogin === "Never" || !admin.lastLogin
                            ? "Never"
                            : new Date(admin.lastLogin).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="relative dropdown-container">
                            <button
                              data-admin-id={admin.id}
                              onClick={() =>
                                setActiveAdminDropdown(
                                  activeAdminDropdown === admin.id
                                    ? null
                                    : admin.id
                                )
                              }
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeAdminDropdown === admin.id && (
                              <div
                                className="fixed bg-white dark:bg-innerDarkColor rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] w-48"
                                style={{
                                  top: `${
                                    currentOrgAdmins.findIndex(
                                      (a) => a.id === admin.id
                                    ) >=
                                    currentOrgAdmins.length - 2
                                      ? document
                                          .querySelector(
                                            `[data-admin-id="${admin.id}"]`
                                          )
                                          ?.getBoundingClientRect().top - 180
                                      : document
                                          .querySelector(
                                            `[data-admin-id="${admin.id}"]`
                                          )
                                          ?.getBoundingClientRect().top
                                  }px`,
                                  left: `${
                                    currentOrgAdmins.findIndex(
                                      (a) => a.id === admin.id
                                    ) >=
                                    currentOrgAdmins.length - 2
                                      ? document
                                          .querySelector(
                                            `[data-admin-id="${admin.id}"]`
                                          )
                                          ?.getBoundingClientRect().left - 180
                                      : document
                                          .querySelector(
                                            `[data-admin-id="${admin.id}"]`
                                          )
                                          ?.getBoundingClientRect().left - 200
                                  }px`,
                                }}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setSelectedAdmin(admin);
                                      setShowEditAdminModal(true);
                                      setActiveAdminDropdown(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-darkModeText"
                                  >
                                    <Edit size={16} className="mr-2" />
                                    Edit Admin
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedAdmin(admin);
                                      setShowPasswordModal(true);
                                      setActiveAdminDropdown(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-darkModeText"
                                  >
                                    <Lock size={16} className="mr-2" />
                                    Reset Password
                                  </button>

                                  <button
                                    onClick={async () => {
                                      await toggleAdminStatus(admin);
                                      setActiveAdminDropdown(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-darkModeText"
                                  >
                                    {admin.is_active === 1 ? (
                                      <>
                                        <UserX size={16} className="mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={16} className="mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedAdmin(admin);
                                      setShowDeleteAdminModal(true);
                                      setActiveAdminDropdown(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 w-full text-left"
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete Admin
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {activeAdminDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveAdminDropdown(null)}
        />
      )}
    </div>
  );
};

export default SuperAdminLayout;
