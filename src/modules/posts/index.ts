import {Elysia, t} from 'elysia'
import {postService} from './service'
import {db} from "../../db";

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
        headers: t.Object({
            authorization: t.String()
        }),
        beforeHandle({headers, postService, status}) {
            const token = headers.authorization.replace(/^Bearer\s+/i, '')
            try {
                postService.verifySecret(token)
            } catch {
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
            return status(404, "Post not found")
        }
    }, {
        body: t.Object({
            title: t.Optional(t.String()),
            slug: t.String(),
            content: t.Optional(t.String()),
            imageUrl: t.Optional(t.String()),
        })
    })
    .delete('/:slug', async ({params: {slug}, status}) => {
        try {
            await db.post.delete({
                where: {slug: slug},
            })
            return status(200, "Post deleted")
        } catch (err) {
            return status(404, "Post not found")
        }
    })

postRoutes.listen(3000, ({hostname, port}) => {
    console.log(`Post API is running at http://${hostname}:${port}`)
})
