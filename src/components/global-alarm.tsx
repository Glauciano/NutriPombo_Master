"use client";


import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import Link from "next/link";

type DailyTask = {
  id: string;
  time: string;
  title: string;
  description: string;
  emoji: string;
};

const DAILY_TASKS: DailyTask[] = [
  { id: "1", time: "06:00", title: "Alimentação Matinal", description: "Fornecer ração + suplementos", emoji: "🌾" },
  { id: "2", time: "07:30", title: "Limpeza do Pombal", description: "Trocar água e limpar bandejas", emoji: "🧹" },
  { id: "3", time: "11:00", title: "Treino / Soltura", description: "Verificar condições climáticas", emoji: "🕊️" },
  { id: "4", time: "16:00", title: "Alimentação da Tarde", description: "Ração + vitaminas", emoji: "🌾" },
  { id: "5", time: "18:30", title: "Conferência do Plantel", description: "Verificar saúde dos pombos", emoji: "👀" },
  { id: "6", time: "21:00", title: "Fechamento do Pombal", description: "Trancar e ativar alarmes", emoji: "🔒" },
];

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [659.25, 783.99, 987.77, 1318.51];
    const noteDuration = 0.12;
    const gap = 0.08;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * (noteDuration + gap);

      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.3;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1200;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + noteDuration + 0.35);
    });
  } catch (e) {
    console.log("Som não suportado");
  }
}

function playAlarmSequence() {
  playAlertSound();
  setTimeout(playAlertSound, 800);
  setTimeout(playAlertSound, 1600);
}

export function GlobalAlarm() {
  const [activeAlert, setActiveAlert] = useState<DailyTask | null>(null);
  const [customTasks, setCustomTasks] = useState<DailyTask[] | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  // Carregar tarefas customizadas
  useEffect(() => {
    try {
      const cached = localStorage.getItem("pm_custom_tasks");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) setCustomTasks(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Verificação de horário
  useEffect(() => {
    const tasksToWatch = customTasks || DAILY_TASKS;
    const interval = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const todayKey = now.toDateString();

      let doneTasks: Record<string, boolean> = {};
      let soundEnabled = true;

      try {
        const saved = localStorage.getItem("alertas_done");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.date === todayKey) doneTasks = parsed.tasks || {};
        }
        const soundPref = localStorage.getItem("alertas_sound");
        if (soundPref !== null) soundEnabled = soundPref === "true";
      } catch {}

      for (const task of tasksToWatch) {
        const alertKey = `${todayKey}-${task.id}`;

        if (
          task.time === currentTime &&
          !firedRef.current.has(alertKey) &&
          !doneTasks[task.id]
        ) {
          firedRef.current.add(alertKey);
          if (soundEnabled) playAlarmSequence();
          setActiveAlert(task);

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`🔔 ${task.title}`, { body: task.description });
          }

          setTimeout(() => setActiveAlert(null), 25000);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [customTasks]);

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[200] max-w-sm animate-bounce-slow">
      <div className="bg-[#13222f] border-2 border-yellow-500 rounded-3xl p-6 shadow-2xl shadow-yellow-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-3xl shrink-0">
            {activeAlert.emoji}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold tracking-[0.5px] uppercase mb-1">
              <Bell className="w-4 h-4" />
              ALARME — {activeAlert.time}
            </div>
            <p className="text-lg font-semibold text-white leading-tight">{activeAlert.title}</p>
            <p className="text-sm text-slate-400 mt-1">{activeAlert.description}</p>

            <div className="mt-4 flex gap-3">
              <Link
                href="/alertas"
                onClick={() => setActiveAlert(null)}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold flex items-center gap-1"
              >
                Ver Central de Alertas →
              </Link>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-white p-1 -mt-1 -mr-1 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
