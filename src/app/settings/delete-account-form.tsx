"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { deleteAccount, type DeleteState } from "./actions";

const initial: DeleteState = { status: "idle" };

export function DeleteAccountForm({ email }: { email: string }) {
  const [confirm, setConfirm] = useState("");
  const [state, action, isPending] = useActionState(deleteAccount, initial);
  const canSubmit = confirm.trim().toLowerCase() === email.toLowerCase();

  return (
    <form action={action} className="flex flex-col gap-3">
      <Label htmlFor="confirm-email" hint="must match exactly">
        Type your email to confirm
      </Label>
      <Input
        id="confirm-email"
        name="confirmEmail"
        type="email"
        autoComplete="off"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder={email}
      />
      {state.status === "error" ? <FieldError message={state.message} /> : null}
      <div>
        <Button variant="danger" type="submit" disabled={!canSubmit || isPending}>
          {isPending ? "Deleting…" : "Delete my account"}
        </Button>
      </div>
    </form>
  );
}
