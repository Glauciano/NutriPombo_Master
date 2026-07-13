import { NextResponse } from "next/server";

/* ─── Coordenadas das cidades brasileiras de prova ─── */
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "cravinhos": { lat: -21.34, lon: -47.73 },
  "jardinópolis": { lat: -21.02, lon: -47.76 },
  "jardinopolis": { lat: -21.02, lon: -47.76 },
  "são joaquim da barra": { lat: -20.58, lon: -47.85 },
  "sao joaquim da barra": { lat: -20.58, lon: -47.85 },
  "s. j. da barra": { lat: -20.58, lon: -47.85 },
  "igarapava": { lat: -20.04, lon: -47.75 },
  "uberaba": { lat: -19.75, lon: -47.93 },
  "araguari": { lat: -18.65, lon: -48.19 },
  "catalão": { lat: -18.17, lon: -47.95 },
  "catalao": { lat: -18.17, lon: -47.95 },
  "goiânia": { lat: -16.68, lon: -49.25 },
  "goiania": { lat: -16.68, lon: -49.25 },
  "anápolis": { lat: -16.33, lon: -48.95 },
  "anapolis": { lat: -16.33, lon: -48.95 },
  "brasília": { lat: -15.79, lon: -47.88 },
  "brasilia": { lat: -15.79, lon: -47.88 },
  "cristalina": { lat: -16.77, lon: -47.61 },
  "campo alegre": { lat: -17.64, lon: -47.78 },
  "campo alegre de goiás": { lat: -17.64, lon: -47.78 },
  "barra do garças": { lat: -15.89, lon: -52.26 },
  "barra do garcas": { lat: -15.89, lon: -52.26 },
  "ribeirão preto": { lat: -21.18, lon: -47.81 },
  "ribeirao preto": { lat: -21.18, lon: -47.81 },
  "são paulo": { lat: -23.55, lon: -46.63 },
  "sao paulo": { lat: -23.55, lon: -46.63 },
  "campinas": { lat: -22.91, lon: -47.06 },
  "sorocaba": { lat: -23.50, lon: -47.46 },
  "bauru": { lat: -22.31, lon: -49.07 },
  "pombal": { lat: -21.18, lon: -47.81 },
  "pombal (sua base)": { lat: -21.18, lon: -47.81 },
};

function normalizeCity(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*—.*$/, "")
    .replace(/\s*-\s*\w{2}\s*$/, "")
    .trim();
}

function findCoords(city: string): { lat: number; lon: number } | null {
  const normalized = normalizeCity(city);
  // Direct match
  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized];
  // Partial match
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) return coords;
  }
  return null;
}

function degToCompass(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function weatherCodeToCondition(code: number): { main: string; description: string; icon: string } {
  if (code === 0) return { main: "Clear", description: "Céu limpo", icon: "01d" };
  if (code <= 3) return { main: "Clouds", description: code === 1 ? "Parcialmente nublado" : code === 2 ? "Nublado" : "Encoberto", icon: code === 1 ? "02d" : "04d" };
  if (code <= 49) return { main: "Fog", description: "Neblina", icon: "50d" };
  if (code <= 59) return { main: "Drizzle", description: "Garoa", icon: "09d" };
  if (code <= 69) return { main: "Rain", description: code <= 63 ? "Chuva leve" : "Chuva moderada", icon: "10d" };
  if (code <= 79) return { main: "Snow", description: "Neve", icon: "13d" };
  if (code <= 84) return { main: "Rain", description: "Pancadas de chuva", icon: "09d" };
  if (code <= 99) return { main: "Thunderstorm", description: "Tempestade", icon: "11d" };
  return { main: "Clear", description: "Céu limpo", icon: "01d" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  let lat: number;
  let lon: number;
  let cityName = city || "Local";

  if (latParam && lonParam) {
    lat = parseFloat(latParam);
    lon = parseFloat(lonParam);
  } else if (city) {
    const coords = findCoords(city);
    if (!coords) {
      // Try Open-Meteo geocoding API (free, no key needed)
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalizeCity(city))}&count=1&language=pt&format=json`,
          { next: { revalidate: 86400 } }
        );
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          cityName = geoData.results[0].name || city;
        } else {
          return NextResponse.json({ error: "city_not_found", city }, { status: 404 });
        }
      } catch {
        return NextResponse.json({ error: "geocoding_failed", city }, { status: 500 });
      }
    } else {
      lat = coords.lat;
      lon = coords.lon;
    }
  } else {
    return NextResponse.json({ error: "city or lat/lon required" }, { status: 400 });
  }

  // Fetch from Open-Meteo (100% free, no API key needed)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat!}&longitude=${lon!}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_direction_10m_dominant&timezone=America/Sao_Paulo&forecast_days=7`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      return NextResponse.json({ error: "weather_api_failed" }, { status: 502 });
    }

    const raw = await res.json();
    const current = raw.current;
    const daily = raw.daily;

    const condition = weatherCodeToCondition(current.weather_code);

    const data = {
      city: cityName,
      lat: lat!,
      lon: lon!,
      // Current
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      tempMin: daily ? Math.round(daily.temperature_2m_min[0]) : Math.round(current.temperature_2m - 3),
      tempMax: daily ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m + 3),
      humidity: Math.round(current.relative_humidity_2m),
      pressure: Math.round(current.pressure_msl),
      windSpeed: Math.round(current.wind_speed_10m),
      windGusts: Math.round(current.wind_gusts_10m || 0),
      windDeg: Math.round(current.wind_direction_10m),
      windDir: degToCompass(current.wind_direction_10m),
      clouds: Math.round(current.cloud_cover),
      rain: current.rain || 0,
      precipitation: current.precipitation || 0,
      description: condition.description,
      icon: condition.icon,
      main: condition.main,
      weatherCode: current.weather_code,
      visibility: 10000,
      dt: Date.now() / 1000,
      // 7-day forecast
      forecast: daily ? Array.from({ length: 7 }, (_, i) => ({
        date: daily.time[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        precipitation: daily.precipitation_sum[i] || 0,
        weatherCode: daily.weather_code[i],
        condition: weatherCodeToCondition(daily.weather_code[i]),
        windSpeedMax: Math.round(daily.wind_speed_10m_max[i]),
        windDir: degToCompass(daily.wind_direction_10m_dominant[i]),
      })) : [],
    };

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "fetch_failed", message: String(err) }, { status: 500 });
  }
}
