import { supabase } from './supabase';

export interface Rank {
  name: string;
  minPoints: number;
  color: string;
  icon: 'star-outline' | 'star-half' | 'star' | 'diamond' | 'diamond-sharp';
}

export const ranks: Rank[] = [
  {
    name: 'Rookie',
    minPoints: 0,
    color: '#CD7F32',
    icon: 'star-outline'
  },
  {
    name: 'Trendsetter',
    minPoints: 1000,
    color: '#C0C0C0',
    icon: 'star-half'
  },
  {
    name: 'Icon',
    minPoints: 5000,
    color: '#FFD700',
    icon: 'star'
  },
  {
    name: 'Legend',
    minPoints: 10000,
    color: '#E5E4E2',
    icon: 'diamond'
  },
  {
    name: 'GOAT',
    minPoints: 25000,
    color: '#B9F2FF',
    icon: 'diamond-sharp'
  }
];

export function getUserRank(points: number): Rank {
  return ranks.reduce((highest, rank) => {
    if (points >= rank.minPoints && rank.minPoints >= highest.minPoints) {
      return rank;
    }
    return highest;
  }, ranks[0]);
}

export function getNextRank(points: number): Rank | null {
  const currentRank = getUserRank(points);
  const nextRank = ranks.find(rank => rank.minPoints > currentRank.minPoints);
  return nextRank || null;
}

export function getPointsToNextRank(points: number): number {
  const nextRank = getNextRank(points);
  if (!nextRank) return 0;
  return nextRank.minPoints - points;
} 