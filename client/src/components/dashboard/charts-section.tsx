import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';

// Import Chart.js
declare global {
  interface Window {
    Chart: any;
  }
}

interface MonthlyTrend {
  month: string;
  total: number;
}

interface CategoryTotal {
  categoryId: number;
  categoryName: string;
  total: number;
}

export function ChartsSection() {
  const monthlyTrendsRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const monthlyTrendsChartRef = useRef<any>(null);
  const categoryChartInstance = useRef<any>(null);

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ['/api/analytics/monthly-trends'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categoryTotals, isLoading: categoryLoading } = useQuery<CategoryTotal[]>({
    queryKey: ['/api/analytics/category-totals', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date().toISOString(),
    }],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!monthlyTrends || !monthlyTrendsRef.current || !window.Chart) return;

    // Destroy existing chart
    if (monthlyTrendsChartRef.current) {
      monthlyTrendsChartRef.current.destroy();
    }

    const ctx = monthlyTrendsRef.current.getContext('2d');
    if (!ctx) return;

    monthlyTrendsChartRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyTrends.map(trend => trend.month),
        datasets: [{
          label: 'Expenses',
          data: monthlyTrends.map(trend => trend.total),
          borderColor: 'hsl(207, 90%, 54%)',
          backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }, {
          label: 'Budget',
          data: monthlyTrends.map(() => 5000),
          borderColor: 'hsl(25, 95%, 53%)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    });

    return () => {
      if (monthlyTrendsChartRef.current) {
        monthlyTrendsChartRef.current.destroy();
      }
    };
  }, [monthlyTrends]);

  useEffect(() => {
    if (!categoryTotals || !categoryChartRef.current || !window.Chart) return;

    // Destroy existing chart
    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }

    const ctx = categoryChartRef.current.getContext('2d');
    if (!ctx) return;

    const colors = [
      'hsl(0, 84%, 60%)',
      'hsl(207, 90%, 54%)',
      'hsl(142, 71%, 45%)',
      'hsl(262, 83%, 58%)',
      'hsl(25, 95%, 53%)',
      'hsl(210, 20%, 56%)',
      'hsl(14, 100%, 57%)',
      'hsl(231, 48%, 48%)',
    ];

    categoryChartInstance.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryTotals.map(cat => cat.categoryName),
        datasets: [{
          data: categoryTotals.map(cat => cat.total),
          backgroundColor: colors.slice(0, categoryTotals.length),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          }
        }
      }
    });

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
    };
  }, [categoryTotals]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Monthly Expense Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Trends</CardTitle>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">6M</Button>
              <Button variant="ghost" size="sm">1Y</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[300px] md:h-[250px]">
            {trendsLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : (
              <canvas ref={monthlyTrendsRef} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Category Breakdown</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[300px] md:h-[250px]">
            {categoryLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : (
              <canvas ref={categoryChartRef} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
