import api from './api';

export function getQuizzesByLesson(lessonId) {
  return api.get(`/quizzes/lesson/${lessonId}`);
}

export function getQuizForEdit(id) {
  return api.get(`/quizzes/edit/${id}`);
}

export function createQuiz(data) {
  return api.post('/quizzes', data);
}

export function updateQuiz(id, data) {
  return api.put(`/quizzes/${id}`, data);
}

export function deleteQuiz(id) {
  return api.delete(`/quizzes/${id}`);
}

export function saveQuestions(quizId, questions) {
  return api.put(`/quizzes/${quizId}/questions`, { questions });
}

export function getQuizForTaking(id) {
  return api.get(`/quizzes/take/${id}`);
}

export function startAttempt(quizId) {
  return api.post(`/quizzes/${quizId}/start`);
}

export function submitAttempt(attemptId, answers) {
  return api.post(`/quizzes/attempt/${attemptId}/submit`, { answers });
}

export function getAttemptResult(attemptId) {
  return api.get(`/quizzes/attempt/${attemptId}/result`);
}

export function getMyQuizAttempts(quizId) {
  return api.get(`/quizzes/my-attempts/${quizId}`);
}
