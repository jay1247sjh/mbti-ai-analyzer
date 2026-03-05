import express from 'express';
import cors from 'cors';
import questions from '../src/data/questions.json' assert { type: 'json' };
import types from '../src/data/types.json' assert { type: 'json' };
import { calculateScores, determineMbtiType, dimensionPercentages, QuestionOption } from '../src/shared/mbti.js';

type AnswerInput = { questionId: string; optionIndex: number };

const isValidOption = (option: unknown): option is QuestionOption => {
  if (!option || typeof option !== 'object') return false;
  const item = option as Record<string, unknown>;
  return (
    typeof item.text === 'string' &&
    ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'].includes(String(item.trait)) &&
    typeof item.weight === 'number'
  );
};

const resolveSelectedOptions = (selectedOptions?: unknown, answers?: unknown): QuestionOption[] => {
  if (Array.isArray(selectedOptions) && selectedOptions.length > 0 && selectedOptions.every(isValidOption)) {
    return selectedOptions;
  }

  if (!Array.isArray(answers) || answers.length === 0) return [];

  const resolved = (answers as AnswerInput[])
    .map(({ questionId, optionIndex }) => {
      const question = questions.find((q) => q.id === questionId);
      if (!question || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length) {
        return null;
      }
      return question.options[optionIndex] as QuestionOption;
    })
    .filter((item): item is QuestionOption => item !== null);

  return resolved.length === answers.length ? resolved : [];
};

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/questions', (_req, res) => {
  res.json(questions);
});

app.get('/api/types', (_req, res) => {
  res.json(types);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', (req, res) => {
  const { selectedOptions, answers } = req.body as {
    selectedOptions?: unknown;
    answers?: unknown;
  };

  const resolvedOptions = resolveSelectedOptions(selectedOptions, answers);

  if (resolvedOptions.length === 0) {
    return res.status(400).json({ message: 'selectedOptions or answers is required' });
  }

  const scores = calculateScores(resolvedOptions);
  const type = determineMbtiType(scores);
  const percentages = dimensionPercentages(scores);
  const profile = types.find((item) => item.type === type) ?? null;

  return res.json({ type, scores, percentages, profile });
});
