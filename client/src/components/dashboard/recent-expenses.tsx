import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Search, Filter, Edit, Trash2 } from 'lucide-react';
import type { ExpenseWithCategory } from '@shared/schema';

export function RecentExpenses() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ['/api/expenses', { limit: 10 }],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Expense deleted',
        description: 'The expense has been successfully deleted.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteExpense = (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const filteredExpenses = expenses?.filter(expense =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Food & Drinks': '🍕',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Health & Medical': '🏥',
      'Utilities': '💡',
      'Travel': '✈️',
      'Education': '📚',
    };
    return iconMap[category] || '📝';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Food & Drinks': 'text-red-500 bg-red-100 dark:bg-red-500/20',
      'Transportation': 'text-blue-500 bg-blue-100 dark:bg-blue-500/20',
      'Shopping': 'text-green-500 bg-green-100 dark:bg-green-500/20',
      'Entertainment': 'text-purple-500 bg-purple-100 dark:bg-purple-500/20',
      'Health & Medical': 'text-orange-500 bg-orange-100 dark:bg-orange-500/20',
      'Utilities': 'text-gray-500 bg-gray-100 dark:bg-gray-500/20',
      'Travel': 'text-red-600 bg-red-100 dark:bg-red-600/20',
      'Education': 'text-indigo-500 bg-indigo-100 dark:bg-indigo-500/20',
    };
    return colorMap[category] || 'text-gray-500 bg-gray-100 dark:bg-gray-500/20';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
            </div>
            <Button variant="ghost" size="icon">
              <Filter size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !filteredExpenses || filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? 'No expenses found matching your search.' : 'No expenses found.'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(expense.category.name)}`}>
                      <span className="text-xl">{getCategoryIcon(expense.category.name)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{expense.description}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span>{expense.category.name}</span>
                        <span>{formatRelativeTime(expense.date)}</span>
                        <span>{expense.paymentMode}</span>
                        {expense.isRecurring && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            🔄 Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(parseFloat(expense.amount))}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary-foreground"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={deleteExpenseMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="p-6 border-t border-border">
          <Button variant="ghost" className="w-full text-primary">
            View All Expenses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
