import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { calculateScores, determineMbtiType, dimensionPercentages } from '../src/shared/mbti';
import { app } from '../server/app';

describe('mbti scoring', () => {
  it('calculates mbti type from options', () => {
    const scores = calculateScores([
      { text: 'a', trait: 'I', weight: 2 },
      { text: 'b', trait: 'N', weight: 2 },
      { text: 'c', trait: 'F', weight: 2 },
      { text: 'd', trait: 'P', weight: 2 },
    ]);

    expect(determineMbtiType(scores)).toBe('INFP');
    expect(dimensionPercentages(scores).I).toBe(100);
  });
});

describe('api', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns analyzed result from selectedOptions', async () => {
    const response = await request(app).post('/api/analyze').send({
      selectedOptions: [
        { text: 'a', trait: 'E', weight: 2 },
        { text: 'b', trait: 'N', weight: 2 },
        { text: 'c', trait: 'T', weight: 2 },
        { text: 'd', trait: 'J', weight: 2 },
      ],
    });

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('ENTJ');
    expect(response.body.profile.type).toBe('ENTJ');
  });

  it('supports answer-index payload', async () => {
    const response = await request(app).post('/api/analyze').send({
      answers: [
        { questionId: 'q1', optionIndex: 0 },
        { questionId: 'q2', optionIndex: 0 },
        { questionId: 'q3', optionIndex: 1 },
        { questionId: 'q4', optionIndex: 1 },
        { questionId: 'q5', optionIndex: 0 },
        { questionId: 'q6', optionIndex: 0 },
        { questionId: 'q7', optionIndex: 0 },
        { questionId: 'q8', optionIndex: 0 }
      ],
    });

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('ENTJ');
  });

  it('validates empty payload', async () => {
    const response = await request(app).post('/api/analyze').send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('required');
  });
});
