import type { ModuleResult } from '@/lib/module-result';
import type { WeatherData } from '@/modules/weather/types';
import { StatusMessage } from '@/components/ui/status-message';
import { Section } from '@/components/ui/section';

interface WeatherSectionProps {
  result: ModuleResult<WeatherData>;
}

/** Código WMO → ícone Material Symbols (design Civic Vanguard). */
function wmoToIcon(code: number): string {
  if (code === 0) return 'wb_sunny';
  if (code === 1) return 'partly_cloudy_day';
  if (code === 2 || code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'weather_snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'weather_snowy';
  if (code >= 95) return 'thunderstorm';
  return 'cloud';
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
    <Section
      id="clima"
      aria-labelledby="clima-titulo"
      className="py-10"
    >
      {/* Cabeçalho da seção */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
            <span className="text-label-sm uppercase tracking-wider text-secondary">
              Tempo em São Carlos
            </span>
          </div>
          <h2 id="clima-titulo" className="font-display text-headline-lg text-primary">
            Previsão do Tempo
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Dados em tempo real da estação meteorológica — atualização periódica.
          </p>
        </div>
        {weather && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-surface-card px-3 py-1.5 text-body-sm text-on-surface-variant shadow-card">
            <span className="material-symbols-outlined text-[16px] text-outline" aria-hidden="true">
              location_on
            </span>
            {weather.city}
          </span>
        )}
      </div>

      {weather ? (
        <div className="rounded-2xl bg-surface-card p-4 shadow-card lg:p-6">
          <div className="flex flex-col items-stretch justify-between gap-6 lg:flex-row lg:items-center">
            {/* Bloco de temperatura atual */}
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary"
              >
                <span className="material-symbols-outlined icon-filled text-[36px]">
                  {wmoToIcon(weather.weatherCode)}
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-headline-lg font-bold text-primary">
                    {weather.temperatureC}°C
                  </span>
                  <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-semibold text-secondary">
                    {weather.conditionText}
                  </span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
                  <span>{weather.city}</span>
                  {weather.windKmh !== null && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                          air
                        </span>
                        Vento: {weather.windKmh} km/h
                      </span>
                    </>
                  )}
                  {weather.humidityPercent != null && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span
                        className={
                          weather.humidityPercent <= 30
                            ? 'font-medium text-error'
                            : 'text-on-surface-variant'
                        }
                      >
                        Umidade: {weather.humidityPercent}%
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Previsão em badges segmentadas */}
            <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5 lg:w-auto">
              {weather.daily.map((day) => (
                <li
                  key={day.date}
                  className="flex flex-col items-center rounded-xl bg-surface-container-low p-2.5 text-center transition-colors hover:bg-surface-container"
                >
                  <span className="text-label-sm uppercase text-outline">
                    {formatDay(day.date)}
                  </span>
                  <span
                    className="material-symbols-outlined my-1 text-[20px] text-secondary"
                    aria-hidden="true"
                  >
                    {wmoToIcon(day.weatherCode)}
                  </span>
                  <span className="text-body-sm font-semibold text-primary">
                    {day.minC}° / {day.maxC}°
                  </span>
                  <span className="truncate text-[10px] text-on-surface-variant">
                    {day.conditionText}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <StatusMessage result={result} />
          </div>
        </div>
      ) : (
        <StatusMessage result={result} />
      )}
    </Section>
  );
}
