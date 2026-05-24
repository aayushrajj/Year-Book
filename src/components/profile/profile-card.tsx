import Image from "next/image";
import Link from "next/link";
import type { BatchCard } from "@/lib/profiles";
import { urls } from "@/lib/routes";
import { AvatarPlaceholder } from "./avatar-placeholder";

export function ProfileCard({
  card,
  collegeSlug,
  joiningYear,
}: {
  card: BatchCard;
  collegeSlug: string;
  joiningYear: number;
}) {
  return (
    <Link
      href={urls.profile(collegeSlug, joiningYear, card.username)}
      className="group flex flex-col gap-3"
      aria-label={`Open ${card.displayName}'s profile`}
    >
      <div className="aspect-square overflow-hidden rounded-md border border-ink-200 bg-cream-200 transition-transform duration-300 ease-quiet group-hover:scale-[1.01]">
        {card.photoUrl ? (
          <Image
            src={card.photoUrl}
            alt=""
            width={500}
            height={500}
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
          />
        ) : (
          <AvatarPlaceholder seed={card.id} name={card.displayName} />
        )}
      </div>

      <div>
        <p className="font-serif text-lg leading-tight tracking-tightish text-ink-900">
          {card.displayName}
          {card.isOwner ? (
            <span className="ml-2 align-middle font-mono text-[10px] uppercase tracking-widest text-ink-500">
              you
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 font-mono text-xs text-ink-500">{card.branch.shortName}</p>
        {card.oneLiner ? (
          <p className="mt-2 line-clamp-2 text-sm text-ink-700">{card.oneLiner}</p>
        ) : null}
      </div>
    </Link>
  );
}
