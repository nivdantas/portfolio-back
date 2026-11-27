import {createHash, timingSafeEqual} from 'node:crypto'
import {Elysia} from 'elysia'

class PostService {
    verifySecret(secret: string | undefined) {
        const expectedSecret = process.env.ADMIN_SECRET
        if (!secret || !expectedSecret) {
            return false
        }

        const providedDigest = createHash('sha256').update(secret).digest()
        const expectedDigest = createHash('sha256').update(expectedSecret).digest()
        return timingSafeEqual(providedDigest, expectedDigest)
    }
}

export const postService = new Elysia().decorate('postService', new PostService())
