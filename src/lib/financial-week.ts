export type FinancialWeek = {
  startDate: string;
  endDate: string;
  label: string;
};

function dateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDatePartsInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

export function getFinancialWeek(
  referenceDate: Date,
  weekStartDay: number,
  timezone: string,
  weekOffset = 0
): FinancialWeek {
  if (!Number.isInteger(weekStartDay) || weekStartDay < 1 || weekStartDay > 7) {
    throw new Error("weekStartDay must be between 1 and 7.");
  }

  // Use the calendar date in the charity's timezone.
  const localDate = getDatePartsInTimezone(referenceDate, timezone);

  // UTC is used here only to perform calendar-day arithmetic safely.
  const current = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day)
  );

  // JavaScript: Sunday = 0; our database: Sunday = 7.
  const currentDay = current.getUTCDay() || 7;
  const daysSinceWeekStart = (currentDay - weekStartDay + 7) % 7;

  current.setUTCDate(
    current.getUTCDate() - daysSinceWeekStart + weekOffset * 7
  );

  const end = new Date(current);
  end.setUTCDate(end.getUTCDate() + 6);

  const startDate = dateString(current);
  const endDate = dateString(end);

  const formatDate = (value: Date) =>
    value.toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return {
    startDate,
    endDate,
    label: `${formatDate(current)} – ${formatDate(end)}`,
  };
}