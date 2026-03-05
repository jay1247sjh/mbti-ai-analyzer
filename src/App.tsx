import { useEffect, useMemo, useState } from 'react';
import type { Question, QuestionOption, TypeProfile } from './shared/mbti';
import { TraitChart } from './components/TraitChart';

type AnalyzeResponse = {
  type: string;
  scores: Record<string, number>;
  percentages: Record<string, number>;
  profile: TypeProfile | null;
};

const API_BASE = '/api';

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [typeLibrary, setTypeLibrary] = useState<TypeProfile[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionOption[]>([]);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/questions`).then((r) => r.json()).then(setQuestions);
    fetch(`${API_BASE}/types`).then((r) => r.json()).then(setTypeLibrary);
  }, []);

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((answers.length / questions.length) * 100);
  }, [answers.length, questions.length]);

  const current = questions[index];

  const handleOption = async (option: QuestionOption) => {
    const next = [...answers, option];
    setAnswers(next);

    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }

    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: questions.map((question, idx) => ({
          questionId: question.id,
          optionIndex: question.options.findIndex((item) => item.text === next[idx].text),
        })),
        selectedOptions: next,
      }),
    });
    const data = (await res.json()) as AnalyzeResponse;
    setResult(data);
  };

  const reset = () => {
    setIndex(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-3xl font-bold text-slate-800">MBTI AI Analyzer</h1>
      {!result && current && (
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-3 h-2 w-full overflow-hidden rounded bg-slate-200">
            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mb-4 text-sm text-slate-600">Progress: {progress}%</p>
          <h2 className="mb-4 text-xl font-semibold">{current.prompt}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {current.options.map((option) => (
              <button
                key={option.text}
                className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400"
                onClick={() => handleOption(option)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </section>
      )}


      {!result && !current && (
        <section className="rounded-xl bg-white p-6 text-slate-600 shadow">Loading questions...</section>
      )}

      {result && (
        <section className="space-y-6 rounded-xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-indigo-700">Your MBTI Type: {result.type}</h2>
            <button className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={reset}>Retake</button>
          </div>

          {result.profile && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">{result.profile.title}</h3>
                <p className="text-slate-700">{result.profile.description}</p>
                <p className="mt-3 text-sm"><b>Strengths:</b> {result.profile.strengths.join(', ')}</p>
                <p className="text-sm"><b>Weaknesses:</b> {result.profile.weaknesses.join(', ')}</p>
                <p className="text-sm"><b>Behaviors:</b> {result.profile.behaviors.join(', ')}</p>
                <p className="text-sm"><b>Careers:</b> {result.profile.careers.join(', ')}</p>
              </div>
              <TraitChart percentages={result.percentages} />
            </div>
          )}

          <div>
            <h3 className="mb-2 text-lg font-semibold">Explore all 16 MBTI types</h3>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {typeLibrary.map((type) => (
                <div key={type.type} className="rounded border p-2">
                  <p className="font-semibold">{type.type}</p>
                  <p className="text-xs text-slate-600">{type.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
