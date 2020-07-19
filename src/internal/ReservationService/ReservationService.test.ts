import ReservationService from "./ReservationService";
import { MongoClient } from "mongodb";
import { HOUR, MINUTE } from "../timeConstants";

const dbName = "test";
const collectionName = "schedules";

async function mongoConnect(): Promise<MongoClient> {
  if (typeof process.env.MONGODB_URI !== "string")
    throw new Error("MONGODB_URI is not set");
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  return c;
}

describe("ReservationService", () => {
  let mongoClient: MongoClient;
  let service: ReservationService<string>;

  beforeAll(async () => {
    mongoClient = await mongoConnect();
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
  jest.setTimeout(MINUTE);
  it("doesn't allow lost updates", async () => {
    const busyDateTimestamp = new Date("2020-06-28 16:30");
    const busyDate = new Date(busyDateTimestamp);
    const freeDate = new Date("2020-06-29 16:30");
    const resourceID = await service.createResource();
    let wasCalled = false;
    service.beforeBookingUpdate = async () => {
      if (wasCalled) return;
      wasCalled = true;
      const bookingID = "is first to book";
      await service.book(resourceID, busyDate, HOUR, bookingID);
      expect(
        (await service.getResourceById(resourceID))?.findBooking(busyDate)?.meta
      ).toEqual(bookingID);
    };
    await expect(
      service.book(resourceID, busyDate, HOUR, "should fail")
    ).rejects.toThrow();
    const anotherSuccessfulBooking = "should succeed";
    await expect(
      service.book(resourceID, freeDate, HOUR, anotherSuccessfulBooking)
    ).resolves.not.toThrow();
    expect(
      (await service.getResourceById(resourceID))?.findBooking(freeDate)?.meta
    ).toEqual(anotherSuccessfulBooking);
    service.beforeBookingUpdate = undefined;
  });
});
