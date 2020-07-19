import ReservationService from "./ReservationService";
import { MongoClient } from "mongodb";
import { HOUR } from "../timeConstants";

const dbName = "test";
const collectionName = "schedules";

describe("ReservationService", () => {
  let mongoClient: MongoClient;
  let service: ReservationService;

  beforeAll(async () => {
    if (typeof process.env.MONGODB_URI !== "string")
      throw new Error("MONGODB_URI is not set");
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    service = new ReservationService({
      mongoClient,
      dbName,
      collectionName,
      minDuration: HOUR,
    });
  });
  afterAll(async () => await mongoClient.close());

  it("allows making a reservation", async () => {
    const id = await service.createResource();
    await service.book(id, new Date("15-06-2020 18-30"), HOUR);
  });
});
