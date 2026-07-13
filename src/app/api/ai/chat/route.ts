import { NextResponse } from "next/server";
import { db } from "@/db";
import { pigeons, competitions, results, trainings, healthRecords } from "@/db/schema";

type PigeonRow = typeof pigeons.$inferSelect;
type CompetitionRow = typeof competitions.$inferSelect;
type ResultRow = typeof results.$inferSelect;
type TrainingRow = typeof trainings.$inferSelect;
type HealthRow = typeof healthRecords.$inferSelect;

function normalizeQuestion(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body.message || body.question || "").trim();

    if (!question) {
      return NextResponse.json({ answer: "Faça uma pergunta sobre seu plantel." });
    }

    const [allPigeons, allCompetitions, allResults, allTrainings, allHealth] = await Promise.all([
      db.select().from(pigeons) as Promise<PigeonRow[]>,
      db.select().from(competitions) as Promise<CompetitionRow[]>,
      db.select().from(results) as Promise<ResultRow[]>,
      db.select().from(trainings) as Promise<TrainingRow[]>,
      db.select().from(healthRecords) as Promise<HealthRow[]>,
    ]);

    const byId = new Map<number, PigeonRow>(allPigeons.map((p) => [p.id, p]));
    const nameOf = (id: number) => {
      const p = byId.get(id);
      return p ? p.name || p.ringNumber || `#${id}` : `#${id}`;
    };

    const q = normalizeQuestion(question);

    if (q.includes("melhor") || q.includes("vencer") || q.includes("ganhar")) {
      const scores = new Map<number, { points: number; speed: number; races: number }>();
      for (const r of allResults) {
        const prev = scores.get(r.pigeonId) || { points: 0, speed: 0, races: 0 };
        prev.points += r.points ? parseFloat(r.points) : 0;
        prev.speed += r.speed ? parseFloat(r.speed) : 0;
        prev.races += 1;
        scores.set(r.pigeonId, prev);
      }
      const best = [...scores.entries()]
        .map(([id, s]) => ({ id, score: s.points + (s.races ? s.speed / s.races / 10 : 0), ...s }))
        .sort((a, b) => b.score - a.score)[0];

      if (!best) {
        return NextResponse.json({ answer: "Ainda não há resultados suficientes para indicar o melhor pombo. Registre provas e resultados primeiro." });
      }

      return NextResponse.json({
        answer: `Pelo histórico atual, o pombo com maior chance é ${nameOf(best.id)}. Ele soma ${best.points.toFixed(0)} pontos em ${best.races} prova(s), com média de velocidade de ${best.races ? (best.speed / best.races).toFixed(0) : 0} m/min.`,
      });
    }

    if (q.includes("doente") || q.includes("saude") || q.includes("tratamento")) {
      const active = allHealth.filter((h) => h.result !== "curado");
      if (active.length === 0) {
        return NextResponse.json({ answer: "Não encontrei tratamentos ativos no momento. O plantel parece sem ocorrências abertas." });
      }
      const list = active.slice(0, 5).map((h) => `${nameOf(h.pigeonId)} (${h.disease || "consulta"})`).join(", ");
      return NextResponse.json({ answer: `Existem ${active.length} registro(s) de saúde sem cura marcada: ${list}.` });
    }

    if (q.includes("treino") || q.includes("treinamento")) {
      const totalKm = allTrainings.reduce((sum, t) => sum + (t.distance ? parseFloat(t.distance) : 0), 0);
      const avgSpeed = allTrainings.length
        ? allTrainings.reduce((sum, t) => sum + (t.speed ? parseFloat(t.speed) : 0), 0) / allTrainings.length
        : 0;
      return NextResponse.json({
        answer: `Você tem ${allTrainings.length} treino(s) registrado(s), totalizando ${totalKm.toFixed(1)} km, com velocidade média de ${avgSpeed.toFixed(0)} m/min.`,
      });
    }

    if (q.includes("prova") || q.includes("competicao")) {
      const next = allCompetitions
        .filter((c) => c.status === "agendada")
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
      if (!next) return NextResponse.json({ answer: "Não há provas agendadas no calendário." });
      return NextResponse.json({
        answer: `A próxima prova é ${next.name}, em ${new Date(next.date).toLocaleDateString("pt-BR")}, tipo ${next.type.replace("_", " ")}, distância ${next.distance || "—"} km.`,
      });
    }

    return NextResponse.json({
      answer: `Resumo do plantel: ${allPigeons.length} pombo(s), ${allCompetitions.length} prova(s), ${allResults.length} resultado(s), ${allTrainings.length} treino(s) e ${allHealth.length} registro(s) de saúde. Pergunte, por exemplo: “qual pombo tem maior chance de vencer?”`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao consultar a IA do plantel.", details: String(error) }, { status: 500 });
  }
}
