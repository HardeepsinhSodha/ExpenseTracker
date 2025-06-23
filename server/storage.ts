import { 
  users, 
  categories, 
  expenses, 
  budgets, 
  savingsGoals,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Expense,
  type InsertExpense,
  type Budget,
  type InsertBudget,
  type SavingsGoal,
  type InsertSavingsGoal,
  type ExpenseWithCategory,
  type BudgetWithCategory
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(userId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Expense methods
  getExpenses(userId: number, limit?: number): Promise<ExpenseWithCategory[]>;
  getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]>;
  getExpensesByCategory(userId: number, categoryId: number): Promise<ExpenseWithCategory[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Budget methods
  getBudgets(userId: number): Promise<BudgetWithCategory[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;

  // Savings goal methods
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: number): Promise<boolean>;

  // Analytics methods
  getMonthlyExpenseTotal(userId: number, year: number, month: number): Promise<number>;
  getCategoryExpenseTotals(userId: number, startDate: Date, endDate: Date): Promise<{ categoryId: number; categoryName: string; total: number }[]>;
  getMonthlyTrends(userId: number, months: number): Promise<{ month: string; total: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private expenses: Map<number, Expense>;
  private budgets: Map<number, Budget>;
  private savingsGoals: Map<number, SavingsGoal>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentExpenseId: number;
  private currentBudgetId: number;
  private currentSavingsGoalId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.expenses = new Map();
    this.budgets = new Map();
    this.savingsGoals = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentExpenseId = 1;
    this.currentBudgetId = 1;
    this.currentSavingsGoalId = 1;

    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories = [
      { name: "Food & Drinks", icon: "🍕", color: "#F44336" },
      { name: "Transportation", icon: "🚗", color: "#2196F3" },
      { name: "Shopping", icon: "🛍️", color: "#4CAF50" },
      { name: "Entertainment", icon: "🎬", color: "#9C27B0" },
      { name: "Health & Medical", icon: "🏥", color: "#FF9800" },
      { name: "Utilities", icon: "💡", color: "#607D8B" },
      { name: "Travel", icon: "✈️", color: "#FF5722" },
      { name: "Education", icon: "📚", color: "#3F51B5" },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isCustom: false,
        userId: null,
      };
      this.categories.set(category.id, category);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      cat => cat.userId === null || cat.userId === userId
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  async getExpenses(userId: number, limit?: number): Promise<ExpenseWithCategory[]> {
    const userExpenses = Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const limitedExpenses = limit ? userExpenses.slice(0, limit) : userExpenses;

    return limitedExpenses.map(expense => ({
      ...expense,
      category: this.categories.get(expense.categoryId)!
    }));
  }

  async getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]> {
    const userExpenses = Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.userId === userId && 
               expenseDate >= startDate && 
               expenseDate <= endDate;
      });

    return userExpenses.map(expense => ({
      ...expense,
      category: this.categories.get(expense.categoryId)!
    }));
  }

  async getExpensesByCategory(userId: number, categoryId: number): Promise<ExpenseWithCategory[]> {
    const userExpenses = Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId && expense.categoryId === categoryId);

    return userExpenses.map(expense => ({
      ...expense,
      category: this.categories.get(expense.categoryId)!
    }));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const newExpense: Expense = { 
      ...expense, 
      id,
      createdAt: new Date()
    };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existing = this.expenses.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...expense };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getBudgets(userId: number): Promise<BudgetWithCategory[]> {
    const userBudgets = Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId);

    return userBudgets.map(budget => ({
      ...budget,
      category: budget.categoryId ? this.categories.get(budget.categoryId) : undefined
    }));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const newBudget: Budget = { ...budget, id };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existing = this.budgets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...budget };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values())
      .filter(goal => goal.userId === userId);
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.currentSavingsGoalId++;
    const newGoal: SavingsGoal = { 
      ...goal, 
      id,
      createdAt: new Date()
    };
    this.savingsGoals.set(id, newGoal);
    return newGoal;
  }

  async updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const existing = this.savingsGoals.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...goal };
    this.savingsGoals.set(id, updated);
    return updated;
  }

  async deleteSavingsGoal(id: number): Promise<boolean> {
    return this.savingsGoals.delete(id);
  }

  async getMonthlyExpenseTotal(userId: number, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const expenses = Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.userId === userId && 
               expenseDate >= startDate && 
               expenseDate <= endDate;
      });

    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  }

  async getCategoryExpenseTotals(userId: number, startDate: Date, endDate: Date): Promise<{ categoryId: number; categoryName: string; total: number }[]> {
    const expenses = Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.userId === userId && 
               expenseDate >= startDate && 
               expenseDate <= endDate;
      });

    const categoryTotals = new Map<number, number>();
    expenses.forEach(expense => {
      const current = categoryTotals.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, current + parseFloat(expense.amount));
    });

    return Array.from(categoryTotals.entries()).map(([categoryId, total]) => ({
      categoryId,
      categoryName: this.categories.get(categoryId)?.name || 'Unknown',
      total
    }));
  }

  async getMonthlyTrends(userId: number, months: number): Promise<{ month: string; total: number }[]> {
    const trends = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const total = await this.getMonthlyExpenseTotal(userId, date.getFullYear(), date.getMonth() + 1);
      
      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        total
      });
    }
    
    return trends;
  }
}

export const storage = new MemStorage();
