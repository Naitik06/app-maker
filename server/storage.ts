
import { db } from "./db";
import {
  tests,
  questions,
  type Test,
  type Question,
  type InsertTest,
  type InsertQuestion
} from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  createTest(test: InsertTest): Promise<Test>;
  getTest(id: number): Promise<Test | undefined>;
  getTestQuestions(testId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestionAnswer(id: number, answer: string): Promise<Question | undefined>;
  clearQuestionAnswer(id: number): Promise<Question | undefined>;
  completeTest(id: number, score: number): Promise<Test | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createTest(test: InsertTest): Promise<Test> {
    const [newTest] = await db.insert(tests).values(test).returning();
    return newTest;
  }

  async getTest(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async getTestQuestions(testId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.testId, testId))
      .orderBy(asc(questions.order));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async updateQuestionAnswer(id: number, answer: string): Promise<Question | undefined> {
    const [updated] = await db
      .update(questions)
      .set({ userAnswer: answer, isAnswered: true })
      .where(eq(questions.id, id))
      .returning();
    return updated;
  }

  async clearQuestionAnswer(id: number): Promise<Question | undefined> {
      const [updated] = await db
        .update(questions)
        .set({ userAnswer: null, isAnswered: false })
        .where(eq(questions.id, id))
        .returning();
      return updated;
    }

  async completeTest(id: number, score: number): Promise<Test | undefined> {
    const [updated] = await db
      .update(tests)
      .set({ isCompleted: true, score, endTime: new Date() })
      .where(eq(tests.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
