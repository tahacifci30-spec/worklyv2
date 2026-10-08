import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CopyButton } from "@/components/CopyButton";
import { StatusIcon } from "@/components/StatusIcon";
import { btn, dateNl, field } from "@/components/ui";
import { OWNER, bookings, conflicts, techLabel } from "@/lib/agenda";
import { requireSession } from "@/lib/auth";
import { PART_LABEL, dayShort, todayNl } from "@/lib/dates";
import { daysSince, lastActivity } from "@/lib/metrics";
import { formatRange } from "@/lib/pricing/engine";
import { listAgendaItems, listLeads } from "@/lib/store";
import type { Lead } from "@/lib/types";
import {
  GROUPS,
  NEXT_ACTION,
  OWNER_TURN,
  STATUS_BAR,
  STATUS_LABEL,
  STATUS_STYLE,
  isOpen,
  nextAction,
  type GroupId,
} from "@/lib/workflow";

export const metadata: Metadata = { title: "Aanvragen" };
export const dynamic = "force-dynamic";

const STALE_DAYS = 3;

// Kleur per hoofdgroep: gewoon, geselecteerd en bij de muis erboven.
const TONE: Record<GroupId, { idle: string; on: string }> = {
  open: { idle: "bg-sky-50 text-sky-900 ring-sky-200 hover:bg-sky-100", on: "bg-sky-700 text-white ring-sky-700 hover:bg-sky-800" },
  bezig: { idle: "bg-violet-50 text-violet-900 ring-violet-200 hover:bg-violet-100", on: "bg-violet-700 text-white ring-violet-700 hover:bg-violet-800" },
  afgerond: { idle: "bg-emerald-50 text-emerald-900 ring-emerald-200 hover:bg-emerald-100", on: "bg-emerald-700 text-white ring-emerald-700 hover:bg-emerald-800" },
};

type Alert = { id: string; name: string; text: string };

/** Dingen waar de eigenaar nu iets mee moet: afmeldingen, teruggebelverzoeken en botsingen met vrije dagen. */
function alerts(leads: Lead[], clashes: ReturnType<typeof conflicts>): Alert[] {
  const out: Alert[] = [];
  for (const l of leads) {
    if (!isOpen(l)) continue;
    const a = l.status === "visit_planned" ? l.appointment : l.status === "install_planned" ? l.install_appointment : undefined;
    if (a?.declined_at) {
      out.push({ id: l.id, name: l.customer.name, text: `${techLabel(a.technician)} kan niet op ${dayShort(a.date)} om ${a.time}.` });
    }
    if (l.proposal?.callback_at && !l.proposal.chosen) {
      out.push({ id: l.id, name: l.customer.name, text: "Geen van de voorgestelde momenten past. Bel de klant terug." });
    }
  }
  for (const { booking: b } of clashes) {
    if (b.appt.declined_at) continue;
    out.push({
      id: b.lead.id,
      name: b.lead.customer.name,
      text: `${techLabel(b.appt.technician)} is niet beschikbaar op ${dayShort(b.appt.date)}, maar heeft dan een afspraak.`,
    });
  }
  return out;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const session = await requireSession("owner");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 80);

  const [all, items] = await Promise.all([listLeads(session.company_id), listAgendaItems(session.company_id)]);
  const countOf = (g: GroupId) => all.filter((l) => GROUPS.find((x) => x.id === g)!.statuses.includes(l.status)).length;
  const requested = GROUPS.find((g) => g.id === sp.filter)?.id;
  const group: GroupId = requested ?? (countOf("open") > 0 ? "open" : "bezig");
  const alertList = alerts(all, conflicts(all, items));

  // Afspraken van vandaag (en nog niet afgeronde van eerdere dagen): bezoeken en installaties.
  const today = todayNl();
  const todays = all
    .filter(isOpen)
    .flatMap((l) => {
      const out: { lead: Lead; kind: "Bezoek" | "Installatie"; date: string; time: string; tech: string }[] = [];
      if (l.status === "visit_planned" && l.appointment && !l.appointment.declined_at && l.appointment.date <= today)
        out.push({ lead: l, kind: "Bezoek", date: l.appointment.date, time: l.appointment.time, tech: l.appointment.technician });
      if (l.status === "install_planned" && l.install_appointment && !l.install_appointment.declined_at && l.install_appointment.date <= today)
        out.push({ lead: l, kind: "Installatie", date: l.install_appointment.date, time: l.install_appointment.time, tech: l.install_appointment.technician });
      return out;
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  // Eerstvolgende afspraak na vandaag: een bezoek, een installatie of een overige afspraak.
  const upcoming = [
    ...bookings(all)
      .filter((b) => !b.done && b.lead.status !== "completed" && b.appt.date > today)
      .map((b) => ({
        date: b.appt.date,
        time: b.appt.time,
        title: b.lead.customer.name,
        sub: `${b.kind === "visit" ? "Bezoek" : "Installatie"} · ${b.lead.customer.city} · ${techLabel(b.appt.technician)}`,
        href: `/dashboard/${b.lead.id}?tab=afspraken`,
      })),
    ...items
      .filter((i) => i.kind === "item" && i.date > today)
      .map((i) => ({ date: i.date, time: i.start ?? "00:00", title: i.title, sub: `Overige · ${techLabel(i.who)}`, href: "/dashboard/agenda" })),
  ].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const offToday = items.filter((i) => i.kind === "off" && i.date <= today && (i.date_to ?? i.date) >= today);

  const matches = (l: Lead) =>
    !q ||
    [l.customer.name, l.customer.postcode, l.customer.city, l.customer.email, l.customer.phone].join(" ").toLowerCase().includes(q);
  const current = GROUPS.find((g) => g.id === group)!;
  const sections = current.statuses
    .map((status) => ({
      status,
      leads: all
        .filter((l) => l.status === status && matches(l))
        // Wat het langst wacht staat bovenaan
        .sort((a, b) => lastActivity(a).localeCompare(lastActivity(b))),
    }))
    .filter((s) => s.leads.length > 0);

  return (
    <AppShell session={session} wide>
      <h1 className="sr-only">Aanvragen</h1>

      {alertList.length > 0 && (
        <ul className="mb-4 space-y-2" aria-label="Let op">
          {alertList.map((a, i) => (
            <li key={a.id + i}>
              <Link
                href={`/dashboard/${a.id}?tab=afspraken`}
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 hover:bg-red-100"
              >
                <span aria-hidden="true" className="mt-0.5 font-bold">!</span>
                <span className="min-w-0">
                  <strong className="block">{a.name}</strong>
                  {a.text}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <nav aria-label="Aanvragen per groep" className="grid grid-cols-3 gap-2 sm:gap-3">
        {GROUPS.map((g) => {
          const on = g.id === group;
          return (
            <Link
              key={g.id}
              href={`/dashboard?filter=${g.id}`}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-24 flex-col justify-between rounded-2xl p-3 ring-1 ring-inset transition-colors duration-150 sm:min-h-28 sm:p-4 ${on ? TONE[g.id].on : TONE[g.id].idle}`}
            >
              <span className="flex items-center justify-between gap-2">
                <StatusIcon name={g.id} className="h-6 w-6" />
                <span className="tabular text-2xl font-semibold sm:text-3xl">{countOf(g.id)}</span>
              </span>
              <span>
                <span className="block font-semibold">{g.label}</span>
                <span className="hidden text-xs opacity-80 sm:block">{g.hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <section aria-labelledby="today" className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="today" className="flex items-center gap-2 text-base font-semibold">
            <StatusIcon name="visit_planned" className="h-5 w-5 text-brand" />
            Vandaag
          </h2>
          {offToday.length > 0 && (
            <p className="text-xs font-medium text-red-700">
              Niet beschikbaar: {offToday.map((i) => techLabel(i.who).replace(" (eigenaar)", "")).join(", ")}
            </p>
          )}
        </div>
        {todays.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Geen afspraken vandaag.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {todays.map((t) => (
              <li key={t.lead.id + t.kind} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                <Link href={`/dashboard/${t.lead.id}?tab=afspraken`} className="flex min-w-0 flex-1 items-start gap-3 hover:text-brand-strong">
                  <span className="tabular w-12 shrink-0 text-base font-semibold">{t.time}</span>
                  <span className="min-w-0 text-sm">
                    <span className="block break-words font-medium">{t.lead.customer.name}</span>
                    <span className="block break-words text-muted">
                      {t.kind} · {t.lead.customer.city} · {techLabel(t.tech)}
                      {t.date < today && " · nog niet afgerond"}
                    </span>
                  </span>
                </Link>
                {t.tech === OWNER && (
                  <Link href={`/technician/${t.lead.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-strong">
                    Afronden
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
        {upcoming && (
          <Link href={upcoming.href} className="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5 hover:bg-brand-soft">
            <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted">Hierna</span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block break-words font-medium">
                {dayShort(upcoming.date)}{upcoming.time !== "00:00" ? ` om ${upcoming.time}` : ""} · {upcoming.title}
              </span>
              <span className="block break-words text-muted">{upcoming.sub}</span>
            </span>
            <span aria-hidden="true" className="text-slate-400">→</span>
          </Link>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <form role="search" action="/dashboard" className="flex w-full gap-2 sm:w-auto">
          <input type="hidden" name="filter" value={group} />
          <label htmlFor="q" className="sr-only">Zoek op naam, postcode of plaats</label>
          <input id="q" name="q" type="search" defaultValue={sp.q ?? ""} placeholder="Zoek naam of plaats" className={`${field} min-w-0 flex-1 sm:w-64 sm:flex-none`} />
          <button type="submit" className={btn.secondary}>Zoeken</button>
        </form>
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <CopyButton value="/intake" label="Link klantformulier" className="min-h-11 rounded-md px-2 font-medium text-brand hover:underline" />
          <a href="/dashboard/export" download className="inline-flex min-h-11 items-center rounded-md px-2 font-medium text-brand hover:underline">
            Excel-export
          </a>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
          {q ? (
            <>
              <p className="font-medium">Geen aanvragen gevonden voor “{q}”.</p>
              <Link href={`/dashboard?filter=${group}`} className={`${btn.secondary} mt-4`}>Zoekopdracht wissen</Link>
            </>
          ) : (
            <p className="text-muted">{group === "open" ? "Geen nieuwe aanvragen. Deel de link van het klantformulier om aanvragen te ontvangen." : "Hier staat nog niets."}</p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {sections.map(({ status, leads }) => (
            <section key={status} aria-labelledby={`g-${status}`}>
              <h2
                id={`g-${status}`}
                className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${STATUS_STYLE[status]}`}
              >
                <StatusIcon name={status} className="h-4 w-4" />
                {STATUS_LABEL[status]}
                <span className="tabular opacity-70">{leads.length}</span>
              </h2>
              <ul className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                {leads.map((l, i) => {
                  const days = daysSince(lastActivity(l));
                  const stale = isOpen(l) && OWNER_TURN.has(l.status) && days >= STALE_DAYS;
                  const special = nextAction(l) !== NEXT_ACTION[l.status] ? nextAction(l) : null;
                  const pref = l.status === "new" && l.preferred?.first;
                  return (
                    <li key={l.id} className={i > 0 ? "border-t border-line" : ""}>
                      <Link
                        href={`/dashboard/${l.id}`}
                        className={`flex items-center gap-3 border-l-4 px-4 py-3.5 transition-colors hover:bg-slate-50 ${STATUS_BAR[status]} ${isOpen(l) ? "" : "opacity-80"}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block break-words font-semibold">{l.customer.name}</span>
                          <span className="block break-words text-sm text-muted">
                            {l.customer.city} · {dateNl(l.created_at)}
                            {pref && ` · gewenst ${dayShort(pref.date)}, ${PART_LABEL[pref.part]}`}
                          </span>
                          {special && (
                            <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-200">
                              {special}
                            </span>
                          )}
                        </span>
                        {stale && (
                          <span title={`${days} dagen geen activiteit`} className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-200">
                            {days} dgn
                          </span>
                        )}
                        <span className="tabular hidden shrink-0 text-sm text-muted sm:block">{formatRange(l.estimate)}</span>
                        <span aria-hidden="true" className="shrink-0 text-slate-400">→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
