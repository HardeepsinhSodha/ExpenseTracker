import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExpenseFilters {
  category?: string;
  paymentMode?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

interface ExpenseState {
  filters: ExpenseFilters;
  setFilters: (filters: Partial<ExpenseFilters>) => void;
  clearFilters: () => void;
  
  // Quick add form state
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  
  // Selected expense for editing
  selectedExpenseId: number | null;
  setSelectedExpenseId: (id: number | null) => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      filters: {},
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      clearFilters: () => set({ filters: {} }),
      
      quickAddOpen: false,
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),
      
      selectedExpenseId: null,
      setSelectedExpenseId: (id) => set({ selectedExpenseId: id }),
    }),
    {
      name: 'expense-store',
    }
  )
);
