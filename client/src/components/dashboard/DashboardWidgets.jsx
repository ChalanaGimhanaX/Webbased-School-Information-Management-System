import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../ui/Icon';
import { formatTime, periodState, toMinutes } from '../../lib/schoolCalendar';

const prefersReducedMotion = () =>
  typeof window === 'undefined' ||
  typeof requestAnimationFrame === 'undefined' ||
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Animated number that counts up from 0 (skipped for reduced motion / SSR). */
export const CountUp = ({ value, format = (v) => Math.round(v).toLocaleString(), duration = 900 }) => {
  const target = Number(value) || 0;
  const [reduced] = useState(prefersReducedMotion);
  const [display, setDisplay] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (reduced) return undefined;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(target * eased);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, reduced]);

  return <>{format(reduced ? target : display)}</>;
};

/** White dashboard card with staggered fade-up entrance. */
export const Card = ({ className = '', delay = 0, children, ...rest }) => (
  <div
    style={{ '--d': `${delay}ms` }}
    className={`rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm animate-fade-up stagger ${className}`}
    {...rest}
  >
    {children}
  </div>
);

/** Marks widgets that still show illustrative numbers (no aggregate API exists yet). */
export const SampleBadge = () => (
  <span
    title="Illustrative data – this widget is not yet connected to a live API"
    className="inline-flex items-center gap-1 rounded-full border border-dashed border-outline-variant px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-outline"
  >
    <Icon name="science" size={12} /> Sample data
  </span>
);

/** Gradient hero banner with optional photo overlay matching screenshots. */
export const WelcomeBanner = ({
  eyebrow,
  title,
  meta = [],
  chips = [],
  actions = null,
  showPhoto = true,
  photoSrc = '/images/schoolstudents.jpg',
  stats = null,
}) => (
  <section className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl transition-all duration-300 hover:shadow-2xl">
    {showPhoto && (
      <>
        <img
          src={photoSrc}
          alt="Students in classroom"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%] opacity-35 transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-primary-container/40 backdrop-blur-[0.5px]" />
      </>
    )}
    <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 opacity-15 animate-float">
      <svg fill="none" height="320" viewBox="0 0 420 320" width="420" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 0L370 320M120 0L440 320M-20 0L300 320M190 0L510 320" stroke="currentColor" strokeLinecap="round" strokeWidth="48" />
        <circle cx="340" cy="80" r="90" stroke="currentColor" strokeWidth="24" />
      </svg>
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-secondary-container/20 blur-3xl" />
    <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
      <div className="space-y-2 animate-fade-up max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/40 text-indigo-200 border border-indigo-400/40 px-3 py-0.5 text-xs font-semibold backdrop-blur-md shadow-sm">
            <Icon name="school" size={14} />
            {eyebrow}
          </span>
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-emerald-400" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-label-sm text-indigo-200">Live Campus Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md text-white">{title}</h1>
        <p className="flex flex-wrap items-center gap-2 text-body-md text-slate-200 drop-shadow">
          {meta.map((m, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="opacity-50">•</span>}
              <span className="inline-flex items-center gap-1">{m}</span>
            </React.Fragment>
          ))}
        </p>

        {stats && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20 max-w-lg">
            {stats.map((st) => (
              <div key={st.label}>
                <p className={`text-xl font-extrabold drop-shadow ${st.color || 'text-indigo-300'}`}>{st.value}</p>
                <p className="text-[11px] text-slate-300 font-medium">{st.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center animate-fade-up stagger" style={{ '--d': '120ms' }}>
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <div key={c.label} className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-105">
              <Icon name={c.icon} size={16} className={c.iconClass || 'text-tertiary-fixed'} />
              <span className="text-label-md">
                {c.label} <span className="font-bold">{c.value}</span>
              </span>
            </div>
          ))}
        </div>
        {actions && <div className="flex items-center gap-2 pt-1 sm:pt-0">{actions}</div>}
      </div>
    </div>
  </section>
);

export const BannerButton = ({ icon, children, onClick, variant = 'solid', title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={
      variant === 'solid'
        ? 'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-surface-container-lowest px-3.5 text-label-lg font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0'
        : 'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white/15 px-3 text-label-lg transition-all hover:-translate-y-0.5 hover:bg-white/25'
    }
  >
    <Icon name={icon} size={18} />
    <span className={variant === 'solid' ? '' : 'hidden md:inline'}>{children}</span>
  </button>
);

/** KPI metric card with hover lift; becomes a keyboard-accessible button when onClick is given. */
export const KpiCard = ({
  label, icon, iconClass = 'bg-primary-fixed/60 text-primary', value, loading, badge,
  badgeClass = 'bg-tertiary-fixed text-on-tertiary-fixed', footer, delay = 0, children, onClick,
}) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    style={{ '--d': `${delay}ms` }}
    className={`card-lift group flex flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm animate-fade-up stagger ${onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container' : ''}`}
  >
    <div>
      <div className="flex items-center justify-between">
        <span className="text-label-md font-medium text-on-surface-variant">{label}</span>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${iconClass}`}>
            <Icon name={icon} size={18} />
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        {loading ? (
          <span className="skeleton inline-block h-9 w-24" />
        ) : (
          <span className="text-headline-xl font-bold tracking-tight text-on-surface">{value}</span>
        )}
        {!loading && badge && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-label-sm font-semibold ${badgeClass}`}>{badge}</span>
        )}
      </div>
      {children}
    </div>
    {footer && (
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-outline-variant/30 pt-3 text-body-sm text-on-surface-variant">
        {footer}
      </div>
    )}
  </div>
);

export const ProgressBar = ({ value, className = 'bg-primary-container' }) => (
  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
    <div
      className={`h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}
      style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
    />
  </div>
);

const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

/** Radial progress ring (animates from 0 on mount). */
export const ProgressRing = ({ value = 0, size = 32, stroke = 3.5, className = 'text-tertiary', icon = 'check' }) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 60);
    return () => clearTimeout(t);
  }, [value]);
  const pct = Math.max(0, Math.min(100, shown));
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }} aria-label={`${value}%`}>
      <svg className="-rotate-90" viewBox="0 0 36 36" style={{ width: size, height: size }}>
        <path className="text-surface-variant" d={RING_PATH} fill="none" stroke="currentColor" strokeWidth={stroke} />
        <path className={`ring-progress ${className}`} d={RING_PATH} fill="none" stroke="currentColor" strokeDasharray={`${pct}, 100`} strokeLinecap="round" strokeWidth={stroke} />
      </svg>
      {icon && <Icon name={icon} size={Math.round(size * 0.4)} className={`absolute ${className}`} />}
    </div>
  );
};

/* ───────────── Attendance bar chart (sample data, grade filters) ───────────── */

const ATTENDANCE_SAMPLE = {
  'All Grades': { avg: '95.2%', peak: '97.1% (Wed)', series: [[93.6, 91.6, 94.4], [95, 94, 93], [97.6, 96.4, 98], [94.4, 92.8, 95.6], [92.4, 91, 92]] },
  Primary: { avg: '96.4%', peak: '98.0% (Tue)', series: [[95, 94, 96], [98, 97, 97.5], [96.5, 95, 97], [95.5, 94.5, 96], [94, 93, 94.5]] },
  Middle: { avg: '94.1%', peak: '96.2% (Wed)', series: [[92, 90.5, 93], [94, 93, 92], [96.2, 95, 96], [93, 92, 94], [91, 90, 91.5]] },
  'O/L & A/L': { avg: '93.8%', peak: '95.9% (Thu)', series: [[91, 90, 93], [93, 92, 92.5], [95, 94, 95.5], [95.9, 94.2, 96], [90, 89, 91]] },
};
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const BAR_SERIES = [
  { name: 'Grade 10', className: 'fill-primary', dot: 'bg-primary' },
  { name: 'Grade 11', className: 'fill-secondary-container', dot: 'bg-secondary-container' },
  { name: 'A/L 12-13', className: 'fill-inverse-primary', dot: 'bg-inverse-primary' },
];
const attendanceY = (pct) => 20 + (100 - pct) * 5; // 100% -> y=20, 70% -> y=170

export const AttendanceChart = () => {
  const [band, setBand] = useState('All Grades');
  const [tip, setTip] = useState(null);
  const data = ATTENDANCE_SAMPLE[band];
  const todayIdx = new Date().getDay() - 1; // Mon=0 … Fri=4

  return (
    <>
      <div className="flex flex-col justify-between gap-2 border-b border-outline-variant/30 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-headline-sm font-bold text-on-surface">Attendance Overview</h2>
            <SampleBadge />
          </div>
          <p className="text-body-sm text-on-surface-variant">Weekly physical check-ins by grade band</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 self-start rounded-lg bg-surface-container-low p-1 sm:self-auto">
          {Object.keys(ATTENDANCE_SAMPLE).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBand(b)}
              aria-pressed={b === band}
              className={`rounded px-2.5 py-1 text-label-md transition-all ${
                b === band ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest/60 hover:text-on-surface'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="my-2 grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low/50 px-4 py-2 sm:grid-cols-3">
        <div>
          <span className="text-label-sm uppercase tracking-wider text-outline">Weekly Average</span>
          <div key={`a-${band}`} className="text-headline-sm font-bold text-on-surface animate-fade-in">{data.avg}</div>
        </div>
        <div>
          <span className="text-label-sm uppercase tracking-wider text-outline">Peak Attendance</span>
          <div key={`p-${band}`} className="text-headline-sm font-bold text-tertiary animate-fade-in">{data.peak}</div>
        </div>
        <div className="col-span-2 flex flex-wrap items-center justify-start gap-3 text-label-sm sm:col-span-1 sm:justify-end">
          {BAR_SERIES.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full pt-4">
        {tip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-inverse-surface px-2 py-1 text-label-sm text-inverse-on-surface shadow-lg animate-scale-in"
            style={{ left: `${tip.x}%`, top: `${tip.y}%` }}
          >
            {tip.label}
          </div>
        )}
        <svg key={band} className="h-56 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 640 220" onMouseLeave={() => setTip(null)}>
          {[100, 90, 80, 70].map((v) => (
            <g key={v}>
              <line stroke="#e2e8f8" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="630" y1={attendanceY(v)} y2={attendanceY(v)} />
              <text className="fill-outline text-[10px]" textAnchor="end" x="32" y={attendanceY(v) + 4}>{v}%</text>
            </g>
          ))}
          <line stroke="#c7c4d8" strokeWidth="1" x1="40" x2="630" y1="180" y2="180" />
          {data.series.map((day, d) => {
            const gx = 70 + d * 120;
            return (
              <g key={d} transform={`translate(${gx}, 0)`}>
                {day.map((pct, s) => {
                  const y = attendanceY(pct);
                  const label = `${WEEKDAYS[d]} · ${BAR_SERIES[s].name}: ${pct}%`;
                  return (
                    <rect
                      key={s}
                      className={`chart-bar ${BAR_SERIES[s].className} ${d === 4 && todayIdx < 4 ? 'opacity-60' : ''}`}
                      style={{ '--d': `${d * 90 + s * 40}ms` }}
                      height={180 - y}
                      rx="4"
                      width="22"
                      x={s * 25}
                      y={y}
                      onMouseEnter={() => setTip({ x: ((gx + s * 25 + 11) / 640) * 100, y: (y / 220) * 100 + 4, label })}
                    >
                      <title>{label}</title>
                    </rect>
                  );
                })}
                <text className={`text-[12px] ${d === todayIdx ? 'fill-primary font-bold' : 'fill-on-surface-variant'}`} textAnchor="middle" x="36" y="200">
                  {WEEKDAYS[d]}
                  {d === todayIdx ? ' (Today)' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
};

/* ───────────── Exam performance trend chart (sample data) ───────────── */

const SUBJECTS = ['Mathematics', 'Physics / Comb.', 'English Lit', 'Computer Sci', 'Chemistry'];
const SUBJECT_X = [60, 195, 330, 465, 600];
const EXAM_SERIES = [
  { name: 'Grade 12', avg: '81.4%', values: [84.6, 89, 82.6, 88.3, 86.8], stroke: '#4f46e5', dot: 'fill-primary-container', width: 3, legend: 'bg-primary-container' },
  { name: 'Grade 11', avg: '77.8%', values: [77.5, 80.2, 76.9, 82.3, 79], stroke: '#006591', dot: 'fill-secondary', width: 2.5, dash: '4 2', legend: 'bg-secondary' },
  { name: 'Grade 10', avg: '74.2%', values: [72.4, 70.9, 73, 75.7, 73.6], stroke: '#777587', dot: 'fill-outline', width: 2, legend: 'bg-outline' },
];
const examY = (pct) => 20 + (90 - pct) * (100 / 30); // 90% -> 20, 60% -> 120

/** Smooth Catmull-Rom style path through the points. */
function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export const ExamTrendChart = ({ onDownload }) => {
  const [focus, setFocus] = useState(null);
  return (
    <>
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-headline-sm font-bold text-on-surface">Recent Exam Performance</h2>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-semibold text-on-surface-variant">Term Finals</span>
            <SampleBadge />
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">Subject-level benchmark across senior secondary batches</p>
        </div>
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-label-md text-on-surface-variant transition-all hover:-translate-y-0.5 hover:bg-surface-container-low hover:text-primary"
          >
            <Icon name="file_download" size={16} />
            <span className="hidden sm:inline">Open Reports</span>
          </button>
        )}
      </div>
      <div className="w-full pt-4">
        <svg className="h-44 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 640 180">
          {[90, 75, 60].map((v) => (
            <g key={v}>
              <line stroke="#e2e8f8" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="620" y1={examY(v)} y2={examY(v)} />
              <text className="fill-outline text-[10px]" textAnchor="end" x="32" y={examY(v) + 4}>{v}%</text>
            </g>
          ))}
          {EXAM_SERIES.map((s, si) => {
            const pts = s.values.map((v, i) => [SUBJECT_X[i], Number(examY(v).toFixed(1))]);
            return (
              <g key={s.name} className="transition-opacity duration-300" style={{ opacity: focus !== null && focus !== si ? 0.2 : 1 }}>
                {s.dash ? (
                  <path d={smoothPath(pts)} fill="none" stroke={s.stroke} strokeDasharray={s.dash} strokeLinecap="round" strokeWidth={s.width} className="animate-fade-in stagger" style={{ '--d': `${si * 200}ms` }} />
                ) : (
                  <path className="chart-line" style={{ '--d': `${si * 200}ms` }} d={smoothPath(pts)} fill="none" stroke={s.stroke} strokeLinecap="round" strokeWidth={s.width} />
                )}
                {pts.map(([x, y], i) => (
                  <circle key={i} className={`chart-dot cursor-pointer ${s.dot}`} style={{ '--d': `${600 + si * 150 + i * 60}ms` }} cx={x} cy={y} r={4 - si * 0.5}>
                    <title>{`${s.name} · ${SUBJECTS[i]}: ${s.values[i]}%`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
          {SUBJECTS.map((name, i) => (
            <text key={name} className="fill-on-surface-variant text-[11px]" textAnchor="middle" x={SUBJECT_X[i]} y="160">{name}</text>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-3">
        <div className="flex flex-wrap items-center gap-4 text-body-sm">
          {EXAM_SERIES.map((s, si) => (
            <button
              key={s.name}
              type="button"
              onMouseEnter={() => setFocus(si)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(si)}
              onBlur={() => setFocus(null)}
              className="inline-flex items-center gap-1.5 rounded px-1 transition-colors hover:bg-surface-container-low"
            >
              <span className={`h-1 w-3 rounded ${s.legend}`} /> {s.name} (Avg {s.avg})
            </button>
          ))}
        </div>
        <span className="rounded bg-tertiary-fixed px-2 py-0.5 text-label-md font-semibold text-on-tertiary-fixed">Pass Rate: 98.4%</span>
      </div>
    </>
  );
};

/* ───────────── Period tracker (live / next / completed) ───────────── */

export const PeriodList = ({ periods, now, emptyText = 'No periods scheduled today.' }) => {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nextIdx = periods.findIndex((p) => toMinutes(p.start) > nowMin);
  const items = useMemo(
    () => periods.map((p, i) => ({ ...p, state: periodState(p.start, p.end, nowMin, i === nextIdx) })),
    [periods, nowMin, nextIdx],
  );

  if (items.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 rounded-lg bg-surface-container-low/50 py-8 text-center text-body-sm text-on-surface-variant">
        <Icon name="free_breakfast" size={28} className="text-outline" />
        {emptyText}
      </div>
    );
  }

  return (
    <div className="thin-scroll mt-4 max-h-[22rem] space-y-3 overflow-y-auto pr-1">
      {items.map((p, idx) => {
        const base = 'flex items-start justify-between rounded-lg p-3 transition-all duration-200 animate-fade-up stagger';
        const style = { '--d': `${idx * 50}ms` };
        const time = `P${p.number} • ${formatTime(p.start)} - ${formatTime(p.end)}`;

        if (p.state === 'live') {
          return (
            <div key={p.key} style={style} className={`${base} relative overflow-hidden border border-primary/20 bg-primary-fixed/40 hover:shadow-md`}>
              <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary" />
              <div className="relative z-10 space-y-0.5 pl-1">
                <div className="flex items-center gap-2">
                  <span className="text-label-sm font-bold uppercase text-primary">{time}</span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">In Progress</span>
                </div>
                <h3 className="text-label-lg font-bold text-on-surface">{p.title}</h3>
                {p.subtitle && <p className="text-body-sm text-on-surface-variant">{p.subtitle}</p>}
              </div>
              <div className="z-10 flex flex-col items-end justify-between self-stretch">
                <Icon name={p.icon || 'school'} size={20} className="text-primary" />
                <span className="text-label-sm font-bold text-primary">{toMinutes(p.end) - nowMin}m left</span>
              </div>
            </div>
          );
        }

        const done = p.state === 'completed';
        return (
          <div
            key={p.key}
            style={style}
            className={`${base} ${done ? 'bg-surface-container-low/50 opacity-70' : 'border border-outline-variant/50 bg-surface-container-lowest hover:translate-x-1 hover:border-primary/30 hover:bg-surface-container-low'}`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`text-label-sm uppercase ${done ? 'font-semibold text-outline' : 'font-medium text-on-surface-variant'}`}>{time}</span>
                <span className={`rounded px-1.5 text-[10px] ${p.state === 'next' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {done ? 'Completed' : p.state === 'next' ? 'Next' : 'Later'}
                </span>
              </div>
              <h3 className={`text-label-lg text-on-surface ${done ? 'font-bold' : 'font-semibold'}`}>{p.title}</h3>
              {p.subtitle && <p className="text-body-sm text-on-surface-variant">{p.subtitle}</p>}
            </div>
            <Icon name={done ? 'check_circle' : p.icon || 'schedule'} size={18} className="text-outline" />
          </div>
        );
      })}
    </div>
  );
};

