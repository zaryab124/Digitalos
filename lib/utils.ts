import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("92") && cleaned.length === 12) {
    return `+92 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+92 ${cleaned.slice(1, 4)} ${cleaned.slice(4)}`;
  }
  return phone;
}

export interface BusinessHourItem {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export function isBusinessOpenNow(hours: BusinessHourItem[] = []): {
  isOpen: boolean;
  message: string;
  messageUr: string;
} {
  if (!hours || hours.length === 0) {
    return { isOpen: true, message: "Open Today", messageUr: "کھلا ہے" };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday ...
  const todayHour = hours.find((h) => h.dayOfWeek === currentDay);

  if (!todayHour || todayHour.isClosed) {
    return { isOpen: false, message: "Closed Today", messageUr: "آج بند ہے" };
  }

  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (
    currentTimeStr >= todayHour.openTime &&
    currentTimeStr <= todayHour.closeTime
  ) {
    return {
      isOpen: true,
      message: `Open until ${formatTime12Hour(todayHour.closeTime)}`,
      messageUr: `${formatTime12Hour(todayHour.closeTime)} تک کھلا ہے`,
    };
  }

  if (currentTimeStr < todayHour.openTime) {
    return {
      isOpen: false,
      message: `Opens at ${formatTime12Hour(todayHour.openTime)}`,
      messageUr: `${formatTime12Hour(todayHour.openTime)} پر کھلے گا`,
    };
  }

  return {
    isOpen: false,
    message: "Closed for the day",
    messageUr: "آج کا وقت ختم ہو چکا ہے",
  };
}

export function formatTime12Hour(time24: string): string {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export const DAYS_OF_WEEK = [
  { day: 0, en: "Sunday", ur: "اتوار" },
  { day: 1, en: "Monday", ur: "پیر" },
  { day: 2, en: "Tuesday", ur: "منگل" },
  { day: 3, en: "Wednesday", ur: "بدھ" },
  { day: 4, en: "Thursday", ur: "جمعرات" },
  { day: 5, en: "Friday", ur: "جمعہ" },
  { day: 6, en: "Saturday", ur: "ہفتہ" },
];
