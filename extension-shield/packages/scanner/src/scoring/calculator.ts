import type { RiskFinding, RiskLevel } from '../types';

export function calculateOverallScore(findings: RiskFinding[]): number {
  let score = 0;

  for (const finding of findings) {
    switch (finding.severity) {
      case 'critical':
        score += 25;
        break;
      case 'high':
        score += 12;
        break;
      case 'medium':
        score += 5;
        break;
      case 'low':
        score += 2;
        break;
    }
  }

  return Math.min(score, 100);
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 80) return 'high';
  return 'critical';
}

export function calculateSummary(findings: RiskFinding[]): {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
} {
  const summary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };

  for (const finding of findings) {
    summary.total++;
    summary[finding.severity]++;
  }

  return summary;
}
