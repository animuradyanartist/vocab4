import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from './useAuth';

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface GroupMember {
  user_id: string;
  group_id: string;
  added_at: string;
  added_by: string;
  user_email?: string;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all groups (admin only)
  const loadGroups = useCallback(async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          user_groups(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsWithCount = (data || []).map(group => ({
        ...group,
        member_count: group.user_groups?.length || 0
      }));

      setGroups(groupsWithCount);
    } catch (error) {
      console.error('Error loading groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Create a new group
  const createGroup = useCallback(async (groupData: { name: string; description?: string }) => {
    if (!user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: groupData.name.trim(),
          description: groupData.description?.trim() || null,
          created_by: user.uid
        }])
        .select()
        .single();

      if (error) throw error;

      // Reload groups to get updated list
      loadGroups();
      return { success: true, group: data };
    } catch (error) {
      console.error('Error creating group:', error);
      return { success: false, error: error.message };
    }
  }, [user, loadGroups]);

  // Update a group
  const updateGroup = useCallback(async (groupId: string, updates: { name?: string; description?: string }) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;

      // Reload groups to get updated list
      loadGroups();
      return { success: true };
    } catch (error) {
      console.error('Error updating group:', error);
      return { success: false, error: error.message };
    }
  }, [user, loadGroups]);

  // Delete a group
  const deleteGroup = useCallback(async (groupId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      // Reload groups to get updated list
      loadGroups();
      return { success: true };
    } catch (error) {
      console.error('Error deleting group:', error);
      return { success: false, error: error.message };
    }
  }, [user, loadGroups]);

  // Get group members
  const getGroupMembers = useCallback(async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select(`
          *,
          user_profiles!user_groups_user_id_fkey(email)
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      return (data || []).map(member => ({
        ...member,
        user_email: member.user_profiles?.email
      }));
    } catch (error) {
      console.error('Error loading group members:', error);
      return [];
    }
  }, []);

  // Add user to group
  const addUserToGroup = useCallback(async (userId: string, groupId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('user_groups')
        .insert([{
          user_id: userId,
          group_id: groupId,
          added_by: user.uid
        }]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error adding user to group:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Remove user from group
  const removeUserFromGroup = useCallback(async (userId: string, groupId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', groupId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing user from group:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Get available users (not in a specific group)
  const getAvailableUsers = useCallback(async (groupId?: string) => {
    try {
      let query = supabase
        .from('user_profiles')
        .select('id, email')
        .eq('is_active', true)
        .order('email');

      const { data, error } = await query;

      if (error) throw error;

      // If groupId provided, filter out users already in the group
      if (groupId) {
        const { data: groupMembers } = await supabase
          .from('user_groups')
          .select('user_id')
          .eq('group_id', groupId);

        const memberIds = new Set((groupMembers || []).map(m => m.user_id));
        return (data || []).filter(user => !memberIds.has(user.id));
      }

      return data || [];
    } catch (error) {
      console.error('Error loading available users:', error);
      return [];
    }
  }, []);

  return {
    groups,
    loading,
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addUserToGroup,
    removeUserFromGroup,
    getAvailableUsers
  };
}