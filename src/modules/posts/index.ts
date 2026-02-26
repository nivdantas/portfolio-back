import {Elysia, t} from 'elysia'
import {postService} from './service'
import {db} from "../../db";
import type {AuthModel} from "./model";

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
    })

    // .guard({
    //     beforeHandle({body, postService, status}){
    //         try{
    //             postService.verifySecret(body.secret_pass)
    //         }
    //         catch(err){
    //             throw status(401, "Unauthorized") satisfies AuthModel.invalidPost
    //         }
    //     }
    // })

    .post('/', async ({body}) => {
        return db.post.create({
            data: {
                title: body.title,
                slug: body.slug,
                content: body.content,
                imageUrl: body.imageUrl,
            }
        });
    }, {
        body: t.Object({
            secret_pass: t.String(),
            title: t.String(),
            slug: t.String(),
            content: t.String(),
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