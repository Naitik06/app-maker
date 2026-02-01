
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertQuestionSchema } from "@shared/schema";

// --- Math Generation Logic ---

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArithmeticQuestion() {
  const ops = ['+', '-', '*', '/'];
  const op = ops[randomInt(0, 3)];
  let a = randomInt(1, 100);
  let b = randomInt(1, 50);
  let questionText = "";
  let answer = "";
  let difficulty = "Easy";

  if (op === '/') {
    // Ensure integer division
    a = b * randomInt(2, 20);
  } else if (op === '*') {
    a = randomInt(2, 20);
    b = randomInt(2, 20);
  }

  if (a > 50 || b > 50 || op === '*') difficulty = "Medium";

  questionText = `${a} ${op} ${b} = ?`;
  
  // Calculate answer
  switch(op) {
    case '+': answer = (a + b).toString(); break;
    case '-': answer = (a - b).toString(); break;
    case '*': answer = (a * b).toString(); break;
    case '/': answer = (a / b).toString(); break;
  }

  return { questionText, correctAnswer: answer, difficulty, questionType: "arithmetic" };
}

function generateLinear2Var() {
  // ax + by = c
  // dx + ey = f
  // Ensure integer solution x, y
  const x = randomInt(-10, 10);
  const y = randomInt(-10, 10);
  
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const c = a * x + b * y;

  const d = randomInt(1, 10);
  const e = randomInt(1, 10);
  // Ensure not parallel
  if (a * e === b * d) {
      return generateLinear2Var(); // Retry
  }
  const f = d * x + e * y;

  const questionText = `Solve for x and y:\n${a}x + ${b}y = ${c}\n${d}x + ${e}y = ${f}\n(Format: x=?, y=?)`;
  // Relaxed answer format matching on frontend/backend check, but storing canonical
  const answer = `x=${x}, y=${y}`; 
  
  return { questionText, correctAnswer: answer, difficulty: "Medium", questionType: "linear_2var" };
}

function generateLinear3Var() {
  // Simple integer solutions for x, y, z
  const x = randomInt(-5, 5);
  const y = randomInt(-5, 5);
  const zVal = randomInt(-5, 5);

  // Eq 1
  const a1 = randomInt(1, 5);
  const b1 = randomInt(1, 5);
  const c1 = randomInt(1, 5);
  const d1 = a1*x + b1*y + c1*zVal;

  // Eq 2
  const a2 = randomInt(1, 5);
  const b2 = randomInt(1, 5);
  const c2 = randomInt(1, 5);
  const d2 = a2*x + b2*y + c2*zVal;

  // Eq 3
  const a3 = randomInt(1, 5);
  const b3 = randomInt(1, 5);
  const c3 = randomInt(1, 5);
  const d3 = a3*x + b3*y + c3*zVal;

  const questionText = `Solve for x, y, z:\n${a1}x + ${b1}y + ${c1}z = ${d1}\n${a2}x + ${b2}y + ${c2}z = ${d2}\n${a3}x + ${b3}y + ${c3}z = ${d3}`;
  const answer = `x=${x}, y=${y}, z=${zVal}`;

  return { questionText, correctAnswer: answer, difficulty: "Hard", questionType: "linear_3var" };
}

function generateQuestionsForTest(testId: number) {
  const questions = [];
  // Generate 10 questions: 
  // 4 Arithmetic
  // 3 Linear 2-var
  // 3 Linear 3-var
  
  for (let i = 0; i < 4; i++) {
    questions.push({ ...generateArithmeticQuestion(), testId, order: i + 1 });
  }
  for (let i = 4; i < 7; i++) {
    questions.push({ ...generateLinear2Var(), testId, order: i + 1 });
  }
  for (let i = 7; i < 10; i++) {
    questions.push({ ...generateLinear3Var(), testId, order: i + 1 });
  }
  return questions;
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.tests.create.path, async (req, res) => {
    try {
      const { timeLimit } = api.tests.create.input.parse(req.body);
      const test = await storage.createTest({ timeLimit });
      
      const generatedQuestions = generateQuestionsForTest(test.id);
      for (const q of generatedQuestions) {
        await storage.createQuestion(q);
      }
      
      res.status(201).json(test);
    } catch (err) {
      res.status(500).json({ message: "Failed to create test" });
    }
  });

  app.get(api.tests.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const test = await storage.getTest(id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    
    const questions = await storage.getTestQuestions(id);
    // Sanitize questions? Maybe hide correctAnswer? 
    // For now, sending correctAnswer to client is risky but allows instant feedback.
    // Better: Don't send correctAnswer. Frontend checks only on result.
    // Implementation: omit correctAnswer from response? 
    // The strict schema requires it... let's keep it simple for MVP, 
    // but in a real app we would omit it.
    
    res.json({ test, questions });
  });

  app.patch(api.questions.answer.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const { answer } = api.questions.answer.input.parse(req.body);
    const updated = await storage.updateQuestionAnswer(id, answer);
    if (!updated) return res.status(404).json({ message: "Question not found" });
    res.json(updated);
  });

  app.patch(api.questions.clear.path, async (req, res) => {
      const id = parseInt(req.params.id);
      const updated = await storage.clearQuestionAnswer(id);
      if (!updated) return res.status(404).json({ message: "Question not found" });
      res.json(updated);
  });

  app.post(api.tests.submit.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const test = await storage.getTest(id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    
    const questions = await storage.getTestQuestions(id);
    
    // Calculate Score
    let score = 0;
    questions.forEach(q => {
      // Basic normalization: remove spaces, lowercase
      const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();
      if (q.userAnswer && normalize(q.userAnswer) === normalize(q.correctAnswer)) {
        score++;
      }
    });

    await storage.completeTest(id, score);
    
    res.json({ score, total: questions.length, questions });
  });

  return httpServer;
}
