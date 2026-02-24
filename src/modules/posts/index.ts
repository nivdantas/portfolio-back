import { Elysia } from 'elysia'
import {postService} from './service'
export const post = new Elysia()
    .use(postService)


    .get('/', 'posts')
    .get('/posts/:slug', 'Get from slug')

    .post('/posts', () => {})
    .put('/posts/:slug', 'PUT POST')
    .delete('/posts/:slug', 'Delete POST')
    .listen(3000)