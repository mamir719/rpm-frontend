// src/pages/AdminUsers.jsx
import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Lock,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import DeleteUserModal from "../components/DeleteUserModal";
import { X } from "lucide-react";

const ViewPatientsModal = ({ isOpen, onClose, clinician }) => {
  if (!isOpen || !clinician) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Assigned Patients: {clinician.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {clinician.assignedPatients && clinician.assignedPatients.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {clinician.assignedPatients.map((patient, index) => (
                <li key={index} className="py-3 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                    {patient.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">{patient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No patients assigned to this clinician yet.
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Dr. John Smith",
      email: "john.smith@hospital.com",
      phone: "+1 (555) 123-4567",
      role: "Doctor",
      department: "Cardiology",
      status: "Active",
      lastLogin: "2024-08-18 09:30 AM",
      createdAt: "2024-01-15",
      avatar: "JS",
      patientCount: 3,
      assignedPatients: ["Amir Khan", "Zain Ahmed", "Talha Mehmood"],
    },
    {
      id: 2,
      name: "Nurse Maria Garcia",
      email: "maria.garcia@hospital.com",
      phone: "+1 (555) 234-5678",
      role: "Nurse",
      department: "ICU",
      status: "Active",
      lastLogin: "2024-08-18 08:45 AM",
      createdAt: "2024-02-20",
      avatar: "MG",
      patientCount: 2,
      assignedPatients: ["Sarah Jenkins", "Robert Dow"],
    },
    {
      id: 3,
      name: "Dr. Robert Johnson",
      email: "robert.johnson@hospital.com",
      phone: "+1 (555) 345-6789",
      role: "Doctor",
      department: "Emergency",
      status: "Inactive",
      lastLogin: "2024-08-15 03:20 PM",
      createdAt: "2024-01-10",
      avatar: "RJ",
      patientCount: 1,
      assignedPatients: ["Michael Scott"],
    },
    {
      id: 4,
      name: "Admin Sarah Wilson",
      email: "sarah.wilson@hospital.com",
      phone: "+1 (555) 456-7890",
      role: "Admin",
      department: "IT",
      status: "Active",
      lastLogin: "2024-08-18 10:15 AM",
      createdAt: "2024-01-05",
      avatar: "SW",
    },
    {
      id: 5,
      name: "Technician Mike Brown",
      email: "mike.brown@hospital.com",
      phone: "+1 (555) 567-8901",
      role: "Technician",
      department: "Cardiology",
      status: "Active",
      lastLogin: "2024-08-17 04:30 PM",
      createdAt: "2024-03-01",
      avatar: "MB",
    },
    {
      id: 6,
      name: "Amir Khan",
      email: "amir@example.com",
      phone: "+1 (555) 678-9012",
      role: "Patient",
      status: "Active",
      lastLogin: "2024-08-18 02:00 PM",
      createdAt: "2024-05-10",
      avatar: "AK",
      assignedClinician: "Dr. John Smith",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showViewPatientsModal, setShowViewPatientsModal] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState(null);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "All" ||
      (selectedRole === "Clinician" && (user.role === "Doctor" || user.role === "Nurse" || user.role === "clinician")) ||
      (selectedRole === "Patient" && (user.role === "Patient" || user.role === "patient")) ||
      user.role === selectedRole;

    const matchesStatus =
      selectedStatus === "All" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: "Never",
      avatar: userData.name
        .split(" ")
        .map((n) => n[0])
        .join(""),
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
  };

  const handleEditUser = (userData) => {
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...userData } : user
      )
    );
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleResetPassword = () => {
    // In real app, this would trigger password reset email
    setShowPasswordModal(false);
    setSelectedUser(null);
    // Show success message
  };

  const handleDeleteUser = () => {
    setUsers(users.filter((user) => user.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
    doctors: users.filter((u) => u.role === "Doctor").length,
    nurses: users.filter((u) => u.role === "Nurse").length,
    admins: users.filter((u) => u.role === "Admin").length,
    technicians: users.filter((u) => u.role === "Technician").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage system users, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.doctors}
          </div>
          <div className="text-sm text-gray-600">Doctors</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.nurses}
          </div>
          <div className="text-sm text-gray-600">Nurses</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.admins}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-teal-600">
            {stats.technicians}
          </div>
          <div className="text-sm text-gray-600">Technicians</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {["All", "Clinician", "Patient"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSelectedRole(tab);
              // Reset other filters if needed
            }}
            className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${
              selectedRole === tab
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab === "Clinician" ? "Clinicians" : tab === "Patient" ? "Patients" : "All Users"}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Additional Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedRole === "All" ? "All Users" : selectedRole === "Clinician" ? "Clinicians" : "Patients"} ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                {selectedRole === "Clinician" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Patients
                  </th>
                )}
                {selectedRole === "Patient" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Clinician
                  </th>
                )}
                {selectedRole === "All" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {user.avatar || user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.role}</div>
                    {user.department && <div className="text-sm text-gray-500">{user.department}</div>}
                  </td>
                  {selectedRole === "Clinician" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedClinician(user);
                          setShowViewPatientsModal(true);
                        }}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        {user.patientCount || 0} Patients
                      </button>
                    </td>
                  )}
                  {selectedRole === "Patient" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {user.assignedClinician || "Unassigned"}
                      </span>
                    </td>
                  )}
                  {selectedRole === "All" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === "Patient" || user.role === "patient" ? (
                        <span className="text-xs text-gray-500">
                          Clinician: {user.assignedClinician || "None"}
                        </span>
                      ) : (user.role === "Doctor" || user.role === "Nurse" || user.role === "clinician") ? (
                        <span className="text-xs text-gray-500">
                          Patients: {user.patientCount || 0}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 mb-1">
                      <Mail size={14} className="mr-1" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone size={14} className="mr-1" />
                        {user.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === user.id ? null : user.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeDropdown === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit size={16} className="mr-2" />
                              Edit User
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPasswordModal(true);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Lock size={16} className="mr-2" />
                              Reset Password
                            </button>
                            <button
                              onClick={() => {
                                toggleUserStatus(user.id);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              {user.status === "Active" ? (
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
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete User
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={handleEditUser}
        />
      )}

      {showPasswordModal && selectedUser && (
        <ResetPasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={handleResetPassword}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={handleDeleteUser}
        />
      )}

      {showViewPatientsModal && selectedClinician && (
        <ViewPatientsModal
          isOpen={showViewPatientsModal}
          onClose={() => {
            setShowViewPatientsModal(false);
            setSelectedClinician(null);
          }}
          clinician={selectedClinician}
        />
      )}

      {/* Click outside to close dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
