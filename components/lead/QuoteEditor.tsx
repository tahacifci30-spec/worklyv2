"use client";

import { useState } from "react";
import type { FormState } from "@/app/actions";
import { formatEur, quoteTotal } from "@/lib/pricing/engine";
import type { QuoteItem } from "@/lib/types";
import { ActionForm } from "../ActionForm";
import { SubmitButton } from "../SubmitButton";
import { btn, field } from "../ui";

const COPY = {
  offerte: {
    approve: "Goedkeuren en versturen",
    hint: "Controleer de regels hierboven. Sla eerst eventuele wijzigingen op. Er wordt niets verstuurd zonder uw goedkeuring.",
    question: (total: string, to: string) => `Offerte van ${total} versturen naar ${to}?`,
    note: "Dit kan daarna niet meer worden aangepast.",
    yes: "Ja, versturen",
  },
  factuur: {
    approve: "Factuur versturen",
    hint: "Controleer de regels hierboven, ook het meerwerk van de monteur. Sla eerst eventuele wijzigingen op.",
    question: (total: string, to: string) => `Factuur van ${total} versturen naar ${to}?`,
    note: "Er wordt een factuurnummer toegekend. Daarna kan de factuur niet meer worden aangepast.",
    yes: "Ja, factuur versturen",
  },
} as const;

/** Bewerkbare regels voor een offerte of een factuur, met bedrag en totaal. */
export function QuoteEditor({
  kind = "offerte",
  initial,
  editable,
  save,
  approve,
  recipient,
}: {
  kind?: "offerte" | "factuur";
  initial: QuoteItem[];
  editable: boolean;
  save: (state: FormState, form: FormData) => Promise<FormState>;
  /** Alleen meegegeven wanneer het document ter controle ligt. */
  approve?: () => Promise<void>;
  recipient: string;
}) {
  const copy = COPY[kind];
  const [items, setItems] = useState(initial.map((i) => ({ ...i, amount: String(i.amount) })));
  const [confirming, setConfirming] = useState(false);

  const total = quoteTotal(items.map((i) => ({ ...i, amount: Number(i.amount.replace(",", ".")) || 0 })));
  const snapshot = (list: { label: string; amount: string | number }[]) =>
    JSON.stringify(list.map((i) => [i.label, String(i.amount)]));
  const dirty = snapshot(items) !== snapshot(initial);
  const update = (idx: number, patch: Partial<{ label: string; amount: string }>) =>
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div>
      <ActionForm action={save}>
        {({ state, pending }) => (
          <>
            <ul className="space-y-3">
              {items.map((it, i) => (
                <li key={it.id} className="grid grid-cols-[minmax(0,1fr)_6.5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_7.5rem_auto]">
                  <input
                    name="label"
                    aria-label={`Omschrijving regel ${i + 1}`}
                    value={it.label}
                    readOnly={!editable}
                    onChange={(e) => update(i, { label: e.target.value })}
                    className={`${field} ${editable ? "" : "border-transparent bg-transparent px-0"}`}
                  />
                  <input
                    name="amount"
                    aria-label={`Bedrag regel ${i + 1} in euro`}
                    inputMode="decimal"
                    value={editable ? it.amount : formatEur(Number(it.amount))}
                    readOnly={!editable}
                    onChange={(e) => update(i, { amount: e.target.value })}
                    className={`${field} tabular text-right ${editable ? "" : "border-transparent bg-transparent px-0"}`}
                  />
                  {editable ? (
                    <button
                      type="button"
                      aria-label={`Regel ${i + 1} verwijderen`}
                      onClick={() => setItems((l) => l.filter((_, j) => j !== i))}
                      className="grid h-11 w-11 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  ) : (
                    <span />
                  )}
                </li>
              ))}
            </ul>

            {editable && (
              <button
                type="button"
                onClick={() => setItems((l) => [...l, { id: `n${l.length}${Date.now()}`, label: "", amount: "0" }])}
                className="mt-3 min-h-11 text-sm font-semibold text-brand hover:underline"
              >
                + Regel toevoegen
              </button>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="font-semibold">Totaal incl. btw</span>
              <span className="tabular text-2xl font-semibold">{formatEur(total)}</span>
            </div>

            {state?.error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {state.error}
              </p>
            )}
            {state?.ok && !dirty && (
              <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                Wijzigingen opgeslagen.
              </p>
            )}
            {editable && (
              <div className="mt-4">
                <SubmitButton variant="secondary" pending={pending} pendingText="Opslaan…">
                  Wijzigingen opslaan
                </SubmitButton>
              </div>
            )}
          </>
        )}
      </ActionForm>

      {approve && (
        <div className="mt-6 rounded-xl bg-brand-soft p-4">
          {!confirming ? (
            <>
              <p className="text-sm text-slate-700">{copy.hint}</p>
              <button
                type="button"
                disabled={dirty}
                onClick={() => setConfirming(true)}
                className={`${btn.primary} mt-3`}
              >
                {copy.approve}
              </button>
              {dirty && <p className="mt-2 text-sm text-amber-900">Sla uw wijzigingen eerst op voordat u verstuurt.</p>}
            </>
          ) : (
            <form action={approve}>
              <p className="font-medium">{copy.question(formatEur(total), recipient)}</p>
              <p className="mt-1 text-sm text-slate-700">{copy.note}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <SubmitButton pendingText="Versturen…">{copy.yes}</SubmitButton>
                <button type="button" onClick={() => setConfirming(false)} className={btn.secondary}>
                  Annuleren
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
