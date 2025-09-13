import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from './useAuth';

export interface CustomText {
  id: string;
  title: string;
  content: string;
  dateAdded: Date;
}

export function useTexts() {
  const { user } = useAuth();
  const [texts, setTexts] = useState<CustomText[]>([]);
  const [loading, setLoading] = useState(true);

  // Load texts from Supabase
  const loadTexts = useCallback(async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      setTexts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('texts')
        .select('*')
        .eq('user_id', user.uid)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error loading texts:', error);
        setTexts([]);
      } else {
        const formattedTexts = (data || []).map(text => ({
          id: text.id,
          title: text.title,
          content: text.content,
          dateAdded: new Date(text.date_added)
        }));
        setTexts(formattedTexts);
      }
    } catch (error) {
      console.error('Error loading texts:', error);
      setTexts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load texts when user changes
  useEffect(() => {
    loadTexts();
  }, [loadTexts]);

  const addText = useCallback(async (newText: { title: string; content: string }) => {
    if (!user) return { success: false };

    try {
      const textToAdd = {
        title: newText.title.trim(),
        content: newText.content.trim(),
        date_added: new Date().toISOString(),
        user_id: user.uid
      };

      const { data, error } = await supabase
        .from('texts')
        .insert([textToAdd])
        .select();

      if (error) {
        console.error('Error adding text:', error);
        return { success: false };
      }

      // Add to local state
      const formattedText = {
        id: data[0].id,
        title: data[0].title,
        content: data[0].content,
        dateAdded: new Date(data[0].date_added)
      };

      setTexts(prev => [formattedText, ...prev]);
      return { success: true };
    } catch (error) {
      console.error('Error adding text:', error);
      return { success: false };
    }
  }, [user]);

  const deleteText = useCallback(async (textId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('texts')
        .delete()
        .eq('id', textId)
        .eq('user_id', user.uid);

      if (error) {
        console.error('Error deleting text:', error);
        return { success: false };
      }

      // Remove from local state
      setTexts(prev => prev.filter(text => text.id !== textId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting text:', error);
      return { success: false };
    }
  }, [user]);

  return {
    texts,
    loading,
    addText,
    deleteText,
    loadTexts
  };
}