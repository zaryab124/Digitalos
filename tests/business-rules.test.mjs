import test from "node:test";
import assert from "node:assert/strict";

function formatPKR(amount) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("92") && cleaned.length === 12) {
    return `+92 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+92 ${cleaned.slice(1, 4)} ${cleaned.slice(4)}`;
  }
  return phone;
}

function isBusinessOpenAtTime(hours = [], currentDay, currentTimeStr) {
  if (!hours || hours.length === 0) return { isOpen: true };
  const todayHour = hours.find((h) => h.dayOfWeek === currentDay);
  if (!todayHour || todayHour.isClosed) return { isOpen: false, reason: "CLOSED_TODAY" };

  if (currentTimeStr >= todayHour.openTime && currentTimeStr <= todayHour.closeTime) {
    return { isOpen: true };
  }
  return { isOpen: false, reason: "OUTSIDE_HOURS" };
}

test("Business Rules: formatPKR formats Pakistani rupees correctly", () => {
  const formatted = formatPKR(25000);
  assert.ok(formatted.includes("25,000") || formatted.includes("PKR"), "Should contain formatted amount");
});

test("Business Rules: formatPhoneNumber handles 0300 and +92 formats", () => {
  assert.equal(formatPhoneNumber("03001234567"), "+92 300 1234567");
  assert.equal(formatPhoneNumber("+923001234567"), "+92 300 1234567");
});

test("Business Rules: Operating hours evaluation", () => {
  const weeklyHours = [
    { dayOfWeek: 0, openTime: "09:00", closeTime: "21:00", isClosed: true }, // Sunday closed
    { dayOfWeek: 1, openTime: "09:00", closeTime: "21:00", isClosed: false }, // Monday open 9am-9pm
  ];

  // Sunday at 14:00 (closed)
  const sundayCheck = isBusinessOpenAtTime(weeklyHours, 0, "14:00");
  assert.equal(sundayCheck.isOpen, false);

  // Monday at 14:00 (open)
  const mondayOpen = isBusinessOpenAtTime(weeklyHours, 1, "14:00");
  assert.equal(mondayOpen.isOpen, true);

  // Monday at 22:30 (closed outside hours)
  const mondayNight = isBusinessOpenAtTime(weeklyHours, 1, "22:30");
  assert.equal(mondayNight.isOpen, false);
});
