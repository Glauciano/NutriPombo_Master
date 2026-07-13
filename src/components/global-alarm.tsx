"use client";

import { useEffect, useRef, useState } from "react";
import { X, Bell } from "lucide-react";
import Link from "next/link";
import { DAILY_TASKS, type DailyTask } from "@/lib/alerts";

/* ─── Web Audio sound ─── */
function playAlertSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [659.25, 783.99, 1046.5];
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
    setTimeout(() => ctx.close(), (notes.length * (noteDuration + gap) + 1) * 1000);
  } catch { /* ignore */ }
}

function playAlarmSequence() {
  playAlertSound();
  setTimeout(playAlertSound, 1500);
  setTimeout(playAlertSound, 3000);
}

export function GlobalAlarm() {
  const [activeAlert, setActiveAlert] = useState<DailyTask | null>(null);
  const [customTasks, setCustomTasks] = useState<DailyTask[] | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  /* load custom tasks (breeder's own routine) */
  useEffect(() => {
    try {
      const cached = localStorage.getItem("pm_custom_tasks");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) setCustomTasks(parsed);
      }
    } catch { /* ignore */ }

    fetch("/api/settings?key=custom_tasks")
      .then((r) => r.json())
      .then((d) => {
        if (d.value?.tasks?.length) {
          setCustomTasks(d.value.tasks);
          try { localStorage.setItem("pm_custom_tasks", JSON.stringify(d.value.tasks)); } catch { /* ignore */ }
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  useEffect(() => {
    const tasksToWatch = customTasks || DAILY_TASKS;
    const interval = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const todayKey = now.toDateString();

      /* read done tasks + sound pref from localStorage */
      let doneTasks: Record<string, boolean> = {};
      let soundEnabled = true;
      try {
        const saved = localStorage.getItem("alertas_done");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.date === todayKey) doneTasks = parsed.tasks || {};
        }
        const sound = localStorage.getItem("alertas_sound");
        if (sound !== null) soundEnabled = sound === "true";
      } catch { /* ignore */ }

      for (const task of tasksToWatch) {
        const alertKey = `${todayKey}-${task.id}`;
        if (task.time === currentTime && !firedRef.current.has(alertKey) && !doneTasks[task.id]) {
          firedRef.current.add(alertKey);

          if (soundEnabled) playAlarmSequence();

          setActiveAlert(task);
          setTimeout(() => setActiveAlert(null), 30000);

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`🔔 ${task.title}`, { body: task.description });
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [customTasks]);

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-bounce-slow">
      <div className="bg-[#1a2736] border-2 border-yellow-500 rounded-2xl p-4 shadow-2xl shadow-yellow-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-lg shrink-0 animate-pulse">
            {activeAlert.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
              <Bell className="w-3 h-3" /> Hora da tarefa — {activeAlert.time}
            </p>
            <p className="text-sm font-bold text-white">{activeAlert.title}</p>
            <p className="text-xs text-slate-400">{activeAlert.description}</p>
            <Link
              href="/alertas"
              onClick={() => setActiveAlert(null)}
              className="inline-block mt-2 text-xs font-bold text-yellow-400 hover:text-yellow-300"
            >
              Abrir Central de Alertas →
            </Link>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
