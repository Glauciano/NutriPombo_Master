"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  CheckCircle,
  Circle,
  Calendar,
  Shield,
  CheckCheck,
  Clock,
} from "lucide-react";
import {
  DAILY_TASKS,
  WEEKLY_TASKS,
  PREVENTIVE_TASKS,
  type DailyTask,
} from "@/lib/alerts";

type Tab = "hoje" | "semana" | "preventivos";

/* ────────── Web Audio API sound generator ────────── */
function playAlertSound(type: "task" | "test" = "task") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    // Pleasant bell-like sequence: E5 -> G5 -> C6
    const notes = type === "task" ? [659.25, 783.99, 1046.5] : [523.25, 659.25];
    const noteDuration = 0.18;
    const gap = 0.12;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * (noteDuration + gap);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration + 0.3);

      osc.start(startTime);
      osc.stop(startTime + noteDuration + 0.35);
    });

    // Auto close context after sounds finish
    setTimeout(() => ctx.close(), (notes.length * (noteDuration + gap) + 1) * 1000);
  } catch {
    // audio not available
  }
}

/* repeat alert 3 times with pauses */
function playAlarmSequence() {
  playAlertSound("task");
  setTimeout(() => playAlertSound("task"), 1500);
  setTimeout(() => playAlertSound("task"), 3000);
}

export default function CentralAlertasPage() {
  const [tab, setTab] = useState<Tab>("hoje");
  const [now, setNow] = useState(new Date());
  const [doneTasks, setDoneTasks] = useState<Record<string, boolean>>({});
  const [taskList, setTaskList] = useState<DailyTask[]>(DAILY_TASKS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const firedAlertsRef = useRef<Set<string>>(new Set());

  /* ─── load saved state ─── */
  useEffect(() => {
    const today = new Date().toDateString();
    try {
      const saved = localStorage.getItem("alertas_done");
      if (saved) {
        const parsed = JSON.parse(saved);
        // reset if it's a new day
        if (parsed.date === today) {
          setDoneTasks(parsed.tasks || {});
        } else {
          localStorage.setItem("alertas_done", JSON.stringify({ date: today, tasks: {} }));
        }
      }
      const sound = localStorage.getItem("alertas_sound");
      if (sound !== null) setSoundEnabled(sound === "true");
    } catch { /* ignore */ }

    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    }

    /* load breeder's custom routine */
    try {
      const cachedTasks = localStorage.getItem("pm_custom_tasks");
      if (cachedTasks) {
        const parsed = JSON.parse(cachedTasks);
        if (Array.isArray(parsed) && parsed.length) setTaskList(parsed);
      }
    } catch { /* ignore */ }
    fetch("/api/settings?key=custom_tasks")
      .then((r) => r.json())
      .then((d) => {
        if (d.value?.tasks?.length) {
          setTaskList(d.value.tasks);
          try { localStorage.setItem("pm_custom_tasks", JSON.stringify(d.value.tasks)); } catch { /* ignore */ }
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  /* ─── save done tasks ─── */
  const toggleTask = useCallback((id: string) => {
    setDoneTasks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("alertas_done", JSON.stringify({ date: new Date().toDateString(), tasks: next }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const markAllDone = useCallback(() => {
    const all: Record<string, boolean> = {};
    taskList.forEach((t) => { all[t.id] = true; });
    setDoneTasks(all);
    try {
      localStorage.setItem("alertas_done", JSON.stringify({ date: new Date().toDateString(), tasks: all }));
    } catch { /* ignore */ }
  }, [taskList]);

  function toggleSound() {
    setSoundEnabled((s) => {
      const next = !s;
      try { localStorage.setItem("alertas_sound", String(next)); } catch { /* ignore */ }
      if (next) playAlertSound("test"); // preview when enabling
      return next;
    });
  }

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  }

  /* ─── clock tick + alarm check ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      const current = new Date();
      setNow(current);

      const hh = String(current.getHours()).padStart(2, "0");
      const mm = String(current.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const todayKey = current.toDateString();

      // check each task
      for (const task of taskList) {
        const alertKey = `${todayKey}-${task.id}`;
        if (
          task.time === currentTime &&
          !firedAlertsRef.current.has(alertKey) &&
          !doneTasks[task.id]
        ) {
          firedAlertsRef.current.add(alertKey);

          // sound
          if (soundEnabled) {
            playAlarmSequence();
          }

          // browser notification
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`🔔 ${task.title}`, {
              body: task.description,
              icon: "/favicon.ico",
            });
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [soundEnabled, doneTasks, taskList]);

  /* ─── derived ─── */
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  // next pending task
  const nextTask: DailyTask | null = (() => {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const pending = taskList
      .filter((t) => !doneTasks[t.id])
      .map((t) => {
        const [h, m] = t.time.split(":").map(Number);
        return { task: t, minutes: h * 60 + m };
      })
      .sort((a, b) => a.minutes - b.minutes);
    // first task with time >= now, or first pending overall
    const upcoming = pending.find((p) => p.minutes >= nowMin);
    return upcoming ? upcoming.task : pending.length > 0 ? pending[0].task : null;
  })();

  const todayWeekday = now.getDay();
  const doneCount = taskList.filter((t) => doneTasks[t.id]).length;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          <h1 className="text-2xl font-extrabold text-white">Central de Alertas</h1>
        </div>
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            soundEnabled
              ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-500"
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {soundEnabled ? "Som Ativo" : "Som Mudo"}
        </button>
      </div>

      {/* ─── Live Clock ─── */}
      <div className="bg-[#1a2736] border-2 border-yellow-500/40 rounded-2xl p-5 mb-4">
        <p className="text-5xl md:text-6xl font-black text-yellow-400 tabular-nums leading-none mb-2">
          {currentTimeStr}
        </p>
        <p className="text-sm text-slate-400 capitalize">{dateStr}</p>
      </div>

      {/* ─── Next Task ─── */}
      {nextTask && (
        <div className="bg-blue-500/5 border-2 border-blue-500/40 rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <BellRing className="w-3.5 h-3.5" />
            Próxima Tarefa
          </p>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl">{nextTask.emoji}</span>
            <h2 className="text-lg font-extrabold text-white">{nextTask.title}</h2>
          </div>
          <p className="text-sm text-slate-400 ml-9 mb-2">{nextTask.description}</p>
          <p className="text-sm font-black text-yellow-400 ml-9 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {nextTask.time}
          </p>
        </div>
      )}

      {/* ─── Notification permission banner ─── */}
      {notifPermission === "default" && (
        <button
          onClick={requestNotifications}
          className="w-full mb-4 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-left flex items-center gap-3 hover:bg-violet-500/20 transition-colors"
        >
          <Bell className="w-5 h-5 text-violet-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-violet-400">Ativar notificações do navegador</p>
            <p className="text-xs text-violet-400/60">Receba alertas mesmo com o app em segundo plano</p>
          </div>
        </button>
      )}

      {/* ─── Tabs ─── */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button
          onClick={() => setTab("hoje")}
          className={`py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === "hoje"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🔔 Hoje
        </button>
        <button
          onClick={() => setTab("semana")}
          className={`py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === "semana"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          📅 Semana
        </button>
        <button
          onClick={() => setTab("preventivos")}
          className={`py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === "preventivos"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🛡️ Preventivos
        </button>
      </div>

      {/* ══════════ TAB: HOJE ══════════ */}
      {tab === "hoje" && (
        <div>
          {/* progress */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs text-slate-500">
              {doneCount}/{taskList.length} tarefas concluídas
            </p>
            <div className="w-32 bg-[#1a2736] rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / taskList.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5 mb-4">
            {taskList.map((task) => {
              const isDone = !!doneTasks[task.id];
              const [h, m] = task.time.split(":").map(Number);
              const taskMin = h * 60 + m;
              const nowMin = now.getHours() * 60 + now.getMinutes();
              const isPast = taskMin < nowMin && !isDone;
              const isNext = nextTask?.id === task.id;

              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    isDone
                      ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                      : isNext
                        ? "bg-blue-500/5 border-blue-500/40"
                        : isPast
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-[#1a2736] border-[#2a3a4a] hover:border-yellow-500/30"
                  }`}
                >
                  {/* checkbox */}
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isNext ? "border-blue-400" : isPast ? "border-red-400" : "border-slate-600"
                      }`}>
                        <span className="text-[10px]">{task.emoji}</span>
                      </div>
                    )}
                  </div>
                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isDone ? "text-emerald-400 line-through" : "text-white"}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500">{task.description}</p>
                  </div>
                  {/* time */}
                  <span className={`text-xs font-black tabular-nums shrink-0 ${
                    isDone ? "text-emerald-400/50" : isNext ? "text-blue-400" : isPast ? "text-red-400" : "text-slate-400"
                  }`}>
                    {task.time}
                  </span>
                </button>
              );
            })}
          </div>

          {/* mark all */}
          <button
            onClick={markAllDone}
            className="w-full py-3 bg-[#1a2736] border border-[#2a3a4a] hover:border-emerald-500/40 rounded-xl text-sm font-bold text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todos os itens concluídos
          </button>
        </div>
      )}

      {/* ══════════ TAB: SEMANA ══════════ */}
      {tab === "semana" && (
        <div className="space-y-2.5">
          {WEEKLY_TASKS.map((task) => {
            const isToday = task.day === todayWeekday;
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl border ${
                  isToday
                    ? "bg-yellow-500/5 border-yellow-500/40"
                    : "bg-[#1a2736] border-[#2a3a4a]"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  isToday ? "bg-yellow-500/20" : "bg-[#0b1120]"
                }`}>
                  {task.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${isToday ? "text-yellow-400" : "text-white"}`}>
                      {task.title}
                    </p>
                    {isToday && (
                      <span className="px-2 py-0.5 bg-yellow-500 text-[#0b1120] rounded text-[9px] font-black uppercase">
                        Hoje
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{task.description}</p>
                </div>
                <span className={`text-xs font-bold shrink-0 ${isToday ? "text-yellow-400" : "text-slate-500"}`}>
                  {task.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ TAB: PREVENTIVOS ══════════ */}
      {tab === "preventivos" && (
        <div className="space-y-2.5">
          {PREVENTIVE_TASKS.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-4 rounded-xl border bg-[#1a2736] border-[#2a3a4a] hover:border-violet-500/30 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0b1120] flex items-center justify-center text-lg shrink-0">
                {task.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{task.title}</p>
                <p className="text-xs text-slate-500">{task.description}</p>
              </div>
              <span className="px-2.5 py-1 bg-violet-500/15 text-violet-400 rounded-lg text-[10px] font-bold shrink-0 text-center">
                {task.frequency}
              </span>
            </div>
          ))}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3 mt-4">
            <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/80">
              Consulte o <span className="font-bold text-blue-300">💊 Guia Terapêutico</span> em Saúde para dosagens completas de cada preventivo.
            </p>
          </div>
        </div>
      )}

      {/* footer */}
      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI 2026 — v1 • Módulo Rotina • Pombal
      </p>
    </div>
  );
}
