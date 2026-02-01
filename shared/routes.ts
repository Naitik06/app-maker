
import { z } from 'zod';
import { insertTestSchema, insertQuestionSchema, questions, tests } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tests: {
    create: {
      method: 'POST' as const,
      path: '/api/tests',
      input: z.object({
        timeLimit: z.number().optional().default(3600)
      }),
      responses: {
        201: z.custom<typeof tests.$inferSelect>(),
        500: errorSchemas.internal
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/tests/:id',
      responses: {
        200: z.object({
          test: z.custom<typeof tests.$inferSelect>(),
          questions: z.array(z.custom<typeof questions.$inferSelect>())
        }),
        404: errorSchemas.notFound
      }
    },
    submit: {
      method: 'POST' as const,
      path: '/api/tests/:id/submit',
      responses: {
        200: z.object({
          score: z.number(),
          total: z.number(),
          questions: z.array(z.custom<typeof questions.$inferSelect>())
        }),
        404: errorSchemas.notFound
      }
    }
  },
  questions: {
    answer: {
      method: 'PATCH' as const,
      path: '/api/questions/:id/answer',
      input: z.object({
        answer: z.string()
      }),
      responses: {
        200: z.custom<typeof questions.$inferSelect>(),
        404: errorSchemas.notFound
      }
    },
    clear: {
        method: 'PATCH' as const,
        path: '/api/questions/:id/clear',
        responses: {
          200: z.custom<typeof questions.$inferSelect>(),
          404: errorSchemas.notFound
        }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
