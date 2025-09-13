import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export interface PublicText {
  id: string;
  title: string;
  body: string;
  created_by: string;
  created_at: string;
}

export function usePublicTexts() {
  const [publicTexts, setPublicTexts] = useState<PublicText[]>([]);
  const [loading, setLoading] = useState(true);

  // Load public texts from Supabase
  const loadPublicTexts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setPublicTexts([]);
      setLoading(false);
      return;
    }

    try {
      // Get texts that are either public or in groups the user belongs to
      const { data, error } = await supabase
        .from('public_texts')
        .select(`
          *,
          text_groups(
            group_id,
            groups(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading public texts:', error);
        setPublicTexts([]);
      } else {
        // Filter and format texts
        const formattedTexts = (data || []).map(text => ({
          ...text,
          groups: text.text_groups?.map(tg => tg.groups?.name).filter(Boolean) || []
        }));
        
        setPublicTexts(formattedTexts);
      }
    } catch (error) {
      console.error('Error loading public texts:', error);
      setPublicTexts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load texts on mount
  useEffect(() => {
    loadPublicTexts();
  }, [loadPublicTexts]);

  const savePublicText = useCallback(async (textId: string) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the public text details
      const { data: publicText, error: fetchError } = await supabase
        .from('public_texts')
        .select('*')
        .eq('id', textId)
        .single();

      if (fetchError || !publicText) {
        return { success: false, error: 'Text not found' };
      }

      // Save to user's personal texts
      const { error } = await supabase
        .from('texts')
        .insert([{
          title: publicText.title,
          content: publicText.body,
          user_id: user.id,
          date_added: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error saving public text to personal collection:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving public text to personal collection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  return {
    publicTexts,
    loading,
    loadPublicTexts,
    savePublicText
  };
}