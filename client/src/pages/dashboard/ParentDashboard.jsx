import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import Icon from '../../components/ui/Icon';
import { BannerButton, Card, CountUp, KpiCard, ProgressBar, WelcomeBanner } from '../../components/dashboard/DashboardWidgets';
import { usePeriodClock } from '../../lib/usePeriodClock';
import { formatLKR, formatLongDate, getTermInfo, greeting, initials } from '../../lib/schoolCalendar';

const STATUS_TONE = {
  PAID: 'bg-tertiary-fixed text-on-tertiary-fixed',
  PARTIAL: 'bg-secondary-fixed text-on-secondary-fixed',
  OVERDUE: 'bg-error-container text-on-error-container',
};

/**
 * Family Portal dashboard. Parents only see data about their OWN children
 * (fee accounts via /parents/by-user + /fees/accounts/parent) — no school-wide statistics.
 */
const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const now = usePeriodClock();
  const term = getTermInfo(now);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlinked, setUnlinked] = useState(false);

  useEffect(() => {
    if (!user?.userId) return undefined;
    let alive = true;
    (async () => {
      try {
        const parent = await api.get(`/parents/by-user/${user.userId}`).catch((err) => {
          if (err?.response?.status === 404) return { data: null };
          throw err;
        });
        const parentId = parent.data?.id;
        if (!parentId) {
          if (alive) setUnlinked(true);
          return;
        }
        const res = await api.get(`/fees/accounts/parent/${parentId}`);
        if (alive) setAccounts(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (alive) setError('We could not load your family records. Please contact the school office if this continues.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  const children = useMemo(() => {
    const map = new Map();
    accounts.forEach((a) => {
      const key = a.studentId ?? a.studentName;
      if (!map.has(key)) map.set(key, { key, name: a.studentName || `Student #${a.studentId}`, admNo: a.studentAdmissionNumber, total: 0, paid: 0, balance: 0, count: 0 });
      const c = map.get(key);
      c.total += Number(a.totalAmount) || 0;
      c.paid += Number(a.paidAmount) || 0;
      c.balance += Number(a.balanceAmount) || 0;
      c.count += 1;
    });
    return [...map.values()];
  }, [accounts]);

  const totals = useMemo(() => children.reduce(
    (t, c) => ({ total: t.total + c.total, paid: t.paid + c.paid, balance: t.balance + c.balance }),
    { total: 0, paid: 0, balance: 0 },
  ), [children]);
  const paidPct = totals.total > 0 ? (totals.paid / totals.total) * 100 : 0;

  const upcoming = useMemo(
    () => accounts
      .filter((a) => Number(a.balanceAmount) > 0)
      .sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')))
      .slice(0, 5),
    [accounts],
  );

  return (
    <div className="flex w-full flex-col space-y-6">
      <WelcomeBanner
        eyebrow="Family Portal"
        title={`${greeting(now)}, ${user?.username} 👋`}
        meta={[formatLongDate(now), `Term ${term.term}, Week ${term.week}`, <><Icon name="location_on" size={15} /> Campus Gampaha</>]}
        chips={[{ icon: 'hourglass_bottom', label: 'Term ends in', value: `${term.daysLeft} Days` }]}
        stats={[
          { label: 'Children', value: loading ? '…' : children.length, color: 'text-indigo-300' },
          { label: 'Outstanding', value: loading ? '…' : formatLKR(totals.balance), color: 'text-rose-300' },
          { label: 'Paid', value: loading ? '…' : `${paidPct.toFixed(0)}%`, color: 'text-emerald-300' },
        ]}
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <BannerButton icon="assignment" onClick={() => navigate('/exams')}>Children's Reports</BannerButton>
            <BannerButton icon="calendar_month" onClick={() => navigate('/timetable')}>Timetable</BannerButton>
            <BannerButton icon="payments" onClick={() => navigate('/fees')}>Pay Fees</BannerButton>
          </div>
        )}
      />

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/50 p-4 text-body-md text-on-error-container">
          <Icon name="error" size={20} /> {error}
        </div>
      )}

      {unlinked && (
        <div className="flex items-start gap-3 rounded-xl border border-secondary-container/40 bg-secondary-fixed/40 p-4 text-body-md text-on-secondary-fixed animate-fade-up">
          <Icon name="link_off" size={22} className="mt-0.5 text-secondary" />
          <div>
            <p className="font-semibold">Your login isn&apos;t linked to a parent profile yet</p>
            <p className="text-body-sm">Ask the school office to link your account to your children so their fees appear here.</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard delay={60} label="Children Enrolled" icon="family_restroom" loading={loading} value={<CountUp value={children.length} />}
          footer={<span className="truncate">{children.map((c) => c.name.split(' ')[0]).join(', ') || 'No linked students yet'}</span>} />
        <KpiCard delay={120} label="Total Fees" icon="receipt_long" iconClass="bg-secondary-fixed/50 text-secondary" loading={loading}
          value={formatLKR(totals.total)} footer={<span>{accounts.length} fee items this year</span>} />
        <KpiCard delay={180} label="Paid So Far" icon="task_alt" iconClass="bg-tertiary-fixed/50 text-tertiary" loading={loading}
          value={formatLKR(totals.paid)} badge={`${paidPct.toFixed(1)}%`} badgeClass="bg-tertiary-fixed text-on-tertiary-fixed"
          footer={<span>Thank you for staying up to date</span>}>
          <ProgressBar value={paidPct} className="bg-tertiary" />
        </KpiCard>
        <KpiCard delay={240} label="Outstanding Balance" icon="pending_actions" iconClass="bg-error-container/60 text-error" loading={loading}
          value={formatLKR(totals.balance)} onClick={() => navigate('/fees')}
          footer={<span className="flex items-center gap-1">{totals.balance > 0 ? 'Pay online or upload a bank slip' : 'All fees settled 🎉'}<Icon name="arrow_forward" size={16} className="text-primary" /></span>} />
      </section>

      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <Card delay={200} className="lg:col-span-7">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="school" size={20} className="text-primary" />
              <h2 className="text-headline-sm font-bold text-on-surface">My Children</h2>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {loading && [0, 1].map((i) => <div key={i} className="skeleton h-16" />)}
            {!loading && children.length === 0 && (
              <p className="rounded-lg bg-surface-container-low p-4 text-center text-body-sm text-on-surface-variant">No students are linked to your account yet. Please contact the school office.</p>
            )}
            {children.map((c, i) => {
              const pct = c.total > 0 ? (c.paid / c.total) * 100 : 0;
              return (
                <div key={c.key} style={{ '--d': `${i * 60}ms` }} className="flex items-center gap-3 rounded-lg p-3 transition-all animate-fade-up stagger hover:bg-surface-container-low">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-md font-bold text-on-primary-fixed">{initials(c.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-label-lg font-semibold text-on-surface">{c.name}</span>
                      <span className={`shrink-0 text-label-md font-semibold ${c.balance > 0 ? 'text-error' : 'text-tertiary'}`}>{c.balance > 0 ? `${formatLKR(c.balance)} due` : 'Settled'}</span>
                    </div>
                    <span className="block text-body-sm text-outline">{c.admNo ? `Adm No ${c.admNo} · ` : ''}{c.count} fee item{c.count === 1 ? '' : 's'}</span>
                    <ProgressBar value={pct} className={pct >= 100 ? 'bg-tertiary' : undefined} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card delay={260} className="lg:col-span-5">
          <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
            <Icon name="event_upcoming" size={20} className="text-secondary" />
            <h2 className="text-headline-sm font-bold text-on-surface">Upcoming Dues</h2>
          </div>
          <div className="mt-4 space-y-2">
            {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton h-12" />)}
            {!loading && upcoming.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-tertiary-fixed/30 p-3 text-body-sm text-on-surface"><Icon name="verified" size={18} className="text-tertiary" /> Nothing due right now.</div>
            )}
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/40 p-3">
                <div className="min-w-0">
                  <p className="truncate text-label-lg font-semibold text-on-surface">{a.feeStructure?.name || a.feeStructure?.feeType || 'School fee'}</p>
                  <p className="truncate text-body-sm text-outline">{a.studentName}{a.dueDate ? ` · due ${a.dueDate}` : ''}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-label-lg font-bold text-on-surface">{formatLKR(a.balanceAmount)}</span>
                  {a.status && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[a.status] || 'bg-surface-container-high text-on-surface-variant'}`}>{a.status}</span>}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => navigate('/fees')} className="group mt-4 flex w-full items-center justify-center gap-1 border-t border-outline-variant/30 pt-3 text-label-lg font-semibold text-primary hover:text-primary-container">
            Go to My Fees <Icon name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </Card>
      </section>
    </div>
  );
};

export default ParentDashboard;

