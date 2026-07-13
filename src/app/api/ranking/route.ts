import { NextResponse } from "next/server";
import { db } from "@/db";
import { results, pigeons, competitions } from "@/db/schema";

export async function GET() {
  const [allResults, allPigeons, allCompetitions] = await Promise.all([
    db.select().from(results),
    db.select().from(pigeons),
    db.select().from(competitions),
  ]);

  const compMap = new Map(allCompetitions.map((c) => [c.id, c]));
  const pigeonMap = new Map(allPigeons.map((p) => [p.id, p]));

  /* aggregate per pigeon */
  interface Agg {
    pigeonId: number;
    races: number;
    arrived: number;
    points: number;
    totalSpeed: number;
    speedCount: number;
    bestSpeed: number;
    bestPosition: number | null;
    podiums: number;
    wins: number;
    totalKm: number;
    resultsList: {
      competitionId: number;
      competitionName: string | null;
      date: string | null;
      distance: string | null;
      type: string | null;
      position: number | null;
      speed: string | null;
      points: string | null;
      arrived: boolean;
    }[];
  }

  const aggMap = new Map<number, Agg>();

  for (const r of allResults) {
    if (!aggMap.has(r.pigeonId)) {
      aggMap.set(r.pigeonId, {
        pigeonId: r.pigeonId,
        races: 0,
        arrived: 0,
        points: 0,
        totalSpeed: 0,
        speedCount: 0,
        bestSpeed: 0,
        bestPosition: null,
        podiums: 0,
        wins: 0,
        totalKm: 0,
        resultsList: [],
      });
    }
    const agg = aggMap.get(r.pigeonId)!;
    const comp = compMap.get(r.competitionId);

    agg.races++;
    if (r.arrived) agg.arrived++;
    agg.points += r.points ? parseFloat(r.points) : 0;

    const spd = r.speed ? parseFloat(r.speed) : 0;
    if (spd > 0) {
      agg.totalSpeed += spd;
      agg.speedCount++;
      if (spd > agg.bestSpeed) agg.bestSpeed = spd;
    }

    if (r.position) {
      if (agg.bestPosition === null || r.position < agg.bestPosition) agg.bestPosition = r.position;
      if (r.position <= 3) agg.podiums++;
      if (r.position === 1) agg.wins++;
    }

    if (comp?.distance && r.arrived) {
      agg.totalKm += parseFloat(comp.distance);
    }

    agg.resultsList.push({
      competitionId: r.competitionId,
      competitionName: comp?.name || null,
      date: comp?.date ? String(comp.date) : null,
      distance: comp?.distance || null,
      type: comp?.type || null,
      position: r.position,
      speed: r.speed,
      points: r.points,
      arrived: r.arrived,
    });
  }

  const ranking = Array.from(aggMap.values())
    .map((agg) => {
      const pigeon = pigeonMap.get(agg.pigeonId);
      return {
        ...agg,
        avgSpeed: agg.speedCount > 0 ? agg.totalSpeed / agg.speedCount : 0,
        arrivalRate: agg.races > 0 ? (agg.arrived / agg.races) * 100 : 0,
        ringNumber: pigeon?.ringNumber || `#${agg.pigeonId}`,
        name: pigeon?.name || null,
        sex: pigeon?.sex || "desconhecido",
        color: pigeon?.color || null,
        status: pigeon?.status || "ativo",
      };
    })
    .sort((a, b) => b.points - a.points || b.avgSpeed - a.avgSpeed);

  return NextResponse.json(ranking);
}
