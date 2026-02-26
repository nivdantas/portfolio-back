import {t, UnwrapSchema} from 'elysia'

const AuthModel = {
    secret_pass: t.String(),
    invalidPost: t.Literal('Invalid post secret')
} as const


export type AuthModel = {
    [k in keyof typeof AuthModel]: UnwrapSchema<typeof AuthModel[k]>
}