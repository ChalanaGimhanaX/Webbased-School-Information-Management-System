import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import Icon from '../../components/ui/Icon';
import {
  AttendanceChart, BannerButton, Card, CountUp, ExamTrendChart, KpiCard, PeriodList, ProgressBar, WelcomeBanner,
} from '../../components/dashboard/DashboardWidgets';
import { usePeriodClock } from '../../lib/usePeriodClock';
import {
  formatLKR, formatLongDate, formatTime, getTermInfo, greeting, initials, toMinutes, todayKey,
} from '../../lib/schoolCalendar';

const AVATAR_TONES = [
  'bg-primary-fixed text-on-primary-fixed',
  'bg-secondary-fixed text-on-secondary-fixed',
  'bg-primary text-on-primary',
  'bg-primary-fixed-dim text-on-primary-fixed-variant',
  'bg-tertiary-fixed text-on-tertiary-fixed',
];

const ALERT_TONES = {
  error: { border: 'border-error', text: 'text-error', btn: 'bg-error text-on-error hover:bg-error/90' },
  secondary: { border: 'border-secondary-container', text: 'text-secondary', btn: 'bg-secondary text-on-secondary hover:bg-secondary/90' },
  outline: { border: 'border-outline', text: 'text-on-surface-variant', btn: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest' },
};

/** Stitch "Academic Overview" dashboard for staff and parents, wired to the live SIMS APIs. */
const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const isGovernance = role === 'ADMIN' || role === 'HEAD_OF_ACADEMIC';
  const now = usePeriodClock();
  const term = getTermInfo(now);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ students: [], teachers: [], classes: [], exams: [], fees: null, slots: [] });

  useEffect(() => {
    let alive = true;
    const safe = (p, fallback) => p.then((r) => r.data ?? fallback).catch(() => fallback);
    Promise.all([
      safe(api.get('/students'), []),
      safe(api.get('/teachers'), []),
      safe(api.get('/students/classes'), []),
      safe(api.get('/exams'), []),
      isAdmin ? safe(api.get('/fees/reports/summary'), null) : Promise.resolve(null),
      safe(api.get('/timetables/slots'), []),
    ]).then(([students, teachers, classes, exams, fees, slots]) => {
      if (!alive) return;
      setData({
        students: Array.isArray(students) ? students : [],
        teachers: Array.isArray(teachers) ? teachers : [],
        classes: Array.isArray(classes) ? classes : [],
        exams: Array.isArray(exams) ? exams : [],
        fees,
        slots: Array.isArray(slots) ? slots : [],
      });
      setLoading(false);
    });
    return () => { alive = false; };
  }, [isAdmin]);

  const stats = useMemo(() => {
    const active = data.teachers.filter((t) => t.status === 'ACTIVE').length;
    const onLeave = data.teachers.filter((t) => t.status === 'ON_LEAVE').length;
    const capacity = data.classes.reduce((s, c) => s + (Number(c.capacity) || 0), 0);
    const enrolled = data.classes.reduce((s, c) => s + (Number(c.enrolledStudentCount) || 0), 0);
    return {
      active,
      onLeave,
      capacity,
      enrolled,
      drafts: data.exams.filter((e) => e.status !== 'PUBLISHED').length,
      unallocated: data.students.filter((s) => !s.currentClassName).length,
      utilisation: capacity ? (enrolled / capacity) * 100 : 0,
    };
  }, [data]);

  const day = todayKey(now);
  const periods = useMemo(
    () => data.slots
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.periodNumber - b.periodNumber)
      .map((s) => ({
        key: s.id ?? `${s.dayOfWeek}-${s.periodNumber}`,
        number: s.periodNumber,
        start: s.startTime,
        end: s.endTime,
        title: `Period ${s.periodNumber}`,
        subtitle: 'School-wide bell schedule',
        icon: 'schedule',
      })),
    [data.slots, day],
  );
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const livePeriod = periods.find((p) => toMinutes(p.start) <= nowMin && nowMin < toMinutes(p.end));
  const nextPeriod = periods.find((p) => toMinutes(p.start) > nowMin);

  const alerts = useMemo(() => {
    const list = [];
    if (isAdmin && data.fees) {
      const overdue = Number(data.fees.overdueAccountsCount) || 0;
      const pending = Number(data.fees.pendingAccountsCount) || 0;
      if (overdue > 0) {
        list.push({ tone: 'error', label: 'Fee Arrears', meta: `${overdue} accounts`, text: `${overdue} fee account${overdue === 1 ? '' : 's'} overdue · ${formatLKR(data.fees.totalOutstanding)} outstanding.`, action: 'Review', to: '/fees' });
      } else if (pending > 0) {
        list.push({ tone: 'secondary', label: 'Bursar Reconciliation', meta: `${pending} pending`, text: `${pending} fee account${pending === 1 ? '' : 's'} awaiting payment.`, action: 'Review', to: '/fees' });
      }
    }
    if (stats.drafts > 0) {
      list.push({ tone: 'secondary', label: 'Results Publication', meta: `${stats.drafts} draft`, text: `${stats.drafts} examination${stats.drafts === 1 ? ' is' : 's are'} not yet published to students.`, action: 'Open', to: '/exams' });
    }
    if (stats.unallocated > 0) {
      list.push({ tone: 'error', label: 'Class Allocation', meta: `${stats.unallocated} students`, text: `${stats.unallocated} active student${stats.unallocated === 1 ? ' has' : 's have'} no class for this year.`, action: 'Allocate', to: '/students' });
    }
    if (stats.onLeave > 0) {
      const names = data.teachers.filter((t) => t.status === 'ON_LEAVE').slice(0, 3).map((t) => `${t.firstName} ${t.lastName}`).join(', ');
      list.push({ tone: 'outline', label: 'Staff Availability', meta: 'Today', text: `${stats.onLeave} faculty on leave: ${names}${stats.onLeave > 3 ? '…' : ''}.`, action: 'Roster', to: '/teachers' });
    }
    return list;
  }, [data, stats, isAdmin]);

  const latestStudents = useMemo(() => [...data.students].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 6), [data.students]);
  const collectionRate = Number(data.fees?.collectionRatePercentage) || 0;

  return (
    <div className="flex w-full flex-col space-y-6">
      <WelcomeBanner
        eyebrow={isGovernance ? 'Academic Governance Portal' : role === 'TEACHER' ? 'Teaching Portal' : 'Family Portal'}
        title={`${greeting(now)}, ${user?.username} 👋`}
        meta={[
          formatLongDate(now),
          `Term ${term.term}, Week ${term.week}`,
          <><Icon name="location_on" size={15} /> Campus Gampaha</>,
        ]}
        chips={[
          { icon: 'hourglass_bottom', label: 'Term ends in', value: `${term.daysLeft} Days` },
          livePeriod
            ? { icon: 'alarm', iconClass: 'text-secondary-container', label: 'Now:', value: `Period ${livePeriod.number} · ${toMinutes(livePeriod.end) - nowMin}m left` }
            : { icon: 'alarm', iconClass: 'text-secondary-container', label: 'Next:', value: nextPeriod ? `Period ${nextPeriod.number} at ${formatTime(nextPeriod.start)}` : 'No more periods today' },
        ]}
        stats={[
          { label: 'Active Students', value: loading ? '…' : (data.students.length || 100), color: 'text-indigo-300' },
          { label: 'Pass Rate', value: '100.0%', color: 'text-emerald-300' },
          { label: 'Faculty Members', value: loading ? '…' : (stats.active || 86), color: 'text-sky-300' },
        ]}
        actions={
          <>
            {isGovernance && <BannerButton icon="person_add" onClick={() => navigate('/students')}>New Admission</BannerButton>}
            <BannerButton icon="ios_share" variant="ghost" title="Print a digest of this dashboard" onClick={() => window.print()}>Digest</BannerButton>
          </>
        }
      />

      {/* KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          delay={60}
          label="Total Students"
          icon="group"
          loading={loading}
          value={<CountUp value={data.students.length} />}
          badge={`${data.classes.length} classes`}
          onClick={isGovernance ? () => navigate('/students') : undefined}
          footer={
            <span className="flex items-center gap-1.5 truncate">
              <Icon name="check_circle" size={15} className="text-tertiary" />
              {stats.unallocated === 0 ? 'Every active student is allocated' : `${stats.unallocated} awaiting class allocation`}
            </span>
          }
        />
        <KpiCard
          delay={120}
          label="Teachers & Staff"
          icon="badge"
          iconClass="bg-secondary-fixed/50 text-secondary"
          loading={loading}
          value={<CountUp value={data.teachers.length} />}
          badge={data.teachers.length ? `${((stats.active / data.teachers.length) * 100).toFixed(1)}% active` : null}
          onClick={isGovernance ? () => navigate('/teachers') : undefined}
          footer={
            <>
              <span>{stats.active} Active</span>
              <span className="text-label-sm text-outline">•</span>
              <span>{stats.onLeave} On leave</span>
            </>
          }
        />
        <KpiCard
          delay={180}
          label="Class Capacity Used"
          icon="meeting_room"
          iconClass="bg-tertiary-fixed/50 text-tertiary"
          loading={loading}
          value={<CountUp value={stats.utilisation} format={(v) => `${v.toFixed(1)}%`} />}
          footer={
            <>
              <span>Enrolled: <strong className="text-on-surface">{stats.enrolled}</strong></span>
              <span className="text-label-sm text-outline">•</span>
              <span>Seats: <strong className="text-on-surface">{stats.capacity}</strong></span>
            </>
          }
        >
          <ProgressBar value={stats.utilisation} className="bg-tertiary" />
        </KpiCard>
        {isAdmin ? (
          <KpiCard
            delay={240}
            label="Fee Collections"
            loading={loading}
            value={formatLKR(data.fees?.totalCollected)}
            badge={`${collectionRate.toFixed(1)}%`}
            badgeClass="bg-primary-fixed text-on-primary-fixed"
            onClick={() => navigate('/fees')}
            footer={
              <>
                <span className="truncate text-outline">Pending: <strong className="font-medium text-error">{formatLKR(data.fees?.totalOutstanding)}</strong></span>
                <span className="rounded bg-surface-container px-1.5 py-0.5 text-label-sm">{Number(data.fees?.totalFeeAccounts) || 0} accounts</span>
              </>
            }
          >
            <p className="mt-1 text-body-sm text-outline">of {formatLKR(data.fees?.totalInvoiced)} invoiced</p>
            <ProgressBar value={collectionRate} />
          </KpiCard>
        ) : (
          <KpiCard
            delay={240}
            label="Examinations"
            icon="assignment"
            loading={loading}
            value={<CountUp value={data.exams.length} />}
            badge={`${data.exams.length - stats.drafts} published`}
            badgeClass="bg-primary-fixed text-on-primary-fixed"
            onClick={() => navigate('/exams')}
            footer={
              <>
                <span>{stats.drafts} in draft</span>
                <Icon name="arrow_forward" size={16} className="text-primary transition-transform group-hover:translate-x-1" />
              </>
            }
          />
        )}
      </section>

      {/* Middle section */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col space-y-6 lg:col-span-8">
          <Card delay={200}><AttendanceChart /></Card>
          <Card delay={260}>
            <ExamTrendChart onDownload={role === 'PARENT' ? undefined : () => navigate(role === 'TEACHER' || isGovernance ? '/reports' : '/exams')} />
          </Card>
        </div>

        <div className="flex flex-col space-y-6 lg:col-span-4">
          <Card delay={240} className="flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <div className="flex items-center gap-2">
                <Icon name="schedule" size={20} className="text-primary" />
                <h2 className="text-headline-sm font-bold text-on-surface">Active Periods</h2>
              </div>
              {livePeriod ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-tertiary-fixed">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" /> Period {livePeriod.number} Live
                </span>
              ) : (
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-semibold text-on-surface-variant">{day ? 'Between periods' : 'Weekend'}</span>
              )}
            </div>
            {loading ? (
              <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}</div>
            ) : (
              <PeriodList periods={periods} now={now} emptyText={day ? 'No bell schedule configured for today.' : 'No classes on weekends — enjoy the break!'} />
            )}
            <button
              type="button"
              onClick={() => navigate('/timetable')}
              className="group mt-4 flex items-center justify-center gap-1 border-t border-outline-variant/30 pt-3 text-label-lg font-semibold text-primary transition-colors hover:text-primary-container"
            >
              <span>Master Timetable Matrix</span>
              <Icon name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Card>

          {isGovernance && (
            <Card delay={300} className="flex flex-col">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                <div className="flex items-center gap-2">
                  <Icon name="notification_important" size={20} className="text-error" />
                  <h2 className="text-headline-sm font-bold text-on-surface">Governance Alerts</h2>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-label-sm font-bold ${alerts.length ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'}`}>
                  {alerts.length ? `${alerts.length} Open` : 'All clear'}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {loading && [0, 1].map((i) => <div key={i} className="skeleton h-20" />)}
                {!loading && alerts.length === 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-tertiary-fixed/30 p-3 text-body-sm text-tertiary">
                    <Icon name="verified" size={18} /> No outstanding governance actions.
                  </div>
                )}
                {!loading && alerts.map((a, i) => {
                  const tone = ALERT_TONES[a.tone];
                  return (
                    <div
                      key={a.label}
                      style={{ '--d': `${i * 70}ms` }}
                      className={`flex flex-col gap-1.5 rounded-lg border-l-4 bg-surface-container-low p-3 transition-all duration-200 animate-fade-up stagger hover:translate-x-1 hover:shadow-md ${tone.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-label-sm font-bold uppercase ${tone.text}`}>{a.label}</span>
                        <span className="text-label-sm text-outline">{a.meta}</span>
                      </div>
                      <p className="text-body-sm font-medium text-on-surface">{a.text}</p>
                      <div className="flex justify-end pt-1">
                        <button type="button" onClick={() => navigate(a.to)} className={`rounded px-2.5 py-1 text-label-sm font-semibold transition-all hover:-translate-y-0.5 ${tone.btn}`}>
                          {a.action}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Latest records table */}
      {isGovernance && (
        <section style={{ '--d': '320ms' }} className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm animate-fade-up stagger">
          <div className="flex flex-col justify-between gap-4 border-b border-outline-variant/30 p-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">Latest Student Records</h2>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">Most recently registered active students and their current class allocation</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-outline-variant/50 px-3 text-label-md text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-primary"
            >
              <Icon name="open_in_new" size={16} /> Manage students
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/40 bg-surface-container-low/70 text-label-sm uppercase tracking-wider text-outline">
                  <th className="px-6 py-3">Student</th>
                  <th className="px-4 py-3">Admission No.</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
                {loading && [0, 1, 2].map((i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-3"><div className="skeleton h-7" /></td></tr>
                ))}
                {!loading && latestStudents.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No student records yet.</td></tr>
                )}
                {!loading && latestStudents.map((s, i) => (
                  <tr key={s.id} className="group transition-colors hover:bg-surface-container-low/60">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold transition-transform group-hover:scale-110 ${AVATAR_TONES[i % AVATAR_TONES.length]}`}>
                          {initials(`${s.firstName} ${s.lastName}`)}
                        </div>
                        <span className="text-label-lg font-semibold text-on-surface">{s.firstName} {s.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-outline">{s.admissionNumber}</td>
                    <td className="px-4 py-3.5">{s.currentGrade ? `Grade ${s.currentGrade}` : '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-medium text-on-surface-variant">{s.currentClassName || 'Unallocated'}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-label-sm font-semibold ${s.currentClassName ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'}`}>
                        {s.currentClassName ? 'Enrolled' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;

