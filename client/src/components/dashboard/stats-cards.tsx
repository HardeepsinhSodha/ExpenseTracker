import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';
import { 
  CreditCard, 
  PiggyBank, 
  Tags, 
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  monthlyTotal: number;
  budgetRemaining: number;
  categoriesCount: number;
  savingsProgress: number;
  budgetAmount: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center h-24">
              <LoadingSpinner />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load stats
          </div>
        </Card>
      </div>
    );
  }

  const budgetUsedPercentage = (stats.monthlyTotal / stats.budgetAmount) * 100;
  const budgetRemainingPercentage = 100 - budgetUsedPercentage;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Expenses */}
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(stats.monthlyTotal)}
              </p>
              <p className="text-sm text-red-500 flex items-center mt-1">
                <TrendingUp className="mr-1" size={12} />
                12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="text-red-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Remaining */}
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Budget Remaining</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.budgetRemaining)}
              </p>
              <p className="text-sm text-green-500 flex items-center mt-1">
                <CheckCircle className="mr-1" size={12} />
                {budgetRemainingPercentage.toFixed(0)}% remaining
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
              <PiggyBank className="text-green-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Categories */}
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
              <p className="text-2xl font-bold text-foreground">{stats.categoriesCount}</p>
              <p className="text-sm text-blue-500 flex items-center mt-1">
                <Tags className="mr-1" size={12} />
                2 custom added
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Tags className="text-blue-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Goal */}
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Savings Goal</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.savingsProgress)}
              </p>
              <p className="text-sm text-orange-500 flex items-center mt-1">
                <Target className="mr-1" size={12} />
                84% of {formatCurrency(10000)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Target className="text-orange-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
