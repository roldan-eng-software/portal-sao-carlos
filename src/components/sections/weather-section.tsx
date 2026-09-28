import type { ModuleResult } from '@/lib/module-result';
import type { WeatherData } from '@/modules/weather/types';
import { StatusMessage } from '@/components/ui/status-message';

interface WeatherSectionProps {
  result: ModuleResult<WeatherData>;
}

function formatDay(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
    .format(parsed)
    .replace('.', '');
}

export function WeatherSection({ result }: WeatherSectionProps) {
  const weather = result.data;

  return (
    <section id="clima" aria-labelledby="clima-titulo" className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="clima-titulo" className="text-xl font-bold text-slate-900">
          Previsão do tempo
        </h2>
        {weather && <span className="text-sm text-slate-600">{weather.city}</span>}
      </div>

      {weather ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-baseline gap-4">
            <p className="text-4xl font-bold text-slate-900">{weather.temperatureC}°C</p>
            <p className="text-lg text-slate-700">{weather.conditionText}</p>
            {weather.windKmh !== null && (
              <p className="text-sm text-slate-600">Vento: {weather.windKmh} km/h</p>
            )}
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {weather.daily.map((day) => (
              <li
                key={day.date}
                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <p className="font-semibold text-slate-800">{formatDay(day.date)}</p>
                <p className="text-slate-700">{day.conditionText}</p>
                <p className="text-slate-600">
                  {day.minC}° / {day.maxC}°
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <StatusMessage result={result} />
          </div>
        </div>
      ) : (
        <StatusMessage result={result} />
      )}
    </section>
  );
}
