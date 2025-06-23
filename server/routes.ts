import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertExpenseSchema, 
  insertCategorySchema, 
  insertBudgetSchema, 
  insertSavingsGoalSchema 
} from "@shared/schema";
import { z } from "zod";

// Mock user ID for development - in production this would come from authentication
const MOCK_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Categories routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories(MOCK_USER_ID);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  // Expenses routes
  app.get("/api/expenses", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const expenses = await storage.getExpenses(MOCK_USER_ID, limit);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/date-range", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const expenses = await storage.getExpensesByDateRange(
        MOCK_USER_ID,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses by date range" });
    }
  });

  app.post("/api/expenses", async (req: Request, res: Response) => {
    try {
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.put("/api/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, expenseData);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update expense" });
      }
    }
  });

  app.delete("/api/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Budgets routes
  app.get("/api/budgets", async (req: Request, res: Response) => {
    try {
      const budgets = await storage.getBudgets(MOCK_USER_ID);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req: Request, res: Response) => {
    try {
      const budgetData = insertBudgetSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const budget = await storage.createBudget(budgetData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create budget" });
      }
    }
  });

  // Savings goals routes
  app.get("/api/savings-goals", async (req: Request, res: Response) => {
    try {
      const goals = await storage.getSavingsGoals(MOCK_USER_ID);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings goals" });
    }
  });

  app.post("/api/savings-goals", async (req: Request, res: Response) => {
    try {
      const goalData = insertSavingsGoalSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const goal = await storage.createSavingsGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid savings goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create savings goal" });
      }
    }
  });

  // Analytics routes
  app.get("/api/analytics/monthly-total", async (req: Request, res: Response) => {
    try {
      const { year, month } = req.query;
      if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required" });
      }
      
      const total = await storage.getMonthlyExpenseTotal(
        MOCK_USER_ID,
        parseInt(year as string),
        parseInt(month as string)
      );
      res.json({ total });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly total" });
    }
  });

  app.get("/api/analytics/category-totals", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const totals = await storage.getCategoryExpenseTotals(
        MOCK_USER_ID,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(totals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category totals" });
    }
  });

  app.get("/api/analytics/monthly-trends", async (req: Request, res: Response) => {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const trends = await storage.getMonthlyTrends(MOCK_USER_ID, months);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly trends" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Get current month total
      const monthlyTotal = await storage.getMonthlyExpenseTotal(MOCK_USER_ID, currentYear, currentMonth);
      
      // Get budgets
      const budgets = await storage.getBudgets(MOCK_USER_ID);
      const overallBudget = budgets.find(b => b.isOverall);
      const budgetAmount = overallBudget ? parseFloat(overallBudget.amount) : 5000;
      const budgetRemaining = budgetAmount - monthlyTotal;
      
      // Get categories count
      const categories = await storage.getCategories(MOCK_USER_ID);
      const categoriesCount = categories.length;
      
      // Get savings goals
      const savingsGoals = await storage.getSavingsGoals(MOCK_USER_ID);
      const totalSavingsProgress = savingsGoals.reduce((total, goal) => 
        total + parseFloat(goal.currentAmount), 0
      );
      
      res.json({
        monthlyTotal,
        budgetRemaining,
        categoriesCount,
        savingsProgress: totalSavingsProgress,
        budgetAmount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
