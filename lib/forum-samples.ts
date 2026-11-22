// Fictional sample students from the seeded leaderboard. These flags are demo
// metadata only; they never assert an achievement for an authenticated user.
export const SAMPLE_OLYMPIAD_STUDENTS = [
  { id: "00000006-0000-4000-8000-000000000001", full_name: "Madina Sobirova", is_olympiad: true, answer_id: "00000005-0000-4000-8000-000000000001", question_id: "00000004-0000-4000-8000-000000000001" },
  { id: "00000006-0000-4000-8000-000000000002", full_name: "Abdulaziz Hamidov", is_olympiad: true, answer_id: "00000005-0000-4000-8000-000000000005", question_id: "00000004-0000-4000-8000-000000000005" },
  { id: "00000006-0000-4000-8000-000000000003", full_name: "Zilola Umarova", is_olympiad: true, answer_id: "00000005-0000-4000-8000-000000000009", question_id: "00000004-0000-4000-8000-000000000009" },
] as const;
export function sampleOlympiadAnswer(answer: { id: string; is_sample: boolean; author_id: string | null }) {
  return answer.is_sample && !answer.author_id ? SAMPLE_OLYMPIAD_STUDENTS.find((student) => student.answer_id === answer.id) : undefined;
}
export function hasSampleOlympiadAnswer(question: { id: string; is_sample: boolean; answerCount: number }) {
  return question.is_sample && question.answerCount > 0 && SAMPLE_OLYMPIAD_STUDENTS.some((student) => student.question_id === question.id);
}
