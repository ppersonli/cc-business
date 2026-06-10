/**
 * Google Calendar API integration for Vertical Scheduler.
 * Creates calendar events when bookings are made.
 * Stores OAuth tokens per user for calendar access.
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const CALENDAR_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/api/calendar/callback';

const CALENDAR_SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export interface CalendarTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  attendeeEmail?: string;
  attendeeName?: string;
}

/**
 * Generate the Google Calendar OAuth URL.
 * User visits this to grant calendar access.
 */
export function getCalendarAuthUrl(userId: string): string {
  const state = encodeURIComponent(userId);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: CALENDAR_REDIRECT_URI,
    response_type: 'code',
    scope: CALENDAR_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for calendar tokens.
 */
export async function exchangeCalendarCode(code: string): Promise<CalendarTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: CALENDAR_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendar token exchange failed: ${error}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshCalendarToken(refreshToken: string): Promise<CalendarTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh calendar token');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Create a Google Calendar event for a booking.
 */
export async function createCalendarEvent(
  tokens: CalendarTokens,
  event: CalendarEvent
): Promise<{ eventId: string; htmlLink: string }> {
  const body: Record<string, unknown> = {
    summary: event.summary,
    description: event.description || '',
    start: { dateTime: event.start },
    end: { dateTime: event.end },
  };

  if (event.attendeeEmail) {
    body.attendees = [{ email: event.attendeeEmail, displayName: event.attendeeName }];
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const data = await response.json();
  return { eventId: data.id, htmlLink: data.htmlLink };
}

/**
 * Delete a Google Calendar event.
 */
export async function deleteCalendarEvent(
  tokens: CalendarTokens,
  eventId: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  );

  if (!response.ok && response.status !== 410) {
    throw new Error('Failed to delete calendar event');
  }
}
