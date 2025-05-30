
import { useState, useEffect, useCallback } from 'react';
import { AppStage } from '@/types/app';
import { ServiceCategory, DetailedUserCriteria, AIHealthPlan } from '@/types';

interface PersistedAppState {
  stage: AppStage;
  selectedCategories: ServiceCategory[];
  userCriteria: DetailedUserCriteria;
  userQuery: string;
  selectedPlan: AIHealthPlan | null;
  timestamp: number;
}

const STORAGE_KEY = 'health_app_offline_state';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook for persisting and restoring application state during offline scenarios
 */
export const useOfflinePersistence = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Save state to localStorage
  const saveState = useCallback((state: Partial<PersistedAppState>) => {
    try {
      const existingState = getPersistedState();
      const newState: PersistedAppState = {
        stage: 'home',
        selectedCategories: [],
        userCriteria: {
          categories: [],
          budget: {
            monthly: 2000,
            preferredSetup: 'not-sure',
            flexibleBudget: false
          }
        },
        userQuery: '',
        selectedPlan: null,
        timestamp: Date.now(),
        ...existingState,
        ...state
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      console.log('State persisted to localStorage');
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }, []);

  // Get persisted state from localStorage
  const getPersistedState = useCallback((): Partial<PersistedAppState> | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const state: PersistedAppState = JSON.parse(stored);
      
      // Check if state has expired
      if (Date.now() - state.timestamp > EXPIRY_TIME) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return state;
    } catch (error) {
      console.warn('Failed to retrieve persisted state:', error);
      return null;
    }
  }, []);

  // Clear persisted state
  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Persisted state cleared');
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  }, []);

  // Check if there's persisted state available
  const hasPersistedState = useCallback(() => {
    return getPersistedState() !== null;
  }, [getPersistedState]);

  // Mark as hydrated after initial load
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    saveState,
    getPersistedState,
    clearPersistedState,
    hasPersistedState,
    isHydrated
  };
};
