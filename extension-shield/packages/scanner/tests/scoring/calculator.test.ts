import { describe, it, expect } from 'vitest';
import {
  calculateOverallScore,
  scoreToRiskLevel,
  calculateSummary,
} from '../../src/scoring/calculator';
import type { RiskFinding } from '../../src/types';

function makeFinding(severity: RiskFinding['severity'], id = 'TEST'): RiskFinding {
  return {
    id,
    category: 'permission',
    severity,
    title: 'Test finding',
    description: 'Test description',
    suggestion: 'Test suggestion',
  };
}

describe('calculateOverallScore', () => {
  it('returns 0 for no findings', () => {
    expect(calculateOverallScore([])).toBe(0);
  });

  it('adds 25 per critical finding', () => {
    expect(calculateOverallScore([makeFinding('critical')])).toBe(25);
  });

  it('adds 12 per high finding', () => {
    expect(calculateOverallScore([makeFinding('high')])).toBe(12);
  });

  it('adds 5 per medium finding', () => {
    expect(calculateOverallScore([makeFinding('medium')])).toBe(5);
  });

  it('adds 2 per low finding', () => {
    expect(calculateOverallScore([makeFinding('low')])).toBe(2);
  });

  it('clamps at 100', () => {
    const findings = Array(10).fill(makeFinding('critical'));
    expect(calculateOverallScore(findings)).toBe(100);
  });

  it('combines mixed severities', () => {
    const findings = [
      makeFinding('critical'),
      makeFinding('high'),
      makeFinding('medium'),
      makeFinding('low'),
    ];
    expect(calculateOverallScore(findings)).toBe(44);
  });
});

describe('scoreToRiskLevel', () => {
  it('returns low for 0-20', () => {
    expect(scoreToRiskLevel(0)).toBe('low');
    expect(scoreToRiskLevel(20)).toBe('low');
  });

  it('returns medium for 21-50', () => {
    expect(scoreToRiskLevel(21)).toBe('medium');
    expect(scoreToRiskLevel(50)).toBe('medium');
  });

  it('returns high for 51-80', () => {
    expect(scoreToRiskLevel(51)).toBe('high');
    expect(scoreToRiskLevel(80)).toBe('high');
  });

  it('returns critical for 81-100', () => {
    expect(scoreToRiskLevel(81)).toBe('critical');
    expect(scoreToRiskLevel(100)).toBe('critical');
  });
});

describe('calculateSummary', () => {
  it('returns all zeros for empty findings', () => {
    const summary = calculateSummary([]);
    expect(summary).toEqual({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  });

  it('counts by severity', () => {
    const findings = [
      makeFinding('critical'),
      makeFinding('critical'),
      makeFinding('high'),
      makeFinding('medium'),
      makeFinding('medium'),
      makeFinding('medium'),
      makeFinding('low'),
    ];
    const summary = calculateSummary(findings);
    expect(summary.total).toBe(7);
    expect(summary.critical).toBe(2);
    expect(summary.high).toBe(1);
    expect(summary.medium).toBe(3);
    expect(summary.low).toBe(1);
  });
});
