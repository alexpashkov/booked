import { ApolloServer } from "apollo-server-express";
import * as Express from "express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";
import UserResolver from "./UserResolver";
import { Container } from "typedi";

async function main() {
  const mongoClient = await require("mongodb").MongoClient.connect(
    process.env.MONGODB
  );
  Container.set({ id: "mongo", value: mongoClient });
  const schema = await buildSchema({
    resolvers: [UserResolver],
    validate: false,
    container: Container,
  });
  const server = new ApolloServer({ schema });
  const app = Express();
  server.applyMiddleware({ app });
  app.listen(4000, () => console.log("Server started on localhost:4000"));
}

main().catch(console.error);
