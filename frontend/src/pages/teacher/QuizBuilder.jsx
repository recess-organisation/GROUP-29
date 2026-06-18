import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createQuiz, getQuizForEdit, saveQuestions, updateQuiz } from '../../services/quizService';

const EMPTY_QUESTION = () => ({ question_type: 'mcq', question_text: '', points: 1, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });

export default function QuizBuilder() {
  const { quizId, lessonId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!quizId;

  const [quiz, setQuiz] = useState({ title: '', instructions: '', passing_score: 50, max_attempts: 1, time_limit: '' });
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      getQuizForEdit(quizId).then((response) => {
        const data = response.data;
        setQuiz({ title: data.title, instructions: data.instructions || '', passing_score: data.passing_score, max_attempts: data.max_attempts, time_limit: data.time_limit || '' });
        setQuestions(data.questions.map((q) => ({
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          points: q.points,
          options: q.options.map((o) => ({ id: o.id, option_text: o.option_text, is_correct: !!o.is_correct }))
        })));
        setLoading(false);
      });
    }
  }, [quizId, isEditing]);

  function addQuestion() {
    setQuestions([...questions, EMPTY_QUESTION()]);
  }

  function removeQuestion(index) {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index, field, value) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  function addOption(qIndex) {
    const updated = [...questions];
    updated[qIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(updated);
  }

  function updateOption(qIndex, oIndex, field, value) {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = { ...updated[qIndex].options[oIndex], [field]: value };
    setQuestions(updated);
  }

  function removeOption(qIndex, oIndex) {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) return;
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await updateQuiz(quizId, quiz);
        await saveQuestions(quizId, questions);
      } else {
        const response = await createQuiz({ ...quiz, lesson_id: Number(lessonId) });
        await saveQuestions(response.data.quizId, questions);
      }
      navigate('/teacher/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save quiz.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="content-panel">
      <h1 className="h3">{isEditing ? 'Edit quiz' : 'Create quiz'}</h1>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Title</label>
            <input className="form-control" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} required />
          </div>
          <div className="col-md-2">
            <label className="form-label">Passing score (%)</label>
            <input className="form-control" type="number" min="0" max="100" value={quiz.passing_score} onChange={(e) => setQuiz({ ...quiz, passing_score: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Max attempts</label>
            <input className="form-control" type="number" min="1" value={quiz.max_attempts} onChange={(e) => setQuiz({ ...quiz, max_attempts: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Time limit (min)</label>
            <input className="form-control" type="number" min="0" value={quiz.time_limit} onChange={(e) => setQuiz({ ...quiz, time_limit: e.target.value })} placeholder="Unlimited" />
          </div>
          <div className="col-12">
            <label className="form-label">Instructions</label>
            <textarea className="form-control" rows="3" value={quiz.instructions} onChange={(e) => setQuiz({ ...quiz, instructions: e.target.value })} />
          </div>
        </div>

        <h2 className="h5 mb-3">Questions</h2>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border rounded-3 p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Question {qIndex + 1}</strong>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeQuestion(qIndex)}>Remove</button>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-md-8">
                <input className="form-control" placeholder="Question text" value={question.question_text} onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)} required />
              </div>
              <div className="col-md-2">
                <select className="form-select" value={question.question_type} onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}>
                  <option value="mcq">Multiple choice</option>
                  <option value="true_false">True / False</option>
                </select>
              </div>
              <div className="col-md-2">
                <input className="form-control" type="number" min="1" placeholder="Points" value={question.points} onChange={(e) => updateQuestion(qIndex, 'points', e.target.value)} />
              </div>
            </div>

            {question.question_type === 'mcq' ? (
              <div>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="row g-2 mb-1 align-items-center">
                    <div className="col-md-8">
                      <input className="form-control form-control-sm" placeholder={`Option ${oIndex + 1}`} value={option.option_text} onChange={(e) => updateOption(qIndex, oIndex, 'option_text', e.target.value)} required />
                    </div>
                    <div className="col-md-2">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name={`correct-${qIndex}`} id={`correct-${qIndex}-${oIndex}`} checked={option.is_correct} onChange={() => {
                          const updated = [...questions];
                          updated[qIndex].options.forEach((o, i) => o.is_correct = i === oIndex);
                          setQuestions(updated);
                        }} />
                        <label className="form-check-label small" htmlFor={`correct-${qIndex}-${oIndex}`}>Correct</label>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeOption(qIndex, oIndex)}>X</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm mt-1" onClick={() => addOption(qIndex)}>+ Add option</button>
              </div>
            ) : (
              <div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name={`tf-${qIndex}`} id={`tf-${qIndex}-true`} checked={question.options?.[0]?.is_correct} onChange={() => {
                    const updated = [...questions];
                    updated[qIndex].options = [{ option_text: 'True', is_correct: true }, { option_text: 'False', is_correct: false }];
                    setQuestions(updated);
                  }} />
                  <label className="form-check-label" htmlFor={`tf-${qIndex}-true`}>True</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name={`tf-${qIndex}`} id={`tf-${qIndex}-false`} checked={question.options?.[1]?.is_correct} onChange={() => {
                    const updated = [...questions];
                    updated[qIndex].options = [{ option_text: 'True', is_correct: false }, { option_text: 'False', is_correct: true }];
                    setQuestions(updated);
                  }} />
                  <label className="form-check-label" htmlFor={`tf-${qIndex}-false`}>False</label>
                </div>
              </div>
            )}
          </div>
        ))}

        <button type="button" className="btn btn-outline-primary mb-3" onClick={addQuestion}>+ Add question</button>
        <br />
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Update quiz' : 'Create quiz'}</button>
      </form>
    </div>
  );
}
