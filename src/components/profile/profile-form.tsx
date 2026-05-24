"use client";

import { useActionState, useId, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Select, SelectGroup, SelectItem, SelectSeparator } from "@/components/ui/select";
import { AvatarPlaceholder } from "./avatar-placeholder";
import {
  KNOWN_FOR_MAX,
  MAX_JOINING_YEAR,
  MIN_JOINING_YEAR,
  ONE_LINER_MAX,
  PHOTO_ALLOWED_TYPES,
  PHOTO_MAX_BYTES,
  PHOTO_TARGET_MAX_BYTES,
  PHOTO_TARGET_MAX_DIMENSION,
  PROFILE_PHOTOS_BUCKET,
  STATES_OF_INDIA,
} from "@/lib/constants";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { saveProfile, type SaveProfileState } from "@/app/onboarding/actions";

type Branch = {
  id: string;
  name: string;
  shortName: string;
  level: "UG" | "PG";
  degree: string;
  specialization: string | null;
  isActive: boolean;
};

function formatBranchLabel(b: Branch) {
  const base = `${b.degree} — ${b.name}`;
  return b.specialization ? `${base} (${b.specialization})` : base;
}

export type ProfileInitial = {
  displayName: string;
  oneLiner: string;
  knownFor: string;
  branchId: string;
  joiningYear: number;
  graduatingYear: number;
  currentState: string | null;
  currentCity: string | null;
  socials: { instagram?: string; linkedin?: string; github?: string; x?: string };
  photoPath: string | null;
  photoPublicUrl: string | null;
};

const initialState: SaveProfileState = { status: "idle" };

const YEARS = Array.from({ length: MAX_JOINING_YEAR - MIN_JOINING_YEAR + 1 }, (_, i) => MIN_JOINING_YEAR + i);
const GRAD_YEARS = Array.from(
  { length: MAX_JOINING_YEAR + 7 - (MIN_JOINING_YEAR + 3) + 1 },
  (_, i) => MIN_JOINING_YEAR + 3 + i,
);

export function ProfileForm({
  branches,
  initial,
  userId,
  /** Stable seed for the gradient avatar — should be profile.id when editing
   * so this page matches batch view + profile detail. Defaults to userId
   * during onboarding when no profile row exists yet. */
  avatarSeed,
  mode,
}: {
  branches: Branch[];
  initial: ProfileInitial | null;
  userId: string;
  avatarSeed?: string;
  mode: "create" | "edit";
}) {
  const [state, formAction, isPending] = useActionState(saveProfile, initialState);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};

  const id = useId();
  const [photoPath, setPhotoPath] = useState<string | null>(initial?.photoPath ?? null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photoPublicUrl ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [oneLiner, setOneLiner] = useState(initial?.oneLiner ?? "");
  const [knownFor, setKnownFor] = useState(initial?.knownFor ?? "");
  const [joiningYear, setJoiningYear] = useState<string>(String(initial?.joiningYear ?? 2018));
  const [gradYear, setGradYear] = useState<string>(String(initial?.graduatingYear ?? 2022));
  const [branchId, setBranchId] = useState<string>(initial?.branchId ?? "");
  const [currentState, setCurrentState] = useState<string>(initial?.currentState ?? "");

  const grouped = useMemo(() => {
    const ug: Branch[] = [];
    const pg: Branch[] = [];
    const legacy: Branch[] = [];
    for (const b of branches) {
      if (!b.isActive) legacy.push(b);
      else if (b.level === "UG") ug.push(b);
      else pg.push(b);
    }
    return { ug, pg, legacy };
  }, [branches]);

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    if (!(PHOTO_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      setPhotoError("Only JPEG, PNG, or WebP");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoError("File is larger than 5 MB");
      return;
    }

    setPhotoBusy(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: PHOTO_TARGET_MAX_BYTES / (1024 * 1024),
        maxWidthOrHeight: PHOTO_TARGET_MAX_DIMENSION,
        useWebWorker: true,
        fileType: "image/webp",
      });

      const supabase = getSupabaseBrowser();
      const path = `${userId}/avatar-${Date.now()}.webp`;
      const { error } = await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .upload(path, compressed, {
          contentType: "image/webp",
          upsert: true,
          cacheControl: "3600",
        });

      if (error) {
        setPhotoError(error.message);
        return;
      }

      const { data } = supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path);
      setPhotoPath(path);
      setPhotoUrl(data.publicUrl);
    } catch (err) {
      console.error(err);
      setPhotoError("Couldn't process that photo. Try a different one.");
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-7">
      {/* Photo — squared per the design (yearbook portraits, not avatars) */}
      <div className="flex items-center gap-6">
        <div className="h-28 w-28 overflow-hidden rounded-md border border-ink-200 bg-cream-200">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <AvatarPlaceholder
              seed={avatarSeed ?? userId}
              name={initial?.displayName ?? "you"}
              size="md"
            />
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor={`${id}-photo`}>Profile photo</Label>
          <input
            id={`${id}-photo`}
            type="file"
            accept={PHOTO_ALLOWED_TYPES.join(",")}
            onChange={onPhotoChange}
            disabled={photoBusy}
            className="mt-2 block w-full text-sm text-ink-700 file:mr-4 file:rounded-md file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:font-sans file:text-cream-100 hover:file:bg-ink-700 disabled:opacity-50"
          />
          {photoBusy ? <p className="mt-1 font-mono text-xs text-ink-500">Compressing…</p> : null}
          {photoError ? <FieldError message={photoError} /> : null}
          <p className="mt-1 font-mono text-xs text-ink-300">Square works best. Up to 5 MB.</p>
        </div>
      </div>
      <input type="hidden" name="photoPath" value={photoPath ?? ""} />

      <Label htmlFor={`${id}-displayName`}>Name</Label>
      <Input
        id={`${id}-displayName`}
        name="displayName"
        required
        defaultValue={initial?.displayName ?? ""}
        placeholder="As you'd like to appear"
      />
      <FieldError message={errors.displayName} />

      <Label htmlFor={`${id}-oneLiner`} hint={`${oneLiner.length}/${ONE_LINER_MAX}`}>
        One-liner
      </Label>
      <Textarea
        id={`${id}-oneLiner`}
        name="oneLiner"
        maxLength={ONE_LINER_MAX}
        value={oneLiner}
        onChange={(e) => setOneLiner(e.target.value)}
        placeholder="Something you'd say to someone who's meeting you for the first time."
      />
      <FieldError message={errors.oneLiner} />

      <Label htmlFor={`${id}-knownFor`} hint={`${knownFor.length}/${KNOWN_FOR_MAX}`}>
        Known for
      </Label>
      <Input
        id={`${id}-knownFor`}
        name="knownFor"
        maxLength={KNOWN_FOR_MAX}
        value={knownFor}
        onChange={(e) => setKnownFor(e.target.value)}
        placeholder="A short, honest line. Don't try too hard."
      />
      <FieldError message={errors.knownFor} />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-branchId`}>Program</Label>
        <Select
          id={`${id}-branchId`}
          name="branchId"
          value={branchId}
          onValueChange={setBranchId}
          required
          placeholder="Pick your program"
        >
          {grouped.ug.length > 0 ? (
            <SelectGroup label="Undergraduate">
              {grouped.ug.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {formatBranchLabel(b)}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : null}
          {grouped.pg.length > 0 ? (
            <>
              {grouped.ug.length > 0 ? <SelectSeparator /> : null}
              <SelectGroup label="Postgraduate">
                {grouped.pg.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {formatBranchLabel(b)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : null}
          {grouped.legacy.length > 0 ? (
            <>
              <SelectSeparator />
              <SelectGroup label="Older programs">
                {grouped.legacy.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {formatBranchLabel(b)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : null}
        </Select>
        <FieldError message={errors.branchId} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-joiningYear`}>Joining year</Label>
          <Select
            id={`${id}-joiningYear`}
            name="joiningYear"
            value={joiningYear}
            onValueChange={setJoiningYear}
          >
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </Select>
          <FieldError message={errors.joiningYear} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-gradYear`}>Graduating year</Label>
          <Select
            id={`${id}-gradYear`}
            name="graduatingYear"
            value={gradYear}
            onValueChange={setGradYear}
          >
            {GRAD_YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </Select>
          <FieldError message={errors.graduatingYear} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-currentState`}>Currently in — state</Label>
          <Select
            id={`${id}-currentState`}
            name="currentState"
            value={currentState}
            onValueChange={setCurrentState}
            placeholder="Optional"
          >
            {STATES_OF_INDIA.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-currentCity`}>Currently in — city</Label>
          <Input
            id={`${id}-currentCity`}
            name="currentCity"
            defaultValue={initial?.currentCity ?? ""}
            placeholder="Optional"
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-ink-200/60 p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-widest text-ink-500">
          Socials (optional)
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="socials.instagram"
            placeholder="instagram handle"
            defaultValue={initial?.socials.instagram ?? ""}
          />
          <Input
            name="socials.linkedin"
            placeholder="linkedin (username or full URL)"
            defaultValue={initial?.socials.linkedin ?? ""}
          />
          <Input
            name="socials.github"
            placeholder="github handle"
            defaultValue={initial?.socials.github ?? ""}
          />
          <Input
            name="socials.x"
            placeholder="x / twitter handle"
            defaultValue={initial?.socials.x ?? ""}
          />
        </div>
      </fieldset>

      {state.status === "error" ? (
        <div className="rounded-md border border-red-700/30 bg-red-700/5 p-3 font-mono text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      {state.status === "saved" && mode === "edit" ? (
        <div className="rounded-md border border-ink-200 bg-cream-200 p-3 font-mono text-sm text-ink-700">
          Saved.
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending || photoBusy}>
          {isPending ? "Saving…" : mode === "create" ? "Publish my profile" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
