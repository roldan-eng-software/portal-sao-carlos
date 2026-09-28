import Link from 'next/link';
import { AnnounceCTA } from '@/components/layout/announce-cta';

export function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6">
        <AnnounceCTA />
      </div>
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 text-sm text-slate-600 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-900">Portal São Carlos</p>
          <p className="mt-2">
            Portal independente de utilidade pública. Não é órgão oficial da Prefeitura, do SAAE,
            da CPFL nem de qualquer outro órgão público ou empresa.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <p className="font-semibold text-slate-900">Transparência</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/aviso-editorial" className="hover:text-blue-700">
                Aviso editorial
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidade" className="hover:text-blue-700">
                Política de privacidade
              </Link>
            </li>
          </ul>
        </nav>
        <div id="contato-responsavel">
          <p className="font-semibold text-slate-900">Contato do responsável</p>
          <p className="mt-2">
            Dúvidas, anúncios, correções ou remoção de dados: fale conosco pelos canais exibidos na
            seção <a href="#anuncie" className="text-blue-700 hover:underline">Anuncie aqui</a>.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Portal São Carlos — São Carlos/SP. Informações de terceiros
        podem mudar; confirme dados importantes na fonte oficial.
      </div>
    </footer>
  );
}
