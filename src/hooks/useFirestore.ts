import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from './useAuth';

export interface Word {
  id: string;
  english: string;
  translation: string; // ✅ renamed for UI
  dateAdded: Date;
  isLearned?: boolean;
}

export function useFirestore() {
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  // Load words from Supabase
  const loadWords = useCallback(async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      setWords([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', user.uid)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error loading words:', error);
        setWords([]);
      } else {
        const formattedWords = (data || []).map((word: any) => ({
          id: word.id,
          english: word.english,
          translation: word.armenian, // ✅ map DB -> UI
          dateAdded: new Date(word.date_added),
          isLearned: word.is_learned || false,
        }));
        setWords(formattedWords);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load words when user changes
  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const addWords = useCallback(
    async (newWords: { english: string; translation: string }[]) => {
      if (!user) return { success: false };

      try {
        const wordsToAdd = newWords.map((word) => ({
          english: word.english.trim(),
          armenian: word.translation.trim(), // ✅ map UI -> DB
          date_added: new Date().toISOString(),
          is_learned: false,
          user_id: user.uid,
        }));

        const { data, error } = await supabase
          .from('words')
          .insert(wordsToAdd)
          .select();

        if (error) {
          console.error('Error adding words:', error);
          return { success: false };
        }

        // Add to local state
        const formattedWords = (data || []).map((word: any) => ({
          id: word.id,
          english: word.english,
          translation: word.armenian, // ✅ map DB -> UI
          dateAdded: new Date(word.date_added),
          isLearned: word.is_learned || false,
        }));

        setWords((prev) => [...formattedWords, ...prev]);
        return { success: true };
      } catch (error) {
        console.error('Error adding words:', error);
        return { success: false };
      }
    },
    [user]
  );

  const updateWord = useCallback(
    async (wordId: string, updates: Partial<Word>) => {
      if (!user) return { success: false };

      try {
        const updateData: any = {};
        if (updates.english) updateData.english = updates.english;
        if (updates.translation) updateData.armenian = updates.translation; // ✅ map UI -> DB
        if (updates.isLearned !== undefined) updateData.is_learned = updates.isLearned;

        const { error } = await supabase
          .from('words')
          .update(updateData)
          .eq('id', wordId)
          .eq('user_id', user.uid);

        if (error) {
          console.error('Error updating word:', error);
          return { success: false };
        }

        // Update local state
        setWords((prev) =>
          prev.map((word) =>
            word.id === wordId ? { ...word, ...updates } : word
          )
        );

        return { success: true };
      } catch (error) {
        console.error('Error updating word:', error);
        return { success: false };
      }
    },
    [user]
  );

  const deleteWord = useCallback(
    async (wordId: string) => {
      if (!user) return { success: false };

      try {
        const { error } = await supabase
          .from('words')
          .delete()
          .eq('id', wordId)
          .eq('user_id', user.uid);

        if (error) {
          console.error('Error deleting word:', error);
          return { success: false };
        }

        // Remove from local state
        setWords((prev) => prev.filter((word) => word.id !== wordId));
        return { success: true };
      } catch (error) {
        console.error('Error deleting word:', error);
        return { success: false };
      }
    },
    [user]
  );

  return {
    words,
    loading,
    addWords,
    updateWord,
    deleteWord,
    loadWords,
  };
}
