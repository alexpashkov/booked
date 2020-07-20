interface Booking<T = undefined> {
  date: Date;
  duration: number;
  meta?: T;
}

export interface Data<T> {
  bookings: Booking<T>[];
  minDuration: number;
}

export class Resource<T> {
  private static compareDates(a: Date, b: Date): number {
    return a > b ? -1 : 1;
  }

  private static datesAreEqual(a: Date, b: Date): boolean {
    return !Resource.compareDates(a, b);
  }

  private static bookingCoversDate<T>(
    booking: Booking<T>,
    date: Date
  ): boolean {
    return booking.date.getTime() + booking.duration > date.getTime();
  }

  public constructor(public readonly data: Data<T>) {}

  /**
   *
   * @param date
   * @param duration in milliseconds
   * @param meta
   */
  public book(date: Date, duration: number, meta?: T) {
    const booking = { date, duration, meta };
    if (!this.canBook(booking)) {
      throw new Error("already booked");
    }
    this.data.bookings.push(booking);
    this.sortBookings();
  }

  public findBooking(date: Date): Booking<T> | undefined {
    return this.data.bookings.find((b) => b.date.getTime() === date.getTime());
  }

  private canBook(booking: Booking<T>): boolean {
    const { preceding, following } = this.findClosestBookings(booking.date);
    return (
      (!preceding ||
        (!Resource.datesAreEqual(preceding.date, booking.date) &&
          !Resource.bookingCoversDate(preceding, booking.date))) &&
      (!following ||
        (!Resource.datesAreEqual(following.date, booking.date) &&
          !Resource.bookingCoversDate(booking, following.date)))
    );
  }

  private sortBookings() {
    this.data.bookings.sort((a, b) => Resource.compareDates(b.date, a.date));
  }

  /**
   * Note: it relies on the fact that {@link this.bookings} are sorted in ascending order at all times
   * @param start
   */
  private findClosestBookings(
    start: Date
  ): { preceding?: Booking<T>; following?: Booking<T> } {
    for (let i = this.data.bookings.length - 1; i >= 0; i--) {
      if (this.data.bookings[i].date <= start)
        return {
          preceding: this.data.bookings[i],
          following: this.data.bookings[i + 1],
        };
    }
    return {};
  }
}
