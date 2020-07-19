import * as mongodb from "mongodb";
import Resource, { Data } from "../Resource/Resource";

interface Options {
  readonly mongoClient: mongodb.MongoClient;
  readonly dbName: string;
  readonly collectionName: string;

  readonly minDuration: number;
}

class ReservationService {
  constructor(private readonly options: Options) {}

  private blankResourceData: Data = {
    bookings: [],
    minDuration: this.options.minDuration,
  };

  public async createResource(): Promise<string> {
    const res = await this.mongoCollection.insertOne(this.blankResourceData);
    return res.insertedId.toHexString();
  }

  public async book(
    id: string | mongodb.ObjectID,
    date: Date,
    duration: number = this.options.minDuration
  ) {
    id = new mongodb.ObjectID(id);
    const data = await this.mongoCollection.findOne({ _id: id });
    if (!data) throw new Error("no such resource");
    const resource = new Resource(data);
    resource.book(date, duration);
    await this.mongoCollection.updateOne(
      { _id: id },
      { $set: resource },
      { upsert: true }
    );
  }

  private get mongoCollection(): mongodb.Collection<Data> {
    return this.options.mongoClient
      .db(this.options.dbName)
      .collection(this.options.collectionName);
  }
}

export default ReservationService;
