import {
  Field,
  InputType,
  Mutation,
  ID,
  Resolver,
  ObjectType,
  Query,
  Arg,
} from "type-graphql";

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
  id: string;
  @Field()
  firstName: string;
  @Field()
  lastName: string;
}

@Resolver()
export default class BookingResolver {
  @Query()
  hello(): string {
    return "";
  }

  @Mutation(() => User, {})
  async registerUser(@Arg("input") input: UserInput): Promise<User> {
    const user = new User();
    Object.assign(user, input);
    return user;
  }
}
