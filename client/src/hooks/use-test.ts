import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateTestRequest } from "@shared/routes";
import { type Test, type Question } from "@shared/schema";

// Types derived from schema/routes
export type TestResponse = {
  test: Test;
  questions: Question[];
};

export type SubmitResponse = {
  score: number;
  total: number;
  questions: Question[];
};

// Create a new test session
export function useCreateTest() {
  return useMutation({
    mutationFn: async (data: CreateTestRequest) => {
      const res = await fetch(api.tests.create.path, {
        method: api.tests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create test");
      return api.tests.create.responses[201].parse(await res.json());
    },
  });
}

// Get test details and questions
export function useTest(id: number) {
  return useQuery({
    queryKey: [api.tests.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tests.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch test");
      return api.tests.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Save an answer for a specific question
export function useAnswerQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, answer }: { id: number; answer: string }) => {
      const url = buildUrl(api.questions.answer.path, { id });
      const validated = api.questions.answer.input.parse({ answer });
      const res = await fetch(url, {
        method: api.questions.answer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save answer");
      return api.questions.answer.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      // Optimistically update the question in the test cache
      // This is complex because we need to find the question inside the test object
      // For now, simpler invalidation is safer
      queryClient.invalidateQueries({ queryKey: [api.tests.get.path] });
    },
  });
}

// Clear an answer
export function useClearAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.questions.clear.path, { id });
      const res = await fetch(url, {
        method: api.questions.clear.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear answer");
      return api.questions.clear.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tests.get.path] });
    },
  });
}

// Submit the entire test
export function useSubmitTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tests.submit.path, { id });
      const res = await fetch(url, {
        method: api.tests.submit.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit test");
      return api.tests.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tests.get.path] });
    },
  });
}
