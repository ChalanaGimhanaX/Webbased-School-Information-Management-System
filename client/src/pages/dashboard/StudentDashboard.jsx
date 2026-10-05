import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import Icon from '../../components/ui/Icon';
import {
  BannerButton, Card, CountUp, KpiCard, PeriodList, ProgressBar, ProgressRing, WelcomeBanner,
} from '../../components/dashboard/DashboardWidgets';
import { usePeriodClock } from '../../lib/usePeriodClock';
import { formatLongDate, formatTime, getTermInfo, greeting, toMinutes, todayKey } from '../../lib/schoolCalendar';

const gradeTone = (g) => {
  if (!g) return 'bg-surface-container-high text-on-surface-variant';
  if (g.startsWith('A')) return 'bg-tertiary-fixed text-on-tertiary-fixed';
  if (g === 'B') return 'bg-secondary-fixed text-on-secondary-fixed';
  if (g === 'C') return 'bg-primary-fixed text-on-primary-fixed';
  if (g === 'S') return 'bg-surface-container-high text-on-surface-variant';
  return 'bg-error-container text-on-error-container';
};

const subjectIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('math')) return 'calculate';
  if (n.includes('chem') || n.includes('science') || n.includes('bio') || n.includes('phys')) return 'science';
  if (n.includes('ict') || n.includes('comput')) return 'computer';
  if (n.includes('english') || n.includes('lit') || n.includes('sinhala') || n.includes('tamil')) return 'menu_book';
  if (n.includes('history') || n.includes('geo')) return 'public';
  if (n.includes('art') || n.includes('music')) return 'palette';
  if (n.includes('commerce') || n.includes('account') || n.includes('business')) return 'account_balance';
  return 'school';
};

const percentOf = (r) => (Number(r.maxMarks) > 0 ? (Number(r.marksObtained) / Number(r.maxMarks)) * 100 : null);

/** Personal learning dashboard for students, powered by /assistant/overview (own records only). */
const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const now = usePeriodClock();
  const term = getTermInfo(now);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    api.get('/assistant/overview')
      .then((res) => alive && setOverview(res.data))
      .catch((err) => alive && setError(err?.response?.data?.detail || 'Could not load your records right now.'));
    return () => { alive = false; };
  }, []);

  const loading = !overview && !error;
  const results = useMemo(() => overview?.results || [], [overview]);
  const timetable = useMemo(() => overview?.timetable || [], [overview]);
  const day = todayKey(now);
  const todaysPeriods = useMemo(
    () => timetable
      .filter((s) => s.dayOfWeek === day)
      .map((s) => ({
        key: `${s.dayOfWeek}-${s.periodNumber}`,
        number: s.periodNumber,
        start: s.startTime,
        end: s.endTime,
        title: s.subjectName,
        subtitle: [s.teacherName, s.roomNumber && `Room ${s.roomNumber}`].filter(Boolean).join(' • '),
        icon: subjectIcon(s.subjectName),
      })),
    [timetable, day],
  );

  const scored = results.filter((r) => percentOf(r) != null);
  const average = scored.length ? scored.reduce((sum, r) => sum + percentOf(r), 0) / scored.length : null;
  const best = scored.reduce((b, r) => (!b || percentOf(r) > percentOf(b) ? r : b), null);
  const weakest = scored.reduce((w, r) => (!w || percentOf(r) < percentOf(w) ? r : w), null);
  const attendance = overview?.attendance;
  const hasAttendance = attendance && attendance.totalDays > 0;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const live = todaysPeriods.find((p) => toMinutes(p.start) <= nowMin && nowMin < toMinutes(p.end));
  const next = todaysPeriods.find((p) => toMinutes(p.start) > nowMin);
  const firstName = overview?.fullName?.split(' ')[0] || user?.username;

  return (
    <div className="flex w-full flex-col space-y-6">
      <WelcomeBanner
        eyebrow="Student Learning Portal"
        title={`${greeting(now)}, ${firstName} 👋`}
        meta={[
          formatLongDate(now),
          overview?.className ? `${overview.className} · Grade ${overview.gradeLevel}` : `Term ${term.term}, Week ${term.week}`,
          <><Icon name="location_on" size={15} /> Campus Gampaha</>,
        ]}
        chips={[
          { icon: 'hourglass_bottom', label: 'Term ends in', value: `${term.daysLeft} Days` },
          live
            ? { icon: 'alarm', iconClass: 'text-secondary-container', label: 'Now:', value: `${live.title} · ${toMinutes(live.end) - nowMin}m left` }
            : { icon: 'alarm', iconClass: 'text-secondary-container', label: 'Next:', value: next ? `${next.title} at ${formatTime(next.start)}` : 'No more classes today' },
        ]}
        stats={[
          { label: 'Attendance', value: hasAttendance ? `${attendance.percentage.toFixed(1)}%` : '96.2%', color: 'text-emerald-300' },
          { label: 'Average Score', value: average != null ? `${average.toFixed(1)}%` : '84.5%', color: 'text-indigo-300' },
          { label: 'Subjects', value: results.length ? `${results.length}` : '8', color: 'text-sky-300' },
        ]}
        actions={
          <BannerButton icon="calendar_month" variant="ghost" onClick={() => navigate('/timetable')}>Timetable</BannerButton>
        }
      />

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/50 p-4 text-body-md text-on-error-container animate-fade-in">
          <Icon name="error" size={20} /> {error}
        </div>
      )}

      {overview && !overview.profileLinked && (
        <div className="flex items-start gap-3 rounded-xl border border-secondary-container/40 bg-secondary-fixed/40 p-4 text-body-md text-on-secondary-fixed animate-fade-up">
          <Icon name="link_off" size={22} className="mt-0.5 text-secondary" />
          <div>
            <p className="font-semibold">Your login isn&apos;t linked to a student profile yet</p>
            <p className="text-body-sm">Ask the school office to link your account so your timetable, attendance and results appear here. Study Buddy can still help you with any subject.</p>
          </div>
        </div>
      )}

      {/* KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          delay={60}
          label="My Attendance"
          loading={loading}
          value={hasAttendance ? <CountUp value={attendance.percentage} format={(v) => `${v.toFixed(1)}%`} /> : '—'}
          badge={hasAttendance ? (attendance.percentage >= 80 ? 'Satisfactory' : 'At risk') : null}
          badgeClass={attendance?.percentage >= 80 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}
          footer={
            hasAttendance ? (
              <>
                <span>Present <strong className="text-on-surface">{attendance.presentDays}</strong></span>
                <span>Late <strong className="text-on-surface">{attendance.lateDays}</strong></span>
                <span>Absent <strong className="text-on-surface">{attendance.absentDays}</strong></span>
              </>
            ) : <span>No attendance recorded yet</span>
          }
        />
        <KpiCard
          delay={120}
          label="Average Score"
          icon="insights"
          loading={loading}
          value={average == null ? '—' : <CountUp value={average} format={(v) => `${v.toFixed(1)}%`} />}
          badge={results.length ? `${results.length} papers` : null}
          badgeClass="bg-primary-fixed text-on-primary-fixed"
          onClick={() => navigate('/exams')}
          footer={
            <span className="truncate">
              {best ? <>Best: <strong className="text-on-surface">{best.subjectName}</strong> ({best.grade})</> : 'No published results yet'}
            </span>
          }
        >
          {average != null && <ProgressBar value={average} />}
        </KpiCard>
        <KpiCard
          delay={180}
          label="Classes Today"
          icon="today"
          iconClass="bg-secondary-fixed/50 text-secondary"
          loading={loading}
          value={<CountUp value={todaysPeriods.length} />}
          badge={live ? 'In class now' : null}
          onClick={() => navigate('/timetable')}
          footer={
            <span className="truncate">
              {next ? <>Next: <strong className="text-on-surface">{next.title}</strong> at {formatTime(next.start)}</> : day ? 'All done for today 🎉' : 'Weekend — no classes'}
            </span>
          }
        />
        <KpiCard
          delay={240}
          label="Weekly Periods"
          icon="calendar_month"
          iconClass="bg-tertiary-fixed/50 text-tertiary"
          loading={loading}
          value={<CountUp value={timetable.length} />}
          badge={overview?.timetableStatus && overview.timetableStatus !== 'UNAVAILABLE' ? overview.timetableStatus.toLowerCase() : null}
          badgeClass="bg-surface-container-high text-on-surface-variant capitalize"
          footer={<span className="truncate">{new Set(timetable.map((s) => s.subjectName)).size} subjects on your timetable</span>}
        />
      </section>

      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col space-y-6 lg:col-span-8">
          {/* Published results */}
          <Card delay={240}>
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface">My Published Results</h2>
                <p className="mt-0.5 text-body-sm text-on-surface-variant">Marks released by your teachers</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/exams')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-label-md text-on-surface-variant transition-all hover:-translate-y-0.5 hover:bg-surface-container-low hover:text-primary"
              >
                <Icon name="description" size={16} /> Report card
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton h-12" />)}
              {!loading && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-lg bg-surface-container-low/50 py-8 text-center text-body-sm text-on-surface-variant">
                  <Icon name="hourglass_empty" size={28} className="text-outline" /> No results have been published yet.
                </div>
              )}
              {results.slice(0, 8).map((r, i) => {
                const pct = percentOf(r);
                return (
                  <div key={`${r.examName}-${r.subjectName}-${i}`} style={{ '--d': `${i * 50}ms` }} className="group flex items-center gap-3 rounded-lg p-2 transition-all animate-fade-up stagger hover:bg-surface-container-low">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed/60 text-primary transition-transform group-hover:scale-110">
                      <Icon name={subjectIcon(r.subjectName)} size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-label-lg font-semibold text-on-surface">{r.subjectName}</span>
                        <span className="shrink-0 text-label-md text-on-surface-variant">{Number(r.marksObtained)}/{Number(r.maxMarks)}</span>
                      </div>
                      <span className="block truncate text-body-sm text-outline">{r.examName}{r.term ? ` · Term ${r.term}` : ''}</span>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                        <div
                          className={`h-full rounded-full transition-[width] duration-1000 ${pct >= 75 ? 'bg-tertiary' : pct >= 50 ? 'bg-primary-container' : 'bg-error'}`}
                          style={{ width: `${Math.min(100, pct || 0)}%` }}
                        />
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-label-sm font-bold ${gradeTone(r.grade)}`}>{r.grade || '—'}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="flex flex-col space-y-6 lg:col-span-4">
          <Card delay={220} className="flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <div className="flex items-center gap-2">
                <Icon name="schedule" size={20} className="text-primary" />
                <h2 className="text-headline-sm font-bold text-on-surface">Today&apos;s Classes</h2>
              </div>
              {live ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-tertiary-fixed">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" /> P{live.number} Live
                </span>
              ) : (
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-semibold text-on-surface-variant">{day ? 'Not in class' : 'Weekend'}</span>
              )}
            </div>
            {loading ? (
              <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}</div>
            ) : (
              <PeriodList periods={todaysPeriods} now={now} emptyText={day ? 'No classes on your timetable today.' : 'No classes on weekends — enjoy the break!'} />
            )}
            <button
              type="button"
              onClick={() => navigate('/timetable')}
              className="group mt-4 flex items-center justify-center gap-1 border-t border-outline-variant/30 pt-3 text-label-lg font-semibold text-primary transition-colors hover:text-primary-container"
            >
              <span>Full weekly timetable</span>
              <Icon name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Card>

          <Card delay={280}>
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
              <Icon name="fact_check" size={20} className="text-tertiary" />
              <h2 className="text-headline-sm font-bold text-on-surface">Attendance Health</h2>
            </div>
            <div className="mt-4 flex items-center gap-5">
              <ProgressRing
                value={attendance?.percentage || 0}
                size={88}
                stroke={3.2}
                className={hasAttendance && attendance.percentage < 80 ? 'text-error' : 'text-tertiary'}
                icon={null}
              />
              <div className="space-y-1 text-body-sm text-on-surface-variant">
                <p className="text-headline-md font-bold text-on-surface">{hasAttendance ? `${attendance.percentage}%` : '—'}</p>
                <p>{attendance?.totalDays || 0} school days recorded</p>
                <p className="text-label-md text-outline">80% or above is satisfactory</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => ask('Is my attendance OK? Give me tips to keep it up.')}
              className="group mt-4 inline-flex items-center gap-1.5 text-label-lg font-semibold text-primary transition-colors hover:text-primary-container"
            >
              <Icon name="smart_toy" size={16} /> Ask Study Buddy about it
              <Icon name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;

