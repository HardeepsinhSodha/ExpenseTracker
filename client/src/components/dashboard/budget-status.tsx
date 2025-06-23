import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency, calculateBudgetPercentage } from '@/lib/utils';
import type { BudgetWithCategory } from '@shared/schema';

interface BudgetStatusProps {
  monthlyTotal: number;
}

export function BudgetStatus({ monthlyTotal }: BudgetStatusProps) {
  const { data: budgets, isLoading } = useQuery<BudgetWithCategory[]>({
    queryKey: ['/api/budgets'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallBudget = budgets?.find(b => b.isOverall);
  const categoryBudgets = budgets?.filter(b => !b.isOverall && b.category) || [];
  
  // Mock data for demonstration
  const mockBudgetData = {
    overall: {
      amount: 5000,
      spent: monthlyTotal,
    },
    categories: [
      { name: '🍕 Food', spent: 680, budget: 800 },
      { name: '🚗 Transport', spent: 420, budget: 400 },
      { name: '🛍️ Shopping', spent: 180, budget: 300 },
    ]
  };

  const overallPercentage = calculateBudgetPercentage(mockBudgetData.overall.spent, mockBudgetData.overall.amount);
  const remaining = mockBudgetData.overall.amount - mockBudgetData.overall.spent;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Budget */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Monthly Budget</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(mockBudgetData.overall.spent)} / {formatCurrency(mockBudgetData.overall.amount)}
            </span>
          </div>
          <Progress 
            value={overallPercentage} 
            className="h-3"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {overallPercentage.toFixed(0)}% used • {formatCurrency(remaining)} remaining
          </p>
        </div>

        {/* Category Budgets */}
        <div className="space-y-4">
          {mockBudgetData.categories.map((category, index) => {
            const percentage = calculateBudgetPercentage(category.spent, category.budget);
            const isOverBudget = category.spent > category.budget;
            
            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                />
                {isOverBudget && (
                  <p className="text-xs text-red-500 mt-1">
                    Over budget by {formatCurrency(category.spent - category.budget)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="ghost" className="w-full text-primary">
          Manage Budgets
        </Button>
      </CardContent>
    </Card>
  );
}
