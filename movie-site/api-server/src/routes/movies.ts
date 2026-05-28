import { Router, type IRouter } from "express";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import { db, moviesTable } from "@workspace/db";
import {
  ListMoviesQueryParams,
  CreateMovieBody,
  GetMovieParams,
  DeleteMovieParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/movies", async (req, res): Promise<void> => {
  const parsed = ListMoviesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, search } = parsed.data;
  const conditions: SQL[] = [];

  if (category) {
    conditions.push(eq(moviesTable.category, category));
  }
  if (search) {
    conditions.push(ilike(moviesTable.title, `%${search}%`));
  }

  const movies =
    conditions.length > 0
      ? await db
          .select()
          .from(moviesTable)
          .where(and(...conditions))
          .orderBy(moviesTable.createdAt)
      : await db.select().from(moviesTable).orderBy(moviesTable.createdAt);

  res.json(movies);
});

router.post("/movies", async (req, res): Promise<void> => {
  const parsed = CreateMovieBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid movie body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [movie] = await db.insert(moviesTable).values(parsed.data).returning();
  res.status(201).json(movie);
});

router.get("/movies/:id", async (req, res): Promise<void> => {
  const params = GetMovieParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [movie] = await db
    .select()
    .from(moviesTable)
    .where(eq(moviesTable.id, id));

  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.json(movie);
});

router.patch("/movies/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const parsed = CreateMovieBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid movie update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [movie] = await db
    .update(moviesTable)
    .set(parsed.data)
    .where(eq(moviesTable.id, id))
    .returning();

  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.json(movie);
});

router.delete("/movies/:id", async (req, res): Promise<void> => {
  const params = DeleteMovieParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [movie] = await db
    .delete(moviesTable)
    .where(eq(moviesTable.id, id))
    .returning();

  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
