import {Elysia, t} from 'elysia'
import {postService} from './service'

export const postRoutes = new Elysia({prefix: '/posts'})
    .use(postService)


    .get('/', () => {
        return 'Get all posts'
    })
    .get('/:slug', 'Get from slug')

    .post('/', ({body}) => {
        return `Created POST: ${body.title}`
    }, {
        body: t.Object({
            title: t.String(),
            content: t.String()
        })
    })
    .put('/:slug', ({params: {slug}, body}) => {
        return `Updated POST: ${slug}`
    }, {
        body: t.Object({
            title: t.Optional(t.String()),
            content: t.Optional(t.String())
        })
    })
    .delete('/:slug', ({params: {slug}}) => {
        return `Deleted POST: ${slug}`
    })

postRoutes.listen(3000, ({hostname, port}) => {
    console.log(`Post API is running at http://${hostname}:${port}`)
})