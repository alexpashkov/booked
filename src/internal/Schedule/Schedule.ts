export const MILLISECOND = 1;
export const SECOND = MILLISECOND * 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

interface Booking {
  date: Date;
  duration: number;
}

export default class Schedule {
  private static compareDates(a: Date, b: Date): number {
    return a > b ? -1 : 1;
  }

  private static datesAreEqual(a: Date, b: Date): boolean {
    return !Schedule.compareDates(a, b);
  }

  private static bookingCoversDate(booking: Booking, date: Date): boolean {
    return booking.date.getTime() + booking.duration > date.getTime();
  }

  private bookings: Booking[] = [];

  public constructor(public defaultDuration: number = HOUR) {}

  /**
   *
   * @param start
   * @param duration in milliseconds
   */
  public book(start: Date, duration: number = this.defaultDuration) {
    if (this.isBooked(start)) {
      throw new Error("already booked");
    }
    this.bookings.push({ date: start, duration });
    this.sortBookings();
  }

  private isBooked(date: Date): boolean {
    const closest = this.findClosestPrecedingBooking(date);
    return (
      !!closest &&
      (Schedule.datesAreEqual(closest.date, date) ||
        Schedule.bookingCoversDate(closest, date))
    );
  }

  private sortBookings() {
    this.bookings.sort((a, b) => Schedule.compareDates(b.date, a.date));
  }

  /**
   * Note: it relies on the fact that {@link this.bookings} are sorted in ascending order at all times
   * @param start
   */
  private findClosestPrecedingBooking(start: Date): Booking | undefined {
    for (let i = this.bookings.length - 1; i >= 0; i--) {
      if (this.bookings[i].date <= start) return this.bookings[i];
    }
    return undefined;
  }
}
