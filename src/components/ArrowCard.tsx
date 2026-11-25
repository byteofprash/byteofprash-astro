import { formatDate } from "@lib/utils"
import type { CollectionEntry } from "astro:content"

type Props = {
  entry: CollectionEntry<"blog"> | CollectionEntry<"projects">
  pill?: boolean
}

export default function ArrowCard({ entry, pill }: Props) {
  return (
    <a
      href={`/${entry.collection}/${entry.slug}`}
      class="tile tile-soft flex flex-col gap-2"
    >
      <div class="mono flex flex-wrap items-center gap-x-3 text-[13px] text-muted">
        {pill && <span>{entry.collection === "blog" ? "Post" : "Project"}</span>}
        <span>{formatDate(entry.data.date)}</span>
      </div>
      <div class="display text-2xl font-medium leading-[1.2]">{entry.data.title} →</div>
      {entry.data.summary && <div class="text-[15px]">{entry.data.summary}</div>}
    </a>
  )
}
