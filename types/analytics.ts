/** Analytics types shared by the tracker, the API and the admin dashboard. */

/** Events the browser may send. Enquiries are recorded only by the server (lib/analytics.ts). */
export const TRACK_EVENTS = ["page_view", "product_view", "whatsapp_click", "call_click", "instagram_click"] as const;
export type TrackEventType = (typeof TRACK_EVENTS)[number];
export type AnalyticsEventType = TrackEventType | "enquiry";

export const EVENT_LABELS: Record<AnalyticsEventType, string> = {
  page_view: "Page view",
  product_view: "Product view",
  whatsapp_click: "WhatsApp click",
  call_click: "Call click",
  instagram_click: "Instagram click",
  enquiry: "Enquiry",
};

/** What the browser posts to /api/track. An empty `events` list is a heartbeat. */
export type TrackPayload = {
  visitorId: string;
  sessionId: string;
  /** Only on the first request of a visit */
  start?: { landing: string; referrer?: string; utm?: string };
  events: { id: string; type: TrackEventType; path: string; product?: string }[];
};

export type RangeKey = "today" | "7d" | "30d" | "custom";

/** A date range in the store's time zone. Dates are YYYY-MM-DD, both inclusive. */
export type DateRange = { key: RangeKey; from: string; to: string };

export type Summary = {
  visits: number;
  uniqueVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  pageViews: number;
  whatsappClicks: number;
  callClicks: number;
  enquiries: number;
};

/** One bar of the visits chart: a day, or an hour when the range is a single day. */
export type VisitsPoint = { label: string; date: string; visits: number; visitors: number; pageViews: number };

export type ProductStat = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  active: boolean;
  /** Every product page view */
  views: number;
  /** Visits that viewed the product at least once */
  viewers: number;
  whatsappClicks: number;
  /** Visits that viewed the product and tapped its WhatsApp button */
  converted: number;
  enquiries: number;
};

export type Breakdown = { name: string; visits: number }[];

export type Report = {
  range: DateRange;
  timeZone: string;
  hourly: boolean;
  summary: Summary;
  visits: VisitsPoint[];
  products: ProductStat[];
  sources: Breakdown;
  devices: Breakdown;
};

export type LiveEvent = {
  id: string;
  type: AnalyticsEventType;
  path: string;
  productName?: string;
  at: string;
  /** Short hash of the visitor ID: tells visitors apart without revealing anything */
  visitor?: string;
  device?: string;
};

export type LiveData = {
  liveVisitors: number;
  activeMinutes: number;
  pages: { path: string; visitors: number }[];
  events: LiveEvent[];
};
