import { env } from '@/config/env';

function whatsappLink(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}

function phoneLink(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 8 ? `tel:+55${digits.startsWith('55') ? digits.slice(2) : digits}` : null;
}

/**
 * Chamada de publicidade com contratação FORA do sistema (FR-009):
 * nenhum pagamento, checkout ou formulário — apenas canais de contato
 * do responsável (SC-006: alcançável em ≤ 2 interações via link do header).
 */
export function AnnounceCTA() {
  const wa = env.contactWhatsapp ? whatsappLink(env.contactWhatsapp) : null;
  const tel = env.contactPhone ? phoneLink(env.contactPhone) : null;
  const email = env.contactEmail;

  return (
    <section
      id="anuncie"
      aria-labelledby="anuncie-titulo"
      className="scroll-mt-20 rounded-lg border border-blue-200 bg-blue-50 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Publicidade</p>
      <h2 id="anuncie-titulo" className="mt-1 text-lg font-bold text-slate-900">
        Anuncie aqui
      </h2>
      <p className="mt-1 text-sm text-slate-700">
        Divulgue seu comércio ou serviço em São Carlos. Anúncios gratuitos mediante revisão e
        destaque patrocinado mediante contratação direta com o responsável pelo portal — sem
        pagamento pelo site.
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-800 hover:underline"
          >
            WhatsApp: {env.contactWhatsapp}
          </a>
        )}
        {tel && (
          <a href={tel} className="font-semibold text-blue-800 hover:underline">
            Telefone: {env.contactPhone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="font-semibold text-blue-800 hover:underline">
            E-mail: {email}
          </a>
        )}
        {!wa && !tel && !email && (
          <span className="text-slate-600">
            Canais de contato serão informados em breve. Solicite informações sobre publicidade
            local.
          </span>
        )}
      </p>
      <p className="mt-2 text-xs text-slate-600">
        Contrate destaque pelo contato acima. Este portal não processa pagamentos.
      </p>
    </section>
  );
}
