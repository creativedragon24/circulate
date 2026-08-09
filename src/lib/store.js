// Local-first stats. Everything stays on the device (privacy ✓).
// Deliberately tiny: streak + minutes + a week of history. That's it.

const K = { stats: 'limber.stats' };

const todayStr = () => new Date().toISOString().slice(0, 10);

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch { return fallback; }
}
const save = (key, v) => localStorage.setItem(key, JSON.stringify(v));

const emptyStats = () => ({
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  totalMinutes: 0,
  sessions: 0,
  week: [],           // [{d:'2026-08-03', min:5}, ...] last 7 days incl today
  history: [],        // [{d, routine, minutes, exCount}]
  streakCelebrated: 0,
});

export const store = {
  stats: () => load(K.stats, emptyStats()),

  addSession({ minutes, routine, exCount }) {
    const s = store.stats();
    const t = todayStr();
    if (s.lastDay !== t) {
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      s.streak = s.lastDay === yesterday ? s.streak + 1 : 1;
      if (s.streak > s.bestStreak) s.bestStreak = s.streak;
      s.lastDay = t;
    }
    s.sessions += 1;
    s.totalMinutes += minutes;

    const day = s.week.find(w => w.d === t);
    if (day) day.min += minutes;
    else {
      s.week.push({ d: t, min: minutes });
      s.week = s.week.filter(w => Date.now() - new Date(w.d).getTime() < 7 * 864e5);
    }

    s.history.unshift({ d: t, routine, minutes, exCount });
    s.history = s.history.slice(0, 40);

    const celebrated = s.streak > s.streakCelebrated && s.streak >= 1;
    if (celebrated) s.streakCelebrated = s.streak;
    save(K.stats, s);
    return { stats: s, celebrated };
  },

  weekMinutes() {
    return store.stats().week.reduce((n, w) => n + w.min, 0);
  },

  reset() {
    Object.values(K).forEach(k => localStorage.removeItem(k));
  },
};
