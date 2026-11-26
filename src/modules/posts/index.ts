import {Elysia, t} from 'elysia'
import {postService} from './service'
import {db} from "../../db";
import {Prisma} from "../../generated/prisma/client";

export const postRoutes = new Elysia({prefix: '/posts'})
    .use(postService)

    .get('/', () => {
        return db.post.findMany({
            orderBy: {createdAt: 'desc'}
        });
    })
    .get('/:slug', async ({params: {slug}, status}) => {
        const post = await db.post.findUnique({
            where: {slug: slug}
        })
        if (!post) {
            return status(404, "Post not found")
        }
        return post
    })

    .guard({
        beforeHandle({headers, postService, status}) {
            const token = /^Bearer\s+(\S+)$/i.exec(headers.authorization ?? '')?.[1]
            if (!postService.verifySecret(token)) {
                return status(401, "Unauthorized")
            }
        }
    })

    .post('/', async ({body}) => {
        return db.post.create({
            data: {
                title_en: body.title_en,
                title_pt: body.title_pt,
                slug: body.slug,
                content_en: body.content_en,
                content_pt: body.content_pt,
                imageUrl: body.imageUrl,
            }
        });
    }, {
        body: t.Object({
            title_en: t.String(),
            title_pt: t.String(),
            slug: t.String(),
            content_en: t.String(),
            content_pt: t.String(),
            imageUrl: t.Optional(t.String()),
        })
    })
    .put('/:slug', async ({params: {slug}, body, status}) => {
        try {
            return await db.post.update({
                where: {slug: slug},
                data: body
            })
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return status(404, "Post not found")
            }
            throw err
        }
    }, {
        body: t.Object({
            title_en: t.Optional(t.String()),
            title_pt: t.Optional(t.String()),
            slug: t.String(),
            content_en: t.Optional(t.String()),
            content_pt: t.Optional(t.String()),
            imageUrl: t.Optional(t.Nullable(t.String())),
        })
    })
    .delete('/:slug', async ({params: {slug}, status}) => {
        try {
            await db.post.delete({
                where: {slug: slug},
            })
            return status(200, "Post deleted")
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return status(404, "Post not found")
            }
            throw err
        }
    })

if (import.meta.main) {
    postRoutes.listen(3000, ({hostname, port}) => {
        console.log(`Post API is running at http://${hostname}:${port}`)
    })
}
