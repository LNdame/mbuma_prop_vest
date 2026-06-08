// Lightweight health-check endpoint so Railway's `/health` probe passes for
// the frontend service too (the backend serves its own /health). Kept dynamic
// so it's always handled by the running server, never statically cached.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok' });
}
