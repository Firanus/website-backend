import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import mercurius from 'mercurius'
import mercuriusCodegen, { gql } from 'mercurius-codegen'
import { Resolvers } from './graphql/generated';

const app = Fastify()
const PORT = 5000;
const isDevelopment = false // process.env.NODE_ENV !== 'production'

const buildContext = async (req: FastifyRequest, _reply: FastifyReply) => {
  return {
    authorization: req.headers.authorization
  }
}

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T

declare module 'mercurius' {
  interface MercuriusContext extends PromiseType<ReturnType<typeof buildContext>> {}
}

// Using the fake "gql" from mercurius-codegen gives tooling support for
// "prettier formatting" and "IDE syntax highlighting".
// It's optional
const schema = gql`
  type Query {
    hello(name: String!): String!
  }
`

const resolvers: Resolvers = {
  Query: {
    hello: (root, { name }, ctx, info) => {
      // root ~ {}
      // name ~ string
      // ctx.authorization ~ string | undefined
      // info ~ GraphQLResolveInfo
      return 'hello ' + name
    }
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  context: buildContext
})

mercuriusCodegen(app, {
  // Commonly relative to your root package.json
  targetPath: './src/graphql/generated.ts'
}).catch(console.error)

app.listen(
  PORT,
  isDevelopment ? '127.0.0.1' : '0.0.0.0',
  (err, address) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('\n', `🚀 Server ready at ${address}/graphql`, '\n');
  },
);
