import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Database, Settings, Trash2, Edit3, Plus, Search, Eye, Calendar, User, BarChart3, UserPlus, UserMinus, Group } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import { useGroups } from '../hooks/useGroups';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  word_count: number;
  text_count: number;
  is_admin: boolean;
  is_active: boolean;
}

interface PublicText {
  id: string;
  title: string;
  body: string;
  created_by: string;
  created_at: string;
  creator_email?: string;
}

interface AdminStats {
  totalUsers: number;
  totalWords: number;
  totalTexts: number;
  totalPublicTexts: number;
  activeUsersToday: number;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    groups, 
    loading: groupsLoading, 
    createGroup, 
    updateGroup, 
    deleteGroup, 
    getGroupMembers, 
    addUserToGroup, 
    removeUserFromGroup, 
    getAvailableUsers 
  } = useGroups();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'groups' | 'public-texts' | 'settings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [publicTexts, setPublicTexts] = useState<PublicText[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalWords: 0,
    totalTexts: 0,
    totalPublicTexts: 0,
    activeUsersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [newText, setNewText] = useState({ title: '', body: '' });
  const [editingText, setEditingText] = useState<PublicText | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  
  // Group management state
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [textVisibility, setTextVisibility] = useState<'public' | 'groups'>('public');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [selectedUsersForNewGroup, setSelectedUsersForNewGroup] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
      if (activeTab === 'groups') {
        loadAllUsers();
      }
    }
  }, [isAdmin, activeTab]);

  const checkAdminStatus = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.uid)
        .single();

      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        activeTab === 'users' && loadUsers(),
        activeTab === 'groups' && loadGroupData(),
        activeTab === 'public-texts' && loadPublicTexts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total registered users from user_profiles
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total words
      const { count: wordsCount } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true });

      // Get total texts
      const { count: textsCount } = await supabase
        .from('texts')
        .select('*', { count: 'exact', head: true });

      // Get total public texts
      const { count: publicTextsCount } = await supabase
        .from('public_texts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalWords: wordsCount || 0,
        totalTexts: textsCount || 0,
        totalPublicTexts: publicTextsCount || 0,
        activeUsersToday: 0 // This would require auth.users access
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // Get ALL registered users from user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get admin users list
      const { data: adminData } = await supabase
        .from('admins')
        .select('user_id');
      
      const adminUserIds = new Set((adminData || []).map(admin => admin.user_id));
      
      // Get word and text counts for each user
      const usersWithData = await Promise.all(
        (data || []).map(async (profile) => {
          // Get word count
          const { count: wordCount } = await supabase
            .from('words')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // Get text count
          const { count: textCount } = await supabase
            .from('texts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          return {
            id: profile.id,
            email: profile.email,
            created_at: profile.created_at,
            last_sign_in_at: profile.last_sign_in_at || profile.created_at,
            word_count: wordCount || 0,
            text_count: textCount || 0,
            is_admin: adminUserIds.has(profile.id),
            is_active: profile.is_active
          };
        })
      );

      setUsers(usersWithData);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadPublicTexts = async () => {
    try {
      let query = supabase
        .from('public_texts')
        .select(`
          *,
          text_groups(
            group_id,
            groups(name)
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      const textsWithGroups = (data || []).map(text => ({
        ...text,
        groups: text.text_groups?.map(tg => tg.groups?.name).filter(Boolean) || []
      }));
      
      setPublicTexts(textsWithGroups);
    } catch (error) {
      console.error('Error loading public texts:', error);
    }
  };

  const addPublicText = async () => {
    if (!newText.title.trim() || !newText.body.trim()) return;

    try {
      const { data: textData, error } = await supabase
        .from('public_texts')
        .insert([{
          title: newText.title.trim(),
          body: newText.body.trim(),
          created_by: user!.uid,
          visibility: textVisibility,
          created_for_groups: textVisibility === 'groups'
        }])
        .select()
        .single();

      if (error) throw error;

      // If creating for groups, add group associations
      if (textVisibility === 'groups' && selectedGroups.length > 0 && textData) {
        const groupAssociations = selectedGroups.map(groupId => ({
          text_id: textData.id,
          group_id: groupId
        }));

        const { error: groupError } = await supabase
          .from('text_groups')
          .insert(groupAssociations);

        if (groupError) throw groupError;
      }

      setNewText({ title: '', body: '' });
      setSelectedGroups([]);
      setTextVisibility('public');
      setIsAddingText(false);
      loadPublicTexts();
    } catch (error) {
      console.error('Error adding public text:', error);
    }
  };

  const editPublicText = async (text: PublicText) => {
    setEditingText(text);
    setNewText({ title: text.title, body: text.body });
    setTextVisibility(text.visibility || 'public');
    
    // Load current group associations
    if (text.visibility === 'groups') {
      const { data } = await supabase
        .from('text_groups')
        .select('group_id')
        .eq('text_id', text.id);
      
      setSelectedGroups((data || []).map(tg => tg.group_id));
    }
    
    setIsEditingText(true);
  };

  const updatePublicText = async () => {
    if (!editingText || !newText.title.trim() || !newText.body.trim()) return;

    try {
      const { error } = await supabase
        .from('public_texts')
        .update({
          title: newText.title.trim(),
          body: newText.body.trim(),
          visibility: textVisibility,
          created_for_groups: textVisibility === 'groups'
        })
        .eq('id', editingText.id);

      if (error) throw error;

      // Update group associations if needed
      if (textVisibility === 'groups') {
        // Remove existing associations
        await supabase
          .from('text_groups')
          .delete()
          .eq('text_id', editingText.id);

        // Add new associations
        if (selectedGroups.length > 0) {
          const groupAssociations = selectedGroups.map(groupId => ({
            text_id: editingText.id,
            group_id: groupId
          }));

          await supabase
            .from('text_groups')
            .insert(groupAssociations);
        }
      }

      setNewText({ title: '', body: '' });
      setSelectedGroups([]);
      setTextVisibility('public');
      setIsEditingText(false);
      setEditingText(null);
      loadPublicTexts();
    } catch (error) {
      console.error('Error updating public text:', error);
    }
  };

  const cancelEdit = () => {
    setNewText({ title: '', body: '' });
    setSelectedGroups([]);
    setTextVisibility('public');
    setIsEditingText(false);
    setEditingText(null);
  };

  const deletePublicText = async (textId: string) => {
    if (!confirm('Are you sure you want to delete this public text?')) return;

    try {
      const { error } = await supabase
        .from('public_texts')
        .delete()
        .eq('id', textId);

      if (error) throw error;
      loadPublicTexts();
    } catch (error) {
      console.error('Error deleting public text:', error);
    }
  };

  // Group management functions
  const loadGroupData = async () => {
    if (selectedGroup) {
      const members = await getGroupMembers(selectedGroup);
      setGroupMembers(members);
      
      const available = await getAvailableUsers(selectedGroup);
      setAvailableUsers(available);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('is_active', true)
        .order('email');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error loading all users:', error);
      setAllUsers([]);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;

    const result = await createGroup(newGroup);
    if (result.success) {
      // Add selected users to the new group
      if (selectedUsersForNewGroup.length > 0 && result.group) {
        for (const userId of selectedUsersForNewGroup) {
          await addUserToGroup(userId, result.group.id);
        }
      }
      
      setNewGroup({ name: '', description: '' });
      setSelectedUsersForNewGroup([]);
      setIsAddingGroup(false);
    }
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setNewGroup({ name: group.name, description: group.description || '' });
    setIsEditingGroup(true);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !newGroup.name.trim()) return;

    const result = await updateGroup(editingGroup.id, {
      name: newGroup.name.trim(),
      description: newGroup.description?.trim() || null
    });

    if (result.success) {
      setNewGroup({ name: '', description: '' });
      setEditingGroup(null);
      setIsEditingGroup(false);
    }
  };

  const cancelGroupEdit = () => {
    setNewGroup({ name: '', description: '' });
    setEditingGroup(null);
    setIsEditingGroup(false);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This will remove all members and text associations.')) return;
    
    await deleteGroup(groupId);
  };

  const handleAddUserToGroup = async (userId: string) => {
    if (!selectedGroup) return;
    
    const result = await addUserToGroup(userId, selectedGroup);
    if (result.success) {
      loadGroupData();
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!selectedGroup) return;
    
    const result = await removeUserFromGroup(userId, selectedGroup);
    if (result.success) {
      loadGroupData();
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-orange-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-indigo-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-600">Platform management and analytics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-2 mb-4 md:mb-6">
          <div className="flex space-x-1 md:space-x-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'groups', label: 'Groups', icon: Group },
              { id: 'public-texts', label: 'Public Texts', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-1 md:space-x-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 whitespace-nowrap text-xs md:text-sm ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total Users</p>
                    <p className="text-xl md:text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total Words</p>
                    <p className="text-xl md:text-3xl font-bold text-green-600">{stats.totalWords}</p>
                  </div>
                  <Database className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">User Texts</p>
                    <p className="text-xl md:text-3xl font-bold text-orange-600">{stats.totalTexts}</p>
                  </div>
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Public Texts</p>
                    <p className="text-xl md:text-3xl font-bold text-purple-600">{stats.totalPublicTexts}</p>
                  </div>
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Platform Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm md:text-base text-gray-700">System Status</span>
                  <span className="text-xs md:text-sm text-green-600 font-medium">✅ Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm md:text-base text-gray-700">Database Connection</span>
                  <span className="text-xs md:text-sm text-green-600 font-medium">✅ Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm md:text-base text-gray-700">Analytics Tracking</span>
                  <span className="text-xs md:text-sm text-green-600 font-medium">✅ Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">User Management</h3>
                <div className="relative">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 md:pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base w-full sm:w-auto"
                    placeholder="Search users..."
                   style={{ color: '#111827' }}
                  />
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">User ID</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">Email</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm hidden sm:table-cell">Status</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">Words</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm hidden md:table-cell">Texts</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm hidden lg:table-cell">Registration</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm hidden sm:table-cell">Role</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user => 
                      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 md:py-3 px-2 md:px-4">
                          <div className="font-medium text-gray-800 text-xs md:text-sm">{user.id.slice(0, 8)}...</div>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4">
                          <div className="text-xs md:text-sm text-gray-700 truncate max-w-32 md:max-w-none">{user.email}</div>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4">
                          <span className="font-medium text-indigo-600 text-xs md:text-sm">{user.word_count}</span>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">
                          <span className="font-medium text-purple-600 text-xs md:text-sm">{user.text_count}</span>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 hidden lg:table-cell">
                          <div className="text-xs md:text-sm">{new Date(user.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500 hidden md:block">
                            Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_admin 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4">
                          <button 
                            className="text-blue-600 hover:text-blue-700 mr-2"
                            title="View user details"
                          >
                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Group Management</h3>
                <button
                  onClick={() => setIsAddingGroup(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 md:px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center space-x-2 text-sm md:text-base w-full sm:w-auto justify-center"
                  disabled={isEditingGroup}
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{isEditingGroup ? 'Editing...' : 'Create Group'}</span>
                </button>
              </div>

              {/* Create Group Form */}
              {(isAddingGroup || isEditingGroup) && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">
                    {isEditingGroup ? 'Edit Group' : 'Create New Group'}
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                      placeholder="Group name..."
                      style={{ color: '#111827' }}
                    />
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm md:text-base"
                      rows={2}
                      placeholder="Group description (optional)..."
                      style={{ color: '#111827' }}
                    />
                    
                    {/* User Selection for New Groups */}
                    {isAddingGroup && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Users to Group</label>
                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                          {allUsers.map((user) => (
                            <label key={user.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedUsersForNewGroup.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsersForNewGroup([...selectedUsersForNewGroup, user.id]);
                                  } else {
                                    setSelectedUsersForNewGroup(selectedUsersForNewGroup.filter(id => id !== user.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">{user.email}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedUsersForNewGroup.length} user{selectedUsersForNewGroup.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={isEditingGroup ? handleUpdateGroup : handleCreateGroup}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm md:text-base"
                      >
                        {isEditingGroup ? 'Update Group' : 'Create Group'}
                      </button>
                      <button
                        onClick={() => {
                          if (isEditingGroup) {
                            cancelGroupEdit();
                          } else {
                            setIsAddingGroup(false);
                            setNewGroup({ name: '', description: '' });
                            setSelectedUsersForNewGroup([]);
                          }
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm md:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Groups List */}
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="p-3 md:p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">{group.name}</h4>
                        {group.description && (
                          <p className="text-gray-600 text-xs md:text-sm mb-2">{group.description}</p>
                        )}
                        <div className="flex items-center text-xs md:text-sm text-gray-500">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                          <span className="ml-4">{group.member_count || 0} members</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-4">
                        <button
                          onClick={() => {
                            setSelectedGroup(group.id);
                            setShowGroupMembers(true);
                            loadGroupData();
                          }}
                          disabled={isAddingGroup || isEditingGroup}
                          className="text-blue-600 hover:text-blue-700"
                          title="Manage members"
                        >
                          <Users className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleEditGroup(group)}
                          disabled={isAddingGroup || isEditingGroup}
                          className="text-green-600 hover:text-green-700"
                          title="Edit group"
                        >
                          <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={isAddingGroup || isEditingGroup}
                          className="text-red-600 hover:text-red-700"
                          title="Delete group"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Members Modal */}
            {showGroupMembers && selectedGroup && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">Manage Group Members</h3>
                    <button
                      onClick={() => {
                        setShowGroupMembers(false);
                        setSelectedGroup(null);
                      }}
                    >
                      <Plus className="w-6 h-6 text-gray-500 rotate-45" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Current Members */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Current Members ({groupMembers.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {groupMembers.map((member) => (
                          <div key={member.user_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">{member.user_email}</span>
                            <button
                              onClick={() => handleRemoveUserFromGroup(member.user_id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Remove from group"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Available Users */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Add Users ({availableUsers.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">{user.email}</span>
                            <button
                              onClick={() => handleAddUserToGroup(user.id)}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Add to group"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Public Texts Tab */}
        {activeTab === 'public-texts' && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Public Texts Management</h3>
                <button
                  onClick={() => setIsAddingText(true)}
                  disabled={isEditingText}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 md:px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center space-x-2 text-sm md:text-base w-full sm:w-auto justify-center"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{isEditingText ? 'Editing...' : 'Add Text'}</span>
                </button>
              </div>

              {(isAddingText || isEditingText) && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">
                    {isEditingText ? 'Edit Public Text' : 'Add New Public Text'}
                  </h4>
                  <div className="space-y-3">
                    {/* Visibility Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="public"
                            checked={textVisibility === 'public'}
                            onChange={(e) => setTextVisibility(e.target.value as 'public' | 'groups')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Public (everyone can see)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="groups"
                            checked={textVisibility === 'groups'}
                            onChange={(e) => setTextVisibility(e.target.value as 'public' | 'groups')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Groups only</span>
                        </label>
                      </div>
                    </div>

                    {/* Group Selection */}
                    {textVisibility === 'groups' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Groups</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                          {groups.map((group) => (
                            <label key={group.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedGroups.includes(group.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGroups([...selectedGroups, group.id]);
                                  } else {
                                    setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                  }
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">{group.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <input
                      type="text"
                      value={newText.title}
                      onChange={(e) => setNewText({ ...newText, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                      placeholder="Text title..."
                      style={{ color: '#111827' }}
                    />
                    <textarea
                      value={newText.body}
                      onChange={(e) => setNewText({ ...newText, body: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm md:text-base"
                      rows={4}
                      placeholder="Text content..."
                      style={{ color: '#111827' }}
                    />
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={isEditingText ? updatePublicText : addPublicText}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm md:text-base"
                      >
                        {isEditingText ? 'Update' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          if (isEditingText) {
                            cancelEdit();
                          } else {
                            setIsAddingText(false);
                            setNewText({ title: '', body: '' });
                          }
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm md:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {publicTexts.map((text) => (
                  <div key={text.id} className="p-3 md:p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">{text.title}</h4>
                        <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">
                          {text.body.substring(0, 200)}...
                        </p>
                        <div className="flex items-center text-xs md:text-sm text-gray-500">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span>Created {new Date(text.created_at).toLocaleDateString()}</span>
                          <span className="ml-4 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                            {(text as any).visibility === 'groups' ? 'Groups Only' : 'Public'}
                          </span>
                          {(text as any).groups && (text as any).groups.length > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              Groups: {(text as any).groups.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-4">
                        <button 
                          onClick={() => editPublicText(text)}
                          disabled={isAddingText || isEditingText}
                          className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit text"
                        >
                          <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => deletePublicText(text.id)}
                          disabled={isAddingText || isEditingText}
                          className="text-red-600 hover:text-red-700"
                          title="Delete text"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Platform Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base">User Registration</h4>
                    <p className="text-xs md:text-sm text-gray-600">Allow new users to register</p>
                  </div>
                  <button className="bg-green-500 text-white px-3 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm">Enabled</button>
                </div>
                
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base">Public Text Access</h4>
                    <p className="text-xs md:text-sm text-gray-600">Allow users to access public texts</p>
                  </div>
                  <button className="bg-green-500 text-white px-3 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm">Enabled</button>
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base">Analytics Tracking</h4>
                    <p className="text-xs md:text-sm text-gray-600">Microsoft Clarity analytics</p>
                  </div>
                  <button className="bg-green-500 text-white px-3 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm">Active</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;