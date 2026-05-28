import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Movie } from "@workspace/api-client-react";
import { useGetMovie } from "@workspace/api-client-react";

interface MoviePlayerDialogProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoviePlayerDialog({ movie, open, onOpenChange }: MoviePlayerDialogProps) {
  const { data: fullMovie } = useGetMovie(movie.id, { query: { enabled: open } });
  
  const displayMovie = fullMovie || movie;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 bg-black border-white/10 overflow-hidden flex flex-col gap-0 rounded-xl shadow-2xl">
        <div className="sr-only">
          <DialogTitle>{displayMovie.title}</DialogTitle>
          <DialogDescription>Watch {displayMovie.title}</DialogDescription>
        </div>
        <div className="flex-1 w-full bg-black relative">
          <div 
            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: displayMovie.embedUrl }}
          />
        </div>
        <div className="p-6 bg-zinc-950 border-t border-white/5 flex flex-col gap-2 shrink-0">
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">{displayMovie.title}</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white uppercase tracking-wider">
              {displayMovie.category}
            </span>
            {displayMovie.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {displayMovie.description}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
