import { Elysia, t } from 'elysia'

const authModel = new Elysia().model({
    postSecretBody: t.Object({
        secret_pass: t.String()
    }),
    invalidPost: t.Literal('Invalid post secret')
})

export type authModel = typeof authModel.models.postSecretBody