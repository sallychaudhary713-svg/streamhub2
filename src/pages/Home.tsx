import { useState } from "react";
import { useListMovies, getListMoviesQueryKey } from "@workspace/api-client-react";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieModal } from "@/components/movie/MovieModal";
import { BottomNav } from "@/components/layout/BottomNav";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@workspace/api-client-react";

type Category = "Bollywood" | "Hollywood" | "Series" | "LiveTV";

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Category>("Bollywood");

  const { data: movies, isLoading } = useListMovies({ 
    category: activeTab,
    search: search.length > 2 ? search : undefined 
  });

  return (
    <div className="min-h-[100dvh] bg-[#0f0f0f] text-white pb-[80px]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14 max-w-[430px] mx-auto">
          <div className="text-xl font-black tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            STREAMHUB
          </div>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>
        
        {/* Animated Search Bar */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out max-w-[430px] mx-auto ${
            isSearchOpen ? "max-h-16 opacity-100 border-b border-white/10" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                autoFocus
                placeholder="Search movies & shows..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 bg-white/5 border-white/10 rounded-lg h-10 focus-visible:ring-1 focus-visible:ring-orange-500 placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-[430px] mx-auto px-4 pt-4 pb-28">
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full aspect-[2/3] rounded-lg bg-white/5" />
              </div>
            ))
          ) : movies?.length === 0 ? (
            <div className="col-span-2 py-20 text-center text-zinc-500 flex flex-col items-center">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>No content found</p>
            </div>
          ) : (
            movies?.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={setSelectedMovie} 
              />
            ))
          )}
        </div>
      </div>

      {/* Fixed Bottom Nav */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Detail Modal */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          open={!!selectedMovie} 
          onOpenChange={(open) => !open && setSelectedMovie(null)} 
        />
      )}
    </div>
  );
}
