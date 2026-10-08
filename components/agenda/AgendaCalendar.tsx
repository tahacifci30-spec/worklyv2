"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { reassignAppointment, removeAgendaItem, saveAgendaEntry, setUnavailable } from "@/app/actions";
import { dayLong, dayShort, isWeekend, parseDay } from "@/lib/dates";
import { MonthPicker } from "../MonthPicker";
import { TimeSelect } from "../TimeSelect";
import { field } from "../ui";

export type DayBooking = {
  key: string;
  leadId: string;
  kind: "visit" | "install";
  label: string;
  time: string;
  name: string;
  place: string;
  tech: string;
  techRaw: string;
  done: boolean;
  href: string;
  finishHref?: string;
  /** Collega's die deze afspraak kunnen overnemen, als de monteur niet beschikbaar is */
  alternatives: { name: string; label: string }[];
  needsCover: boolean;
};
export type DayItem = {
  id: string;
  kind: "item" | "off";
  title: string;
  description?: string;
  start?: string;
  end?: string;
  date: string;
  date_to?: string;
  who: string;
  whoLabel: string;
  short: string;
  canEdit: boolean;
};
export type DayWish = { id: string; name: string; part: string; href: string };
export type DayTech = { tech: string; label: string; text: string; works: boolean; offId?: string };
export type DayData = { date: string; bookings: DayBooking[]; items: DayItem[]; wishes: DayWish[]; techs: DayTech[] };

type FormView = { item?: DayItem; off?: boolean } | null;

const REASONS = ["Ziek", "Vrij", "Verlof", "Anders"];
const offText = (i: DayItem) => `${i.short} ${i.title === "Ziek" ? "ziek" : i.title === "Niet beschikbaar" ? "niet beschikbaar" : i.title.toLowerCase()}`;

/**
 * Maandkalender met naast de kalender een kaart voor de gekozen dag en daaronder een kaart om iets toe te voegen.
 * De kalender blijft altijd zichtbaar.
 */
export function AgendaCalendar({
  cells,
  month,
  today,
  days,
  owner,
  me,
  team,
}: {
  cells: string[];
  month: string;
  today: string;
  days: Record<string, DayData>;
  owner: boolean;
  me: string;
  team: { name: string; label: string }[];
}) {
  const [selected, setSelected] = useState(today.startsWith(month) ? today : `${month}-01`);
  const [form, setForm] = useState<FormView>(null);
  const data = days[selected] ?? days[cells[0]];

  const pick = (day: string) => {
    setSelected(day);
    setForm(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
      <section aria-label="Kalender" className="min-w-0">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
          {["ma", "di", "wo", "do", "vr", "za", "zo"].map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {cells.map((day) => {
            const d = days[day];
            const inMonth = day.startsWith(month);
            const offs = d.items.filter((i) => i.kind === "off");
            const others = d.items.filter((i) => i.kind === "item");
            const chips = [
              ...offs.map((i) => ({ k: i.id, text: offText(i), tone: "bg-red-100 text-red-800", done: false })),
              ...d.bookings.map((b) => ({ k: b.key, text: `${b.time} ${b.name}`, tone: b.kind === "visit" ? "bg-teal-100 text-teal-900" : "bg-indigo-100 text-indigo-900", done: b.done })),
              ...others.map((i) => ({ k: i.id, text: `${i.start ?? ""} ${i.title}`.trim(), tone: "bg-slate-200 text-slate-800", done: false })),
            ];
            const count = d.bookings.length + others.length;
            const isSel = day === selected;
            return (
              <button
                key={day}
                type="button"
                onClick={() => pick(day)}
                aria-pressed={isSel}
                aria-label={`${dayLong(day)}: ${count === 0 ? "geen afspraken" : `${count} afspraken`}${offs.length ? `, ${offs.map(offText).join(", ")}` : ""}${d.wishes.length ? `, ${d.wishes.length} voorkeur van klant` : ""}`}
                className={`flex min-h-14 flex-col items-stretch gap-1 rounded-lg border p-1 text-left text-sm transition-colors hover:border-brand sm:min-h-28 sm:p-1.5 ${
                  isSel ? "border-brand bg-brand-soft ring-1 ring-brand" : day === today ? "border-brand/50 bg-surface" : isWeekend(day) ? "border-line bg-slate-100/70" : "border-line bg-surface"
                } ${inMonth ? "" : "opacity-40"}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center self-center rounded-full text-xs font-semibold sm:self-start ${day === today ? "bg-brand text-white" : ""}`}>
                  {parseDay(day).getDate()}
                </span>
                <span className="hidden min-w-0 flex-1 flex-col gap-0.5 sm:flex" aria-hidden="true">
                  {chips.slice(0, 3).map((c) => (
                    <span key={c.k} className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] font-medium leading-tight ${c.tone}`}>
                      {c.done && <span className="text-emerald-700">✓</span>}
                      <span className="truncate">{c.text}</span>
                    </span>
                  ))}
                  {chips.length > 3 && <span className="px-1 text-[11px] font-medium text-muted">+ {chips.length - 3} meer</span>}
                  {d.wishes.length > 0 && <span className="truncate rounded border border-amber-500 px-1 py-0.5 text-[11px] font-medium leading-tight text-amber-900">{d.wishes.length}× gewenst</span>}
                </span>
                <span className="flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden="true">
                  {d.bookings.slice(0, 3).map((b) => (
                    <span key={b.key} className={`h-1.5 w-1.5 rounded-full ${b.kind === "visit" ? "bg-teal-600" : "bg-indigo-600"}`} />
                  ))}
                  {others.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />}
                  {offs.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-600" />}
                  {d.wishes.length > 0 && <span className="h-1.5 w-1.5 rounded-full border border-amber-600 bg-white" />}
                </span>
              </button>
            );
          })}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-muted">
          <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-600" aria-hidden="true" /> Bezoek</li>
          <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-600" aria-hidden="true" /> Installatie</li>
          <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-500" aria-hidden="true" /> Overige</li>
          {owner && <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600" aria-hidden="true" /> Niet beschikbaar</li>}
          {owner && <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-amber-600" aria-hidden="true" /> Gewenst door klant</li>}
        </ul>
      </section>

      <div className="min-w-0 space-y-4 lg:sticky lg:top-20">
        <section aria-live="polite" className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <h2 className="text-base font-semibold first-letter:uppercase">{dayLong(data.date)}</h2>
          <DayBody
            data={data}
            owner={owner}
            past={data.date < today}
            onEdit={(item) => setForm({ item })}
            onOff={() => setForm({ off: true })}
          />
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm" aria-label="Toevoegen aan de agenda">
          {form || data.date < today ? (
            form ? (
              <EntryForm
                key={form.item?.id ?? (form.off ? "off" : "new") + data.date}
                day={data.date}
                today={today}
                item={form.item}
                off={!!form.off}
                owner={owner}
                me={me}
                team={team}
                onBack={() => setForm(null)}
              />
            ) : (
              <p className="text-sm text-muted">Op een dag in het verleden kunt u niets meer toevoegen.</p>
            )
          ) : (
            <button
              type="button"
              onClick={() => setForm({})}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-brand-strong hover:border-brand hover:bg-brand-soft"
            >
              <span className="text-xl leading-none" aria-hidden="true">+</span> Afspraak toevoegen
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

function DayBody({
  data,
  owner,
  past,
  onEdit,
  onOff,
}: {
  data: DayData;
  owner: boolean;
  past: boolean;
  onEdit: (i: DayItem) => void;
  onOff: () => void;
}) {
  const [pending, start] = useTransition();
  const others = data.items.filter((i) => i.kind === "item");
  const offs = data.items.filter((i) => i.kind === "off");
  const empty = data.bookings.length + others.length + offs.length === 0;

  return (
    <div className="mt-3">
      {empty && <p className="text-sm text-muted">Geen afspraken op deze dag.</p>}

      {(data.bookings.length > 0 || others.length > 0) && (
        <ul className="divide-y divide-line">
          {data.bookings.map((b) => (
            <li key={b.key} className="py-2.5">
              <Link href={b.href} className="flex items-start gap-3 hover:text-brand-strong">
                <span className="tabular w-12 shrink-0 font-semibold">{b.time}</span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="flex items-center gap-1.5 font-medium">
                    {b.done && (
                      <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true">
                        <circle cx="10" cy="10" r="10" fill="currentColor" />
                        <path d="m5.5 10.500 3 3 6-6.500" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span className="break-words">{b.name}</span>
                    {b.done && <span className="sr-only">(afgerond)</span>}
                  </span>
                  <span className="block break-words text-muted">{b.label} · {b.place} · {b.tech}</span>
                </span>
              </Link>
              {b.finishHref && (
                <Link href={b.finishHref} className="ml-[3.75rem] mt-1 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white">
                  {b.kind === "install" ? "Installatie afronden" : "Bezoek afronden"}
                </Link>
              )}
              {owner && b.needsCover && (
                <div className="ml-[3.75rem] mt-2 rounded-lg bg-red-50 p-2.5 text-sm text-red-900">
                  <p className="font-medium">{b.tech} is niet beschikbaar.</p>
                  {b.alternatives.length === 0 ? (
                    <p className="mt-1">Niemand anders heeft op dat moment tijd. Kies een ander moment bij de aanvraag.</p>
                  ) : (
                    <form
                      className="mt-2 flex flex-wrap items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const tech = String(new FormData(e.currentTarget).get("tech"));
                        start(async () => reassignAppointment(b.leadId, b.kind, tech));
                      }}
                    >
                      <label className="sr-only" htmlFor={`re-${b.key}`}>Toewijzen aan</label>
                      <select id={`re-${b.key}`} name="tech" className="min-h-11 rounded-lg border border-slate-300 bg-white px-2 text-sm text-foreground">
                        {b.alternatives.map((a) => <option key={a.name} value={a.name}>{a.label}</option>)}
                      </select>
                      <button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50">
                        {pending ? "Bezig…" : "Aan collega toewijzen"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </li>
          ))}
          {others.map((i) => (
            <li key={i.id}>
              <button type="button" disabled={!i.canEdit} onClick={() => onEdit(i)} className="flex w-full items-start gap-3 py-2.5 text-left enabled:hover:text-brand-strong">
                <span className="tabular w-12 shrink-0 font-semibold">{i.start ?? "Hele dag"}</span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block break-words font-medium">{i.title}</span>
                  <span className="block break-words text-muted">
                    Overige{i.start && i.end ? ` tot ${i.end}` : ""}{i.date_to ? ` · ${dayShort(i.date)} t/m ${dayShort(i.date_to)}` : ""} · {i.whoLabel}
                  </span>
                  {i.description && <span className="mt-0.5 block break-words text-slate-700">{i.description}</span>}
                </span>
                {i.canEdit && <span className="shrink-0 text-xs font-medium text-brand-strong">Wijzigen</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {data.wishes.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Gewenst door klanten</p>
          <ul className="divide-y divide-line text-sm">
            {data.wishes.map((w) => (
              <li key={w.id}>
                <Link href={w.href} className="block py-2.5 hover:text-brand-strong">
                  <span className="block break-words font-medium">{w.name}</span>
                  <span className="text-muted">{w.part}, nog niet ingepland. Plan in →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {owner && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Beschikbaarheid</p>
          <ul className="divide-y divide-line text-sm">
            {data.techs.map((t) => (
              <li key={t.tech} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="block font-medium">{t.label}</span>
                  <span className={`block ${t.offId ? "text-red-700" : "text-muted"}`}>{t.text}</span>
                </span>
                {!past && (
                  <span className="flex gap-1.5">
                    {t.offId ? (
                      <button type="button" disabled={pending} onClick={() => start(async () => setUnavailable(t.tech, data.date, "", t.offId))} className="min-h-11 rounded-lg border border-line px-3 text-sm font-medium hover:bg-slate-50">
                        Weer beschikbaar
                      </button>
                    ) : (
                      t.works && (
                        <>
                          <button type="button" disabled={pending} onClick={() => start(async () => setUnavailable(t.tech, data.date, "Niet beschikbaar"))} className="min-h-11 rounded-lg border border-line px-3 text-sm font-medium hover:bg-slate-50">
                            Niet beschikbaar
                          </button>
                          <button type="button" disabled={pending} onClick={() => start(async () => setUnavailable(t.tech, data.date, "Ziek"))} className="min-h-11 rounded-lg border border-line px-3 text-sm font-medium hover:bg-red-50 hover:text-red-800">
                            Ziek
                          </button>
                        </>
                      )
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {!past && (
            <button type="button" onClick={onOff} className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-brand-strong hover:underline">
              Meerdere dagen afmelden
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EntryForm({
  day,
  today,
  item,
  off,
  owner,
  me,
  team,
  onBack,
}: {
  day: string;
  today: string;
  item?: DayItem;
  off: boolean;
  owner: boolean;
  me: string;
  team: { name: string; label: string }[];
  onBack: () => void;
}) {
  const [date, setDate] = useState(item?.date ?? day);
  const [dateTo, setDateTo] = useState<string | undefined>(item?.date_to);
  const [pick, setPick] = useState<"date" | "to" | null>(null);
  const [whole, setWhole] = useState(item ? !item.start : off);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const multi = !!dateTo && dateTo > date;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveAgendaEntry(undefined, data);
      if (res?.ok) onBack();
      else setError(res?.error ?? "Opslaan is niet gelukt.");
    });
  };
  const remove = () =>
    start(async () => {
      if (item) await removeAgendaItem(item.id);
      onBack();
    });

  return (
    <form onSubmit={submit} method="post" className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="kind" value={off ? "off" : "item"} />
      <input type="hidden" name="date" value={date} />
      {dateTo && <input type="hidden" name="date_to" value={dateTo} />}
      <p className="text-sm font-semibold">{item ? "Afspraak wijzigen" : off ? "Meerdere dagen afmelden" : "Nieuwe afspraak"}</p>

      {off ? (
        <div>
          <label htmlFor="ae-reason" className="mb-1.5 block text-sm font-medium">Reden</label>
          <select id="ae-reason" name="title" className={field} defaultValue={item?.title ?? "Vrij"}>
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="ae-title" className="mb-1.5 block text-sm font-medium">Titel</label>
          <input id="ae-title" name="title" required maxLength={80} defaultValue={item?.title} className={field} placeholder="Bijvoorbeeld: overleg leverancier" />
        </div>
      )}

      {owner && (
        <div>
          <label htmlFor="ae-who" className="mb-1.5 block text-sm font-medium">Voor wie</label>
          <select id="ae-who" name="who" className={field} defaultValue={item?.who ?? (off ? team.find((t) => t.name !== "Eigenaar")?.name : "Eigenaar")}>
            {team.map((t) => <option key={t.name} value={t.name}>{t.label}</option>)}
          </select>
        </div>
      )}
      {!owner && <input type="hidden" name="who" value={me} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-sm font-medium">Van</p>
          <button type="button" onClick={() => setPick(pick === "date" ? null : "date")} aria-expanded={pick === "date"} className={`${field} text-left`}>
            {dayShort(date)}
          </button>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium">Tot en met</p>
          <button type="button" onClick={() => setPick(pick === "to" ? null : "to")} aria-expanded={pick === "to"} className={`${field} text-left`}>
            {dateTo && dateTo > date ? dayShort(dateTo) : "Alleen deze dag"}
          </button>
        </div>
      </div>
      {pick === "date" && (
        <MonthPicker label="Datum" value={date} today={today} min={item ? "2000-01-01" : today} weekends onSelect={(d) => { setDate(d); if (dateTo && dateTo < d) setDateTo(undefined); setPick(null); }} />
      )}
      {pick === "to" && (
        <MonthPicker label="Tot en met" value={dateTo} today={today} min={date} weekends onSelect={(d) => { setDateTo(d === date ? undefined : d); setPick(null); }} />
      )}

      {!off && !multi && (
        <>
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="whole_day" checked={whole} onChange={(e) => setWhole(e.target.checked)} className="h-5 w-5" />
            Hele dag
          </label>
          {!whole && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ae-start" className="mb-1.5 block text-sm font-medium">Tijd van</label>
                <TimeSelect id="ae-start" name="start" defaultValue={item?.start} />
              </div>
              <div>
                <label htmlFor="ae-end" className="mb-1.5 block text-sm font-medium">Tijd tot</label>
                <TimeSelect id="ae-end" name="end" defaultValue={item?.end} />
              </div>
            </div>
          )}
        </>
      )}
      {!off && multi && <p className="text-sm text-muted">Een afspraak over meerdere dagen duurt de hele dag.</p>}
      {!off && (
        <div>
          <label htmlFor="ae-desc" className="mb-1.5 block text-sm font-medium">Beschrijving</label>
          <textarea id="ae-desc" name="description" rows={3} maxLength={500} defaultValue={item?.description} className={field} />
        </div>
      )}
      {off && <input type="hidden" name="whole_day" value="on" />}

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50">
          {pending ? "Opslaan…" : item ? "Opslaan" : off ? "Afmelden" : "Toevoegen"}
        </button>
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 text-sm font-semibold hover:bg-slate-50">
          Annuleren
        </button>
        {item && (
          <button type="button" onClick={remove} disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-red-700 hover:bg-red-50">
            Verwijderen
          </button>
        )}
      </div>
    </form>
  );
}
