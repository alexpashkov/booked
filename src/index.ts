import { ApolloServer } from "apollo-server-express";
import * as Express from "express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";
import BookingResolver from "./BookingResolver";

async function main() {
  const schema = await buildSchema({
    resolvers: [BookingResolver],
  });
  const server = new ApolloServer({ schema });
  const app = Express();
  server.applyMiddleware({ app });
  app.listen(4000, () => console.log("Server started on localhost:4000"));
}

main().catch(console.error);
