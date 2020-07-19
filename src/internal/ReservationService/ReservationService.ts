import * as mongodb from "mongodb";
import Resource, { Data } from "../Resource/Resource";

interface Options {
  readonly mongoClient: mongodb.MongoClient;
  readonly dbName: string;
  readonly collectionName: string;

  readonly minDuration: number;
}

class ReservationService<T = undefined> {
  constructor(private readonly options: Options) {}

  private blankResourceData: Data<T> = {
    bookings: [],
    minDuration: this.options.minDuration,
  };

  public async createResource(): Promise<string> {
    const res = await this.mongoCollection.insertOne(this.blankResourceData);
    return res.insertedId.toHexString();
  }

  public async book(
    id: string,
    date: Date,
    duration: number = this.options.minDuration
  ) {
    const oid = new mongodb.ObjectID(id);
    const session = this.options.mongoClient.startSession();
    try {
      await session.withTransaction(async () => {
        const data = await this.mongoCollection.findOne({ _id: oid });
        if (!data) throw new Error("no such resource");
        const resource = new Resource(data);
        resource.book(date, duration);
        await this.mongoCollection.updateOne(
          { _id: oid },
          { $set: resource },
          { session, upsert: true }
        );
      });
    } finally {
      await session.endSession();
    }
  }

  private get mongoCollection(): mongodb.Collection<Data<T>> {
    return this.options.mongoClient
      .db(this.options.dbName)
      .collection(this.options.collectionName);
  }
}

export default ReservationService;
