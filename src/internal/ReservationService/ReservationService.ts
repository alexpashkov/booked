import * as mongodb from "mongodb";
import * as resource from "../Resource/Resource";

interface Options {
  readonly mongoClient: mongodb.MongoClient;
  readonly dbName: string;
  readonly collectionName: string;

  readonly minDuration: number;
}

class ReservationService<T = undefined> {
  /**
   * It's here for testing purposes only
   */
  public beforeBookingUpdate?: () => Promise<void>;

  constructor(private readonly options: Options) {}

  private get blankResourceData(): resource.Data<T> {
    return {
      bookings: [],
      minDuration: this.options.minDuration,
    };
  }

  public async createResource(): Promise<string> {
    const res = await this.mongoCollection.insertOne(this.blankResourceData);
    return res.insertedId.toHexString();
  }

  public async getResourceById(
    id: string,
    session?: mongodb.ClientSession
  ): Promise<resource.Resource<T> | null> {
    const data = await this.mongoCollection.findOne(
      { _id: new mongodb.ObjectID(id) },
      { session }
    );
    return data && new resource.Resource(data);
  }

  public async book(id: string, date: Date, duration: number, meta?: T) {
    const oid = new mongodb.ObjectID(id);
    const session = this.options.mongoClient.startSession();
    try {
      await session.withTransaction(async () => {
        const resource = await this.getResourceById(id, session);
        if (!resource) throw new Error("no such resource");
        resource.book(date, duration, meta);
        if (this.beforeBookingUpdate) await this.beforeBookingUpdate();
        await this.mongoCollection.updateOne(
          { _id: oid },
          { $set: resource.data },
          { session, upsert: true }
        );
      });
    } finally {
      await session.endSession();
    }
  }

  private get mongoCollection(): mongodb.Collection<resource.Data<T>> {
    return this.options.mongoClient
      .db(this.options.dbName)
      .collection(this.options.collectionName);
  }
}

export default ReservationService;
