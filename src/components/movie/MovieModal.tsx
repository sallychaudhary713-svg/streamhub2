import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { Movie } from "@workspace/api-client-react";
import { useGetMovie } from "@workspace/api-client-react";

interface MovieModalProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieModal({ movie, open, onOpenChange }: MovieModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: fullMovie } = useGetMovie(movie.id, { query: { enabled: open } });
  
  const displayMovie = fullMovie || movie;

  // Reset play state when modal closes/opens
  useEffect(() => {
    if (!open) setIsPlaying(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[430px] w-full p-0 bg-[#0f0f0f] border-0 h-[90vh] md:h-[85vh] mt-auto mb-0 md:mb-auto rounded-t-2xl md:rounded-b-2xl overflow-hidden flex flex-col gap-0 shadow-2xl absolute bottom-0 md:relative">
        <div className="sr-only">
          <DialogTitle>{displayMovie.title}</DialogTitle>
          <DialogDescription>Watch {displayMovie.title}</DialogDescription>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Top Half: Poster Area */}
          <div className="relative w-full aspect-[2/3] max-h-[50vh] bg-zinc-900">
            {displayMovie.posterUrl ? (
              <img 
                src={displayMovie.posterUrl} 
                alt={displayMovie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">No Poster</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
          </div>

          {/* Bottom Half: Details & Actions */}
          <div className="px-6 py-4 -mt-20 relative z-10 flex flex-col gap-4">
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-white bg-white/20 backdrop-blur-md mb-2">
                {displayMovie.category}
              </span>
              <h2 className="text-3xl font-black text-white leading-tight">
                {displayMovie.title}
              </h2>
            </div>

            {displayMovie.description && (
              <p className="text-zinc-400 text-sm leading-relaxed">
                {displayMovie.description}
              </p>
            )}

            <div className="flex flex-col gap-3 mt-2 pb-6">
              {!isPlaying ? (
                <Button 
                  onClick={() => setIsPlaying(true)}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg hover:opacity-90 shadow-[0_4px_20px_rgba(234,88,12,0.4)]"
                >
                  <Play className="w-6 h-6 mr-2 fill-current" /> STREAM NOW
                </Button>
              ) : (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                  <div 
                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                    dangerouslySetInnerHTML={{ __html: displayMovie.embedUrl }}
                  />
                </div>
              )}

              <Button 
                variant="outline"
                onClick={() => window.open(displayMovie.downloadUrl, '_blank')}
                className="w-full h-14 rounded-xl border-2 border-white/20 bg-transparent text-white font-bold text-lg hover:bg-white/5"
              >
                <Download className="w-6 h-6 mr-2" /> DOWNLOAD
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
