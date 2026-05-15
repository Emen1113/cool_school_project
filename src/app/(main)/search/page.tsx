import { SearchView } from "@/components/search/search-view";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-white">Search</h1>
        <p className="text-sm text-white/50">Find students at your school</p>
      </header>
      <SearchView />
    </div>
  );
}
