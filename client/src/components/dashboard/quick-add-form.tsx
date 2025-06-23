import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertExpenseSchema, type Category } from '@shared/schema';
import { z } from 'zod';
import { Plus } from 'lucide-react';

const quickAddSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, 'Amount is required').transform(Number),
  categoryId: z.string().min(1, 'Category is required').transform(Number),
  date: z.string().min(1, 'Date is required'),
});

type QuickAddFormData = z.infer<typeof quickAddSchema>;

export function QuickAddForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<QuickAddFormData>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      amount: '',
      categoryId: '',
      description: '',
      paymentMode: 'Credit Card',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      isRecurring: false,
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: QuickAddFormData) => {
      const response = await apiRequest('POST', '/api/expenses', {
        ...data,
        userId: 1, // Mock user ID
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      form.reset();
      toast({
        title: 'Expense added',
        description: 'Your expense has been successfully recorded.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: QuickAddFormData) => {
    createExpenseMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                {...form.register('amount')}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select onValueChange={(value) => form.setValue('categoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMode">Payment</Label>
              <Select onValueChange={(value) => form.setValue('paymentMode', value)} defaultValue="Credit Card">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createExpenseMutation.isPending}
          >
            {createExpenseMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Add Expense</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
