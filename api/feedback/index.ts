import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const sql = neon(databaseUrl);

  try {
    const rows = await sql`
      SELECT
        building_gate,
        SUM(CASE WHEN vote THEN 1 ELSE 0 END)::int as yes,
        SUM(CASE WHEN NOT vote THEN 1 ELSE 0 END)::int as no
      FROM accuracy_votes
      GROUP BY building_gate
    `;

    const result: Record<string, { yes: number; no: number }> = {};
    for (const row of rows) {
      result[row.building_gate] = { yes: row.yes, no: row.no };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Feedback bulk API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
