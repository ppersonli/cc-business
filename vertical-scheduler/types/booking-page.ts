export interface CreateBookingPageInput {
  title: string;
  slug: string;
  description?: string;
  brandColor?: string;
  logoUrl?: string;
}

export interface UpdateBookingPageInput {
  title?: string;
  slug?: string;
  description?: string;
  brandColor?: string;
  logoUrl?: string;
}

export interface BookingPage {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  brand_color: string;
  logo_url: string | null;
  created_at: string;
}
