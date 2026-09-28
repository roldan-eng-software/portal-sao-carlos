import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900 hover:text-blue-700"
        >
          Portal São Carlos
        </Link>
        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-4 text-sm">
          <a href="#clima" className="text-slate-700 hover:text-blue-700">
            Clima
          </a>
          <a href="#noticias" className="text-slate-700 hover:text-blue-700">
            Notícias
          </a>
          <a href="#contatos" className="text-slate-700 hover:text-blue-700">
            Contatos
          </a>
          <a
            href="#anuncie"
            className="rounded-md bg-blue-700 px-3 py-2 font-semibold text-white hover:bg-blue-800"
          >
            Anuncie aqui
          </a>
        </nav>
      </div>
    </header>
  );
}
