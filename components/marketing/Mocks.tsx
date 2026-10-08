/** Voorbeeldschermen op de website. Alleen om te laten zien, niet bedoeld om op te klikken. */

function Frame({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="mx-auto w-full">
      <figcaption className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-muted">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {caption}
      </figcaption>
      <div aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>
    </figure>
  );
}

export function PhoneMock({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <Frame caption={caption}>
      {/* iPhone 16: 147,6 x 71,6 mm, met statusbalk, Dynamic Island en thuisbalk */}
      <div className="relative mx-auto flex aspect-[71.6/147.6] w-[min(100%,280px)] flex-col overflow-hidden rounded-[3rem] border-[10px] border-slate-900 bg-background shadow-2xl ring-1 ring-slate-700/40">
        <div className="relative flex h-10 shrink-0 items-end justify-between px-6 pb-1 text-[11px] font-semibold text-slate-900">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-slate-900" />
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-px">
              {[3, 5, 7, 9].map((h) => (
                <span key={h} className="w-[2px] rounded-sm bg-slate-900" style={{ height: h }} />
              ))}
            </span>
            <span className="h-2.5 w-5 rounded-[3px] border border-slate-900 p-px">
              <span className="block h-full w-3/4 rounded-[1px] bg-slate-900" />
            </span>
          </span>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden px-4 pt-3">{children}</div>
        <div className="mx-auto mb-2 mt-1 h-1 w-24 shrink-0 rounded-full bg-slate-900" />
      </div>
    </Frame>
  );
}

/** Laptop met een scherm in 16:10 en een voet, voor het overzicht van de eigenaar. */
export function LaptopMock({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <Frame caption={caption}>
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-t-2xl border-[8px] border-b-0 border-slate-900 bg-slate-900 shadow-2xl sm:border-[10px] sm:border-b-0">
          <div className="relative aspect-[16/11] overflow-hidden rounded-t-md bg-background">{children}</div>
        </div>
        <div className="relative mx-auto h-3 w-[104%] -translate-x-[2%] rounded-b-2xl bg-gradient-to-b from-slate-300 to-slate-400 shadow-lg sm:h-4">
          <span className="absolute left-1/2 top-0 h-1 w-20 -translate-x-1/2 rounded-b-md bg-slate-500/60" />
        </div>
      </div>
    </Frame>
  );
}

export function FormScreen() {
  return (
    <>
      <div className="flex justify-between text-[11px] font-medium text-muted">
        <span>← Terug</span>
        <span>Vraag 4 van 5</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
        <div className="h-full w-4/5 rounded-full bg-brand" />
      </div>
      <p className="mt-5 text-xl font-semibold leading-snug">Waar kan de buitenunit komen?</p>
      <div className="mt-4 space-y-2.5 text-sm font-semibold">
        {["Aan de gevel", "Op het balkon", "Op het platte dak", "Op de grond in de tuin"].map((o, i) => (
          <div key={o} className={`rounded-xl border px-3 py-3 ${i === 1 ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
            {o}
          </div>
        ))}
        <div className="rounded-xl border border-dashed border-slate-300 px-3 py-3 text-muted">Weet ik niet</div>
      </div>
      <div className="mt-auto pb-3 pt-3">
        <div className="rounded-xl bg-brand py-3 text-center text-sm font-semibold text-white">Volgende vraag</div>
      </div>
    </>
  );
}

/** Het dashboard van de eigenaar, zoals het in de app staat. */
export function OverviewScreen() {
  const groups = [
    ["Open", "2", "Nieuw binnen", "bg-sky-700 text-white ring-sky-700"],
    ["Bezig", "12", "Onderweg naar de factuur", "bg-violet-50 text-violet-900 ring-violet-200"],
    ["Afgerond", "13", "Betaald of afgewezen", "bg-emerald-50 text-emerald-900 ring-emerald-200"],
  ];
  const rows = [
    ["Jan de Vries", "Waalwijk · 07 okt · gewenst di 13 okt, ochtend", "€ 3.750 – € 4.650"],
    ["Rik Smeets", "Tilburg · 08 okt · gewenst do 15 okt, middag", "€ 1.950 – € 2.400"],
  ];
  return (
    <div className="flex h-full flex-col text-[8px] leading-tight sm:text-[11px]">
      <div className="flex items-center gap-2 border-b border-line bg-white px-3 py-1.5 font-medium sm:gap-3 sm:py-2">
        <span className="text-[11px] font-bold sm:text-base">Werkly</span>
        <span className="rounded-md bg-brand-soft px-2 py-0.5 text-brand-strong">Aanvragen</span>
        <span className="text-muted">Agenda</span>
        <span className="text-muted">Omzet</span>
        <span className="text-muted">Instellingen</span>
        <span className="ml-auto text-muted">Eigenaar</span>
      </div>
      <div className="min-h-0 flex-1 space-y-1.5 p-2 sm:space-y-2.5 sm:p-3.5">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {groups.map(([l, n, h, tone]) => (
            <div key={l} className={`rounded-lg p-1.5 ring-1 ring-inset sm:rounded-xl sm:p-3 ${tone}`}>
              <div className="flex items-center justify-between">
                <span className="h-2 w-2 rounded-full border border-current sm:h-3.5 sm:w-3.5" />
                <span className="tabular text-sm font-semibold sm:text-2xl">{n}</span>
              </div>
              <div className="mt-0.5 font-semibold sm:mt-2 sm:text-sm">{l}</div>
              <div className="truncate opacity-80">{h}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white p-1.5 shadow-sm sm:rounded-xl sm:p-3">
          <p className="font-semibold sm:text-sm">Vandaag</p>
          <p className="mt-1 flex gap-2"><span className="tabular font-semibold sm:text-sm">10:00</span><span><span className="block font-medium">Pieter Jansen</span><span className="block text-muted">Bezoek · Tilburg · Sven Bakker</span></span></p>
          <p className="mt-1 rounded-md bg-slate-50 px-2 py-1 text-muted sm:mt-2 sm:py-1.5"><span className="font-semibold uppercase tracking-wide">Hierna</span> vr 9 okt om 08:00 · Tom Bakker<span className="block">Installatie · Best · Lars Visser</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1/3 rounded-md border border-line bg-white px-2 py-1 text-muted sm:py-1.5">Zoek naam of plaats</span>
          <span className="rounded-md border border-line bg-white px-2 py-1 font-medium sm:py-1.5">Zoeken</span>
        </div>
        <span className="inline-block rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-semibold text-sky-900">Nieuw 2</span>
        <ul className="overflow-hidden rounded-lg bg-white shadow-sm">
          {rows.map(([n, s, p]) => (
            <li key={n} className="flex items-center justify-between gap-2 border-l-4 border-sky-500 px-2 py-1 sm:py-2">
              <span className="min-w-0"><span className="block truncate font-semibold sm:text-sm">{n}</span><span className="block truncate text-muted">{s}</span></span>
              <span className="shrink-0 text-muted">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
