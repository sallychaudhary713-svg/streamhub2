import { useState, useEffect } from "react";
import {
  useListMovies,
  useDeleteMovie,
  useCreateMovie,
  useUpdateMovie,
  getListMoviesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Shield, LogOut, Plus, Pencil, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Movie } from "@workspace/api-client-react";

const CATEGORIES = ["Bollywood", "Hollywood", "Series", "LiveTV"] as const;
const QUALITIES = ["HD", "CAM Rip"] as const;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(CATEGORIES, { required_error: "Category is required" }),
  quality: z.enum(QUALITIES, { required_error: "Quality is required" }),
  posterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  embedUrl: z.string().min(1, "Embed code is required"),
  downloadUrl: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin786") {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
      setLoginError("");
    } else {
      setLoginError("Incorrect password. Try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
  };

  const { data: movies, isLoading } = useListMovies(
    {},
    { query: { enabled: isAuthenticated, queryKey: getListMoviesQueryKey() } }
  );
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const deleteMovie = useDeleteMovie();

  const isEditMode = editingId !== null;
  const isSaving = createMovie.isPending || updateMovie.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "Bollywood",
      quality: "HD",
      posterUrl: "",
      embedUrl: "",
      downloadUrl: "",
      description: "",
    },
  });

  const handleEdit = (movie: Movie) => {
    setEditingId(movie.id);
    form.reset({
      title: movie.title,
      category: movie.category as (typeof CATEGORIES)[number],
      quality: (movie.quality as (typeof QUALITIES)[number]) ?? "HD",
      posterUrl: movie.posterUrl ?? "",
      embedUrl: movie.embedUrl,
      downloadUrl: movie.downloadUrl,
      description: movie.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      title: "",
      category: "Bollywood",
      quality: "HD",
      posterUrl: "",
      embedUrl: "",
      downloadUrl: "",
      description: "",
    });
  };

  const onSubmit = (values: FormValues) => {
    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: getListMoviesQueryKey() });
    };

    if (isEditMode && editingId !== null) {
      updateMovie.mutate(
        { id: editingId, data: values },
        {
          onSuccess: () => {
            toast({ title: "Movie updated successfully" });
            handleCancelEdit();
            invalidateAll();
          },
          onError: (err) => {
            toast({ title: "Failed to update movie", description: String(err), variant: "destructive" });
          },
        }
      );
    } else {
      createMovie.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast({ title: "Movie added successfully" });
            form.reset({ title: "", category: "Bollywood", posterUrl: "", embedUrl: "", downloadUrl: "", description: "" });
            invalidateAll();
          },
          onError: (err) => {
            toast({ title: "Failed to add movie", description: String(err), variant: "destructive" });
          },
        }
      );
    }
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    deleteMovie.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Movie deleted" });
          if (editingId === id) handleCancelEdit();
          queryClient.invalidateQueries({ queryKey: getListMoviesQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to delete movie", variant: "destructive" });
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center p-4 font-mono text-zinc-100">
        <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl tracking-tight">Admin Access</CardTitle>
            <CardDescription className="text-zinc-500">Enter your passphrase to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-700"
                data-testid="input-password"
              />
              {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
              <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" data-testid="button-login">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-zinc-400" />
            <div>
              <h1 className="text-base font-bold">Admin Dashboard</h1>
              <p className="text-xs text-zinc-500">Manage movie content</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            size="sm"
            className="w-fit border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Form ── */}
          <Card className={`lg:col-span-2 bg-zinc-900 border-zinc-800 h-fit ${isEditMode ? "ring-1 ring-amber-500/50" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                {isEditMode ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Editing Movie #{editingId}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add New Movie
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-zinc-950 border-zinc-800 h-9 text-sm" data-testid="input-title" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-9 text-sm" data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Quality</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-9 text-sm" data-testid="select-quality">
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {QUALITIES.map((q) => (
                              <SelectItem key={q} value={q}>
                                <span className="flex items-center gap-2">
                                  <span className={`inline-block w-2 h-2 rounded-sm ${q === "HD" ? "bg-blue-500" : "bg-amber-400"}`} />
                                  {q}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="posterUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Poster URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." className="bg-zinc-950 border-zinc-800 h-9 text-sm" data-testid="input-poster-url" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="embedUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Stream Embed URL</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="bg-zinc-950 border-zinc-800 font-mono text-xs min-h-[72px] resize-none"
                            placeholder="<iframe src='https://doodstream.com/e/...'></iframe>"
                            data-testid="input-embed-url"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="downloadUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Download URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." className="bg-zinc-950 border-zinc-800 h-9 text-sm" data-testid="input-download-url" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider">Description <span className="normal-case">(optional)</span></FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-zinc-950 border-zinc-800 resize-none h-16 text-sm" data-testid="input-description" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className={`flex-1 text-sm font-semibold ${
                        isEditMode
                          ? "bg-amber-500 hover:bg-amber-400 text-black"
                          : "bg-white hover:bg-zinc-200 text-black"
                      }`}
                      data-testid="button-submit"
                    >
                      {isSaving
                        ? (isEditMode ? "Updating..." : "Saving...")
                        : (isEditMode ? "Update Movie" : "Add Movie")}
                    </Button>
                    {isEditMode && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-3"
                        data-testid="button-cancel-edit"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                </form>
              </Form>
            </CardContent>
          </Card>

          {/* ── Movie Table ── */}
          <Card className="lg:col-span-3 bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Movie Library
                </CardTitle>
                {movies && (
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {movies.length} {movies.length === 1 ? "title" : "titles"}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 text-center text-zinc-500 text-sm">Loading records...</div>
              ) : !movies?.length ? (
                <div className="py-16 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-b-lg text-sm mx-4 mb-4">
                  No movies yet. Add your first one using the form.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-950/50">
                        <TableHead className="text-zinc-500 text-xs w-12 pl-4">#</TableHead>
                        <TableHead className="text-zinc-500 text-xs">Title</TableHead>
                        <TableHead className="text-zinc-500 text-xs w-28">Category</TableHead>
                        <TableHead className="text-zinc-500 text-xs text-right pr-4 w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movies.map((movie: Movie) => {
                        const isEditing = editingId === movie.id;
                        return (
                          <TableRow
                            key={movie.id}
                            className={`border-zinc-800 transition-colors ${
                              isEditing
                                ? "bg-amber-500/10 border-l-2 border-l-amber-500"
                                : "hover:bg-zinc-800/40"
                            }`}
                            data-testid={`row-movie-${movie.id}`}
                          >
                            <TableCell className="text-zinc-600 text-xs pl-4 font-mono">
                              {movie.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {movie.posterUrl && (
                                  <img
                                    src={movie.posterUrl}
                                    alt=""
                                    className="w-7 h-9 rounded object-cover shrink-0 bg-zinc-800"
                                  />
                                )}
                                <span className="font-medium text-sm text-zinc-200 truncate max-w-[160px]">
                                  {movie.title}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-300">
                                {movie.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => (isEditing ? handleCancelEdit() : handleEdit(movie))}
                                  className={`h-8 w-8 p-0 ${
                                    isEditing
                                      ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                                  }`}
                                  data-testid={`button-edit-${movie.id}`}
                                >
                                  {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(movie.id, movie.title)}
                                  disabled={deleteMovie.isPending}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  data-testid={`button-delete-${movie.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
