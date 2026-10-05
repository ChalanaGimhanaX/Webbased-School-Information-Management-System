import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Icon from '../components/ui/Icon';

/**
 * Read-only "My Results" page for students (UC-04).
 * Uses the self-scoped /assistant/overview endpoint, which only returns the
 * logged-in student's PUBLISHED results — students can never create or edit exams.
 */
const gradeTone = (g) => {
  if (!g) return 'bg-surface-container-high text-on-surface-variant';
  if (g.startsWith('A')) return 'bg-tertiary-fixed text-on-tertiary-fixed';
  if (g === 'B') return 'bg-secondary-fixed text-on-secondary-fixed';
  if (g === 'C') return 'bg-primary-fixed text-on-primary-fixed';
  if (g === 'S') return 'bg-surface-container-high text-on-surface-variant';
  return 'bg-error-container text-on-error-container';
};

const pct = (r) => (Number(r.maxMarks) > 0 ? (Number(r.marksObtained) / Number(r.maxMarks)) * 100 : null);

export default function MyResults() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    api.get('/assistant/overview')
      .then((res) => alive && setOverview(res.data))
      .catch((err) => alive && setError(err?.response?.data?.detail || 'Could not load your results right now.'));
    return () => { alive = false; };
  }, []);

  // Group published results into one report card per exam
  const exams = useMemo(() => {
    const groups = new Map();
    (overview?.results || []).forEach((r) => {
      const key = `${r.academicYear}-${r.term}-${r.examName}`;
      if (!groups.has(key)) groups.set(key, { key, examName: r.examName, term: r.term, academicYear: r.academicYear, rows: [] });
      groups.get(key).rows.push(r);
    });
    return [...groups.values()].map((g) => {
      const scored = g.rows.filter((r) => pct(r) != null);
      const average = scored.length ? scored.reduce((s, r) => s + pct(r), 0) / scored.length : null;
      const total = g.rows.reduce((s, r) => s + Number(r.marksObtained || 0), 0);
      return { ...g, average, total };
    });
  }, [overview]);

  const loading = !overview && !error;

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">My Results</h1>
          <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-xs font-semibold text-on-primary-fixed">Read only</span>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          Published report cards{overview?.fullName ? ` for ${overview.fullName}` : ''}{overview?.className ? ` · ${overview.className}` : ''}
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/60 p-4 text-on-error-container">
          <Icon name="error" size={20} /> {error}
        </div>
      )}

      {loading && [0, 1].map((i) => <div key={i} className="skeleton h-48 rounded-xl" />)}

      {!loading && !error && exams.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-14 text-center text-on-surface-variant">
          <Icon name="hourglass_empty" size={32} className="text-outline" />
          <p className="font-medium text-on-surface">No results have been published yet</p>
          <p className="text-sm">Your report cards will appear here once your teachers release them.</p>
        </div>
      )}

      {exams.map((exam, i) => (
        <section
          key={exam.key}
          style={{ '--d': `${i * 80}ms` }}
          className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-xs animate-fade-up stagger"
        >
          <header className="flex flex-col gap-3 border-b border-outline-variant/40 bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-on-surface">{exam.examName}</h2>
              <p className="text-sm text-on-surface-variant">Term {exam.term} · {exam.academicYear}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-on-surface-variant">Average</p>
                <p className="text-xl font-bold text-primary">{exam.average != null ? `${exam.average.toFixed(1)}%` : '—'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${exam.average != null && exam.average >= 35 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
                {exam.average != null && exam.average >= 35 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-3 font-semibold">Subject</th>
                  <th className="px-6 py-3 text-right font-semibold">Marks</th>
                  <th className="hidden px-6 py-3 font-semibold sm:table-cell">Score</th>
                  <th className="px-6 py-3 text-center font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {exam.rows.map((r) => {
                  const p = pct(r);
                  return (
                    <tr key={r.subjectName} className="transition-colors hover:bg-surface-container-low/60">
                      <td className="px-6 py-3 font-medium text-on-surface">{r.subjectName}</td>
                      <td className="px-6 py-3 text-right text-on-surface">{Number(r.marksObtained)}<span className="text-on-surface-variant">/{Number(r.maxMarks)}</span></td>
                      <td className="hidden px-6 py-3 sm:table-cell">
                        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-surface-container-high">
                          <div className={`h-full rounded-full ${p >= 75 ? 'bg-tertiary' : p >= 50 ? 'bg-primary-container' : 'bg-error'}`} style={{ width: `${Math.min(100, p || 0)}%` }} />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex min-w-8 justify-center rounded-full px-2 py-0.5 text-xs font-bold ${gradeTone(r.grade)}`}>{r.grade || '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-outline-variant/40 bg-surface-container-low/50 text-on-surface">
                  <td className="px-6 py-3 font-semibold">Total</td>
                  <td className="px-6 py-3 text-right font-bold">{exam.total}</td>
                  <td className="hidden sm:table-cell" />
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

