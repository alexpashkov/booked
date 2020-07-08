import {
  Field,
  InputType,
  Mutation,
  Resolver,
  Query,
  Arg,
  ObjectType,
  ID,
} from "type-graphql";
import { Inject, Service } from "typedi";
import { Collection, MongoClient } from "mongodb";

@InputType()
class UserInput {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  password: string;
}

@ObjectType()
class User {
  @Field(() => ID)
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

@Service()
@Resolver()
export default class UserResolver {
  constructor(@Inject("mongo") private mongoClient: MongoClient) {}

  @Mutation(() => String, {})
  async registerUser(@Arg("input") input: UserInput): Promise<string> {
    return (await this.getCollection().insertOne(input)).insertedId.toString();
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.getCollection().find().toArray();
  }

  private getCollection(): Collection {
    return this.mongoClient.db("test").collection("users");
  }
}
