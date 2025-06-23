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
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async initializeDefaultCategories() {
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) return; // Already initialized

    const defaultCategories = [
      { name: "Food & Drinks", icon: "🍕", color: "#F44336", isCustom: false, userId: null },
      { name: "Transportation", icon: "🚗", color: "#2196F3", isCustom: false, userId: null },
      { name: "Shopping", icon: "🛍️", color: "#4CAF50", isCustom: false, userId: null },
      { name: "Entertainment", icon: "🎬", color: "#9C27B0", isCustom: false, userId: null },
      { name: "Health & Medical", icon: "🏥", color: "#FF9800", isCustom: false, userId: null },
      { name: "Utilities", icon: "💡", color: "#607D8B", isCustom: false, userId: null },
      { name: "Travel", icon: "✈️", color: "#FF5722", isCustom: false, userId: null },
      { name: "Education", icon: "📚", color: "#3F51B5", isCustom: false, userId: null },
    ];

    await db.insert(categories).values(defaultCategories);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCategories(userId: number): Promise<Category[]> {
    await this.initializeDefaultCategories();
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  async getExpenses(userId: number, limit?: number): Promise<ExpenseWithCategory[]> {
    const query = db
      .select()
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date));

    const results = limit ? await query.limit(limit) : await query;
    
    return results.map(result => ({
      ...result.expenses,
      category: result.categories!
    }));
  }

  async getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]> {
    const results = await db
      .select()
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    return results.map(result => ({
      ...result.expenses,
      category: result.categories!
    }));
  }

  async getExpensesByCategory(userId: number, categoryId: number): Promise<ExpenseWithCategory[]> {
    const results = await db
      .select()
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(
        and(
          eq(expenses.userId, userId),
          eq(expenses.categoryId, categoryId)
        )
      );

    return results.map(result => ({
      ...result.expenses,
      category: result.categories!
    }));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values(expense)
      .returning();
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db
      .update(expenses)
      .set(expense)
      .where(eq(expenses.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount > 0;
  }

  async getBudgets(userId: number): Promise<BudgetWithCategory[]> {
    const results = await db
      .select()
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.userId, userId));

    return results.map(result => ({
      ...result.budgets,
      category: result.categories || undefined
    }));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db
      .insert(budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updated] = await db
      .update(budgets)
      .set(budget)
      .where(eq(budgets.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId));
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [newGoal] = await db
      .insert(savingsGoals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const [updated] = await db
      .update(savingsGoals)
      .set(goal)
      .where(eq(savingsGoals.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSavingsGoal(id: number): Promise<boolean> {
    const result = await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMonthlyExpenseTotal(userId: number, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const expenseResults = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    return expenseResults.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  }

  async getCategoryExpenseTotals(userId: number, startDate: Date, endDate: Date): Promise<{ categoryId: number; categoryName: string; total: number }[]> {
    const results = await db
      .select()
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    const categoryTotals = new Map<number, { name: string; total: number }>();
    results.forEach(result => {
      const expense = result.expenses;
      const category = result.categories;
      if (category) {
        const current = categoryTotals.get(expense.categoryId) || { name: category.name, total: 0 };
        categoryTotals.set(expense.categoryId, {
          name: category.name,
          total: current.total + parseFloat(expense.amount)
        });
      }
    });

    return Array.from(categoryTotals.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      total: data.total
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

export const storage = new DatabaseStorage();
