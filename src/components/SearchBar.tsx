type Props = {
  onSearchInput: (e: Event) => void
  query: () => string
  setQuery: (value: string) => void
  placeholderText: string
}

export default function SearchBar({ onSearchInput, query, setQuery, placeholderText }: Props) {
  return (
    <div class="relative">
      <input
        name="search"
        type="text"
        aria-label={placeholderText}
        value={query()}
        onInput={onSearchInput}
        autocomplete="off"
        spellcheck={false}
        placeholder={placeholderText}
        class="w-full rounded-tile border border-soft bg-bg px-4 py-3 text-[17px] text-ink placeholder-muted"
      />
      {query().length > 0 && (
        <button
          onClick={() => setQuery("")}
          aria-label="Clear search"
          class="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-muted hover:text-ink"
        >
          ✕
        </button>
      )}
    </div>
  )
}
