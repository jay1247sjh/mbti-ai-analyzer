export type Trait = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type QuestionOption = {
  text: string;
  trait: Trait;
  weight: number;
};

export type Question = {
  id: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  prompt: string;
  options: QuestionOption[];
};

export type TypeProfile = {
  type: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  behaviors: string[];
  careers: string[];
};

export type ScoreMap = Record<Trait, number>;

const baseScores = (): ScoreMap => ({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });

export function calculateScores(selectedOptions: QuestionOption[]): ScoreMap {
  return selectedOptions.reduce((acc, option) => {
    acc[option.trait] += option.weight;
    return acc;
  }, baseScores());
}

export function determineMbtiType(scores: ScoreMap): string {
  return [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('');
}

export function dimensionPercentages(scores: ScoreMap) {
  const pair = (a: Trait, b: Trait) => {
    const total = scores[a] + scores[b] || 1;
    return {
      [a]: Math.round((scores[a] / total) * 100),
      [b]: Math.round((scores[b] / total) * 100),
    };
  };

  return {
    ...pair('E', 'I'),
    ...pair('S', 'N'),
    ...pair('T', 'F'),
    ...pair('J', 'P'),
  };
}
