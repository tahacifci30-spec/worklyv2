import Link from "next/link";
import { DemoForm } from "@/components/marketing/DemoForm";
import { FormScreen, LaptopMock, OverviewScreen, PhoneMock } from "@/components/marketing/Mocks";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { btn } from "@/components/ui";
import { BEDRIJF_CUSTOM, PLANS } from "@/lib/plans";

const DEMO = "#demo";

const icons: Record<string, string> = {
  form: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6M9 12h6M9 16h3",
  overview: "M4 5h16M4 12h16M4 19h10",
  agenda: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  monteur: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM11 18h2M9 8l2 2 4-4",
  invoice: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
  revenue: "M5 20V10M12 20V4M19 20v-7",
  visit: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  quote: "M7 3h10l3 3v15H7zM10 12h7M10 16h7",
  install: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
};

/** Kleine verschuiving zodat het icoon optisch in het midden van zijn vlak staat. */
const NUDGE: Record<string, string> = { quote: "translate(-1.5 0)" };

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} transform={NUDGE[name]} />
    </svg>
  );
}

const features = [
  ["form", "Klantformulier", "De klant ziet direct een richtlijnofferte."],
  ["overview", "Overzicht", "Elke aanvraag met de volgende stap."],
  ["agenda", "Agenda", "Alle afspraken en vrije tijden op één plek."],
  ["monteur", "Monteur", "Checklist, foto's en meerwerk op de telefoon."],
  ["invoice", "Offerte en factuur", "Controleren, versturen, betaald."],
  ["revenue", "Omzet", "Per dag, week, maand en jaar."],
];

const steps = [
  ["form", "Aanvraag", "De klant vult het formulier in."],
  ["visit", "Bezoek", "De monteur controleert ter plekke."],
  ["quote", "Offerte", "U controleert en verstuurt."],
  ["install", "Installatie", "De monteur voert de klus uit."],
  ["invoice", "Factuur", "Versturen, betaald, klaar."],
];

const faq = [
  ["Wat is Werkly?", "Software voor installatiebedrijven. U gaat met één programma van aanvraag naar offerte, installatie en factuur."],
  ["Wat als een klant iets niet weet?", "Dan kiest de klant 'Weet ik niet'. De aanvraag blijft bruikbaar en de monteur controleert het bij het bezoek."],
  ["Gaat er een offerte weg zonder mij?", "Nee. U controleert en keurt elke offerte en elke factuur zelf goed."],
  ["Kan ik mijn eigen prijzen instellen?", "Ja. De richtlijnofferte en de conceptofferte komen uit uw eigen prijsregels. U past ze zelf aan."],
  ["Waar zijn de opstartkosten voor?", "Voor het inrichten: uw prijsregels, bedrijfsgegevens en klantformulier. Bij Team ook training en het overzetten van lopende aanvragen."],
  ["Voor wie is het?", "Voor installatiebedrijven. We beginnen bij airco- en klimaatinstallateurs en bouwen uit naar andere vakgebieden."],
];

export default function MarketingPage() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* Kop */}
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div>
              <p className="text-sm font-semibold text-brand">Voor installatiebedrijven</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Van aanvraag tot factuur.</h1>
              <p className="mt-5 max-w-xl text-lg text-muted">
                Uw klant vult een kort formulier in en ziet direct een richtlijnofferte. U plant, maakt de offerte en
                factureert vanuit één plek.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={DEMO} className={btn.primary}>Plan een demo</a>
                <Link href="/intake" className={btn.secondary}>Probeer het zelf</Link>
              </div>
            </div>
            <PhoneMock caption="Zo ziet uw klant het">
              <FormScreen />
            </PhoneMock>
          </div>
        </section>

        {/* Wat u krijgt */}
        <section id="functies" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
          <h2 className="text-3xl font-semibold tracking-tight">Wat u krijgt</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {features.map(([icon, title, text]) => (
              <li key={title} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:gap-4 sm:p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
                  <Icon name={icon} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Hoe het werkt */}
        <section id="werkwijze" className="scroll-mt-20 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold tracking-tight">Hoe het werkt</h2>
            <ol className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
              {steps.map(([icon, title, text], i) => (
                <li key={title} className="relative rounded-2xl bg-background p-4 last:col-span-2 sm:p-5 lg:last:col-span-1">
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white">
                      <Icon name={icon} className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-muted">Stap {i + 1}</span>
                  </span>
                  <span className="mt-3 block text-lg font-semibold">{title}</span>
                  <span className="block text-sm text-muted">{text}</span>
                </li>
              ))}
            </ol>

            <div className="mt-10 lg:mt-12">
              <LaptopMock caption="Uw overzicht">
                <OverviewScreen />
              </LaptopMock>
            </div>
          </div>
        </section>

        {/* Prijzen */}
        <section id="prijzen" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
          <h2 className="text-3xl font-semibold tracking-tight">Kies uw pakket</h2>
          <p className="mt-2 text-muted">Alle bedragen zijn exclusief btw. Maandelijks opzegbaar. Eenmalige opstartkosten voor het inrichten.</p>
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.id}
                aria-labelledby={`plan-${p.id}`}
                className={`rounded-2xl border bg-white p-6 ${p.highlight ? "border-brand ring-1 ring-brand" : "border-line"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 id={`plan-${p.id}`} className="text-xl font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted">{p.audience}</p>
                  </div>
                  {p.highlight && <span className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">Meest gekozen</span>}
                </div>

                <p className="mt-5">
                  {p.monthly ? (
                    <>
                      <span className="tabular text-4xl font-semibold">{p.monthly}</span>
                      <span className="text-muted"> per maand</span>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold">Neem contact op</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {p.setup ? <>Opstartkosten eenmalig <strong className="tabular text-foreground">{p.setup}</strong></> : "Prijs en opstart op maat"}
                </p>

                <ul className="mt-5 space-y-2 text-sm">
                  {p.why.map((w) => (
                    <li key={w} className="flex gap-2">
                      <Check /> <span>{w}</span>
                    </li>
                  ))}
                </ul>

                <details className="group mt-5 border-t border-line pt-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-strong [&::-webkit-details-marker]:hidden">
                    Wat zit erin?
                    <span aria-hidden="true" className="text-xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="mt-2 text-sm">
                    <p className="font-semibold">{p.lead}</p>
                    <ul className="mt-2 space-y-2">
                      {p.includes.map((i) => (
                        <li key={i} className="flex gap-2">
                          <Check /> <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                    {p.id === "bedrijf" && (
                      <>
                        <p className="mt-4 font-semibold">Samen te bespreken:</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
                          {BEDRIJF_CUSTOM.map((i) => <li key={i}>{i}</li>)}
                        </ul>
                      </>
                    )}
                    <p className="mt-4 font-semibold">In de opstartkosten</p>
                    <p className="text-muted">{p.setupIncludes}</p>
                    {p.soon.length > 0 && (
                      <>
                        <p className="mt-4 font-semibold">Binnenkort</p>
                        <ul className="mt-1 list-inside list-disc text-muted">
                          {p.soon.map((i) => <li key={i}>{i}</li>)}
                        </ul>
                      </>
                    )}
                  </div>
                </details>

                <a href={DEMO} className={`${p.highlight ? btn.primary : btn.secondary} mt-5 w-full`}>
                  {p.monthly ? "Plan een demo" : "Neem contact op"}
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="demo" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
          <div className="overflow-hidden rounded-3xl bg-slate-900 text-white">
            <div className="grid items-center gap-10 px-5 py-10 sm:px-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <ContactVisual />
                <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Kom met ons in contact.</h2>
                <p className="mt-3 max-w-md text-slate-300">
                  Vertel kort wie u bent. Wij nemen binnen één werkdag contact op en plannen samen een gesprek in, op een moment dat u past.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    ["agenda", "U kiest het moment", "Telefonisch of op locatie."],
                    ["visit", "Wij kijken naar uw manier van werken", "Met uw soort klussen en uw prijzen."],
                    ["quote", "Vrijblijvend", "Pas bij akkoord begint de opstart."],
                  ].map(([icon, title, text]) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-teal-300">
                        <Icon name={icon} className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-medium">{title}</span>
                        <span className="block text-slate-400">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/intake" className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-5 text-sm font-semibold hover:bg-slate-800">
                  Probeer eerst het klantformulier
                </Link>
              </div>
              <DemoForm />
            </div>
          </div>
        </section>

        {/* Vragen */}
        <section id="vragen" className="scroll-mt-20 bg-white py-14">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-3xl font-semibold tracking-tight">Vragen</h2>
            <div className="mt-6 divide-y divide-line rounded-2xl border border-line">
              {faq.map(([q, a]) => (
                <details key={q} className="group px-5 py-2">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    {q}
                    <span aria-hidden="true" className="shrink-0 text-xl text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-3 text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </>
  );
}

/** Opvallend beeld bij het contactblok: een agenda met vinkje en een tekstballon. */
function ContactVisual() {
  return (
    <div className="relative h-36 w-64" aria-hidden="true">
      <div className="absolute left-0 top-5 grid h-28 w-28 -rotate-6 place-items-center rounded-[2rem] bg-gradient-to-br from-teal-400 to-teal-700 text-white shadow-lg shadow-teal-900/40">
        <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      </div>
      <div className="absolute left-20 top-0 rounded-2xl rounded-bl-sm bg-white px-5 py-3.5 text-base font-semibold text-slate-900 shadow-lg">
        Hallo! <span className="text-teal-700">Wanneer past het?</span>
      </div>
      <span className="absolute bottom-2 left-32 flex gap-1 rounded-full bg-teal-500/20 px-3 py-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300 [animation-delay:300ms]" />
      </span>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}
