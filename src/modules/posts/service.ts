import {Elysia} from 'elysia'

class PostService {
    verifySecret(secret: string) {
        const expectedSecret = process.env.ADMIN_SECRET;
        if (secret !== expectedSecret) {
            throw new Error('Invalid post secret')
        }
        return true;
    }


}

export const postService = new Elysia().decorate('postService', new PostService())

