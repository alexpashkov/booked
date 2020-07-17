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
    const booking = { date: start, duration };
    if (!this.canBook(booking)) {
      throw new Error("already booked");
    }
    this.bookings.push(booking);
    this.sortBookings();
  }

  private canBook(booking: Booking): boolean {
    const { preceding, following } = this.findClosestBookings(booking.date);
    return (
      (!preceding ||
        (!Schedule.datesAreEqual(preceding.date, booking.date) &&
          !Schedule.bookingCoversDate(preceding, booking.date))) &&
      (!following ||
        (!Schedule.datesAreEqual(following.date, booking.date) &&
          !Schedule.bookingCoversDate(booking, following.date)))
    );
  }

  private sortBookings() {
    this.bookings.sort((a, b) => Schedule.compareDates(b.date, a.date));
  }

  /**
   * Note: it relies on the fact that {@link this.bookings} are sorted in ascending order at all times
   * @param start
   */
  private findClosestBookings(
    start: Date
  ): { preceding?: Booking; following?: Booking } {
    for (let i = this.bookings.length - 1; i >= 0; i--) {
      if (this.bookings[i].date <= start)
        return { preceding: this.bookings[i], following: this.bookings[i + 1] };
    }
    return {};
  }
}
