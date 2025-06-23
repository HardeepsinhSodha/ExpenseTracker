import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ChartsSection } from '@/components/dashboard/charts-section';
import { RecentExpenses } from '@/components/dashboard/recent-expenses';
import { QuickAddForm } from '@/components/dashboard/quick-add-form';
import { BudgetStatus } from '@/components/dashboard/budget-status';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Financial Dashboard</h2>
              <p className="text-muted-foreground mt-1">Track your expenses and manage your budget</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Add Expense</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download size={16} />
                <span>Export</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <StatsCards />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <ChartsSection />
        </div>

        {/* Expense Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Expenses */}
          <div className="lg:col-span-2">
            <RecentExpenses />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <QuickAddForm />
            <BudgetStatus monthlyTotal={stats?.monthlyTotal || 0} />
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Button 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg md:hidden"
        size="icon"
      >
        <Plus size={20} />
      </Button>
    </div>
  );
}
