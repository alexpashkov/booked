import Resource from "./Resource";
import { HOUR } from "../timeConstants";

describe("Resource", function () {
  it("allows reserving a time without throwing", () => {
    const s = new Resource({ bookings: [], minDuration: HOUR });
    expect(() => s.book(new Date(), 0)).not.toThrow();
  });
  it("prevents reserving time that's covered by date or duration of another booking 1", () => {
    const s = new Resource({ bookings: [], minDuration: HOUR });
    expect(() => s.book(new Date("2020-06-25 16:30"), HOUR)).not.toThrow();
    expect(() => s.book(new Date("2020-06-25 16:30"), HOUR)).toThrow();
    expect(() => s.book(new Date("2020-06-25 17:00"), HOUR)).toThrow();
  });
  it("prevents reserving time that's covered by the duration of another booking 2", () => {
    const s = new Resource({ bookings: [], minDuration: HOUR });
    expect(() => s.book(new Date("2020-06-25 15:30"), HOUR)).not.toThrow();
    expect(() => s.book(new Date("2020-06-25 15:30"), HOUR)).toThrow();
    expect(() => s.book(new Date("2020-06-25 16:30"), HOUR)).not.toThrow();
    expect(() => s.book(new Date("2020-06-25 17:00"), HOUR)).toThrow();
  });
  it("prevents reserving if duration covers another booking in front", () => {
    const s = new Resource({ bookings: [], minDuration: HOUR });
    expect(() => s.book(new Date("2020-06-25 15:30"), HOUR)).not.toThrow();
    expect(() => s.book(new Date("2020-06-25 17:30"), HOUR)).not.toThrow();
    expect(() => s.book(new Date("2020-06-25 17:00"), HOUR)).toThrow();
  });
});
