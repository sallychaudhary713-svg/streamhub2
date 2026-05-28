import { Movie } from "@workspace/api-client-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      onClick={() => onClick(movie)}
      className="relative rounded-lg overflow-hidden cursor-pointer group active:scale-95 transition-transform duration-200 bg-zinc-900 border border-zinc-800"
    >
      <AspectRatio ratio={2 / 3}>
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
            No Poster
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent opacity-80" />

        {/* Category badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-white bg-black/60 backdrop-blur-sm border border-white/10">
          {movie.category}
        </div>

        {/* Quality badge */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white text-[9px] font-black tracking-widest leading-none border border-white/20">
          {movie.quality === "HD" ? "HD" : "CAM"}
        </div>

        {/* Title */}
        <div className="absolute bottom-2 left-2 right-2 text-white font-bold text-sm leading-tight line-clamp-2">
          {movie.title}
        </div>
      </AspectRatio>
    </div>
  );
}
