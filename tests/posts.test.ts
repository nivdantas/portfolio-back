import {afterEach, beforeEach, expect, mock, test} from 'bun:test'
import {Prisma} from '../src/generated/prisma/client'

const post = {
    slug: 'hello',
    title_en: 'Hello',
    title_pt: 'Olá',
    content_en: 'English',
    content_pt: 'Português',
    imageUrl: null,
}
const update = mock(async (_query: {where: {slug: string}, data: typeof post}) => post)

mock.module('../src/db', () => ({
    db: {post: {update, findMany: async () => [post]}},
}))

const {postRoutes} = await import('../src/modules/posts')

const updatePost = (authorization?: string, body: object = post) =>
    postRoutes.handle(new Request('http://localhost/posts/hello', {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            ...(authorization ? {authorization} : {}),
        },
        body: JSON.stringify(body),
    }))

const originalSecret = process.env.ADMIN_SECRET
beforeEach(() => {
    update.mockClear()
    process.env.ADMIN_SECRET = 'test-secret'
})
afterEach(() => {
    if (originalSecret === undefined) delete process.env.ADMIN_SECRET
    else process.env.ADMIN_SECRET = originalSecret
})

test('the post list is public', async () => {
    const response = await postRoutes.handle(new Request('http://localhost/posts/'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([post])
})

test('writes require a valid Bearer header', async () => {
    for (const header of [undefined, 'test-secret', 'Bearer wrong-secret']) {
        expect((await updatePost(header)).status).toBe(401)
    }
    expect(update).not.toHaveBeenCalled()
})

test('writes are denied when the admin secret is unset', async () => {
    delete process.env.ADMIN_SECRET
    expect((await updatePost('Bearer test-secret')).status).toBe(401)
    expect(update).not.toHaveBeenCalled()
})

test('authenticated updates pass the bilingual fields and nullable image to Prisma', async () => {
    const response = await updatePost('Bearer test-secret')
    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith({where: {slug: 'hello'}, data: post})
})

test('a missing record returns 404 and an unexpected database error returns 500', async () => {
    update.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('Missing record', {
        code: 'P2025',
        clientVersion: 'test',
    }))
    expect((await updatePost('Bearer test-secret')).status).toBe(404)
    update.mockRejectedValueOnce(new Error('Database unavailable'))
    expect((await updatePost('Bearer test-secret')).status).toBe(500)
})
