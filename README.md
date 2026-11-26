# Portfolio API

A Bun and Elysia API that stores English and Portuguese portfolio posts in PostgreSQL through Prisma.

## Local setup

Install Bun and make a PostgreSQL database available. Set `DATABASE_URL` to its connection string and `ADMIN_SECRET` to a strong token in the process environment. Use `Authorization: Bearer <token>` for write requests.

```sh
bun install --frozen-lockfile
bun --bun run prisma generate
bun --bun run prisma migrate deploy
bun run dev
```

The API listens on port 3000. The migration command applies the checked-in schema to the configured database. The Docker image includes the generated client. Apply migrations separately before starting the container and supply the same environment variables at runtime.

## Posts

| Method | Path | Access |
| --- | --- | --- |
| GET | `/posts/` | Public, newest first |
| GET | `/posts/:slug` | Public |
| POST | `/posts/` | Admin |
| PUT | `/posts/:slug` | Admin |
| DELETE | `/posts/:slug` | Admin |

To create a post, send `slug`, `title_en`, `title_pt`, `content_en`, and `content_pt` as strings. `imageUrl` is optional. To update a post, use its current slug in the URL and send a `slug` in the body. The bilingual fields are optional on update, and an `imageUrl` of `null` clears the image.

## Tests

Run `bun --bun run prisma generate` after installing dependencies, then run `bun run test`. The route tests use a mocked database.
