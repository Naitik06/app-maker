
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We'll store the test session and its questions
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"), // When the test was submitted
  timeLimit: integer("time_limit").notNull().default(3600), // in seconds
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull().default(10),
  isCompleted: boolean("is_completed").default(false),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(), // Foreign key to tests
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // 'arithmetic', 'linear_2var', 'linear_3var'
  correctAnswer: text("correct_answer").notNull(), // Stored as string to handle "x=1, y=2" formats
  difficulty: text("difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  userAnswer: text("user_answer"),
  isAnswered: boolean("is_answered").default(false),
  isMarkedForReview: boolean("is_marked_for_review").default(false),
  order: integer("order").notNull(), // To maintain 1-10 sequence
});

export const insertTestSchema = createInsertSchema(tests).omit({ id: true, startTime: true, endTime: true, score: true, isCompleted: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });

export type Test = typeof tests.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

// API Types
export type CreateTestRequest = {
  timeLimit?: number; // Optional custom time limit
};

export type SubmitAnswerRequest = {
  answer: string;
};

export type TestResult = {
  testId: number;
  score: number;
  total: number;
  questions: Question[];
};
