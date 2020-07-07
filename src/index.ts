import { ApolloServer } from "apollo-server-express";
import * as Express from "express";
import { buildSchema, Query, Resolver } from "type-graphql";
import "reflect-metadata";

@Resolver()
class HelloResolver {
  @Query(() => String)
  async hello() {
    return "Hello World";
  }
}

async function main() {
  const schema = await buildSchema({
    resolvers: [HelloResolver],
  });
  const server = new ApolloServer({ schema });
  const app = Express();
  server.applyMiddleware({ app });
  app.listen(4000, () => console.log("Server started on localhost:4000"));
}

main();
