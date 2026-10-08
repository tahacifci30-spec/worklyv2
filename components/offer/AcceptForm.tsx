"use client";

import { useState } from "react";
import { PART_LABEL, addDays, dayLong } from "@/lib/dates";
import type { DayChoice, DayPart } from "@/lib/types";
import { MonthPicker } from "../MonthPicker";
import { SubmitButton } from "../SubmitButton";

/** Akkoord geven op de offerte, met optioneel een gewenst moment voor de installatie. */
export function AcceptForm({
  accept,
  reject,
  companyName,
  today,
}: {
  accept: (form: FormData) => Promise<void>;
  reject: () => Promise<void>;
  companyName: string;
  today: string;
}) {
  const [pref, setPref] = useState<DayChoice | undefined>();
  return (
    <div className="rounded-xl bg-brand-soft p-4">
      <p className="font-medium">Akkoord met deze offerte?</p>
      <p className="mt-1 text-sm text-slate-700">
        Door akkoord te gaan geeft u opdracht. {companyName} plant daarna de installatie met u in.
      </p>

      <form action={accept} className="mt-4 space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">Wanneer mag de installatie plaatsvinden?</p>
          <MonthPicker
            label="Gewenste dag voor de installatie"
            value={pref?.date}
            today={today}
            min={addDays(today, 3)}
            onSelect={(d) => setPref({ date: d, part: pref?.part ?? "any" })}
          />
          {pref && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Dagdeel">
                {(["any", "morning", "afternoon"] as DayPart[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={pref.part === p}
                    onClick={() => setPref({ ...pref, part: p })}
                    className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                      pref.part === p ? "border-brand bg-white text-brand-strong ring-2 ring-brand" : "border-slate-300 bg-white hover:border-brand"
                    }`}
                  >
                    {p === "any" ? "Maakt niet uit" : p === "morning" ? "Ochtend" : "Middag"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Gekozen: <strong className="first-letter:uppercase">{dayLong(pref.date)}</strong>, {PART_LABEL[pref.part]}.{" "}
                <button type="button" onClick={() => setPref(undefined)} className="font-medium text-brand-strong underline">
                  Geen voorkeur
                </button>
              </p>
            </div>
          )}
        </div>
        {pref && (
          <>
            <input type="hidden" name="pref_date" value={pref.date} />
            <input type="hidden" name="pref_part" value={pref.part} />
          </>
        )}
        <SubmitButton pendingText="Verwerken…">Akkoord, plan de installatie</SubmitButton>
      </form>

      <form action={reject} className="mt-3">
        <SubmitButton variant="secondary" pendingText="Verwerken…">
          Niet akkoord
        </SubmitButton>
      </form>
    </div>
  );
}
