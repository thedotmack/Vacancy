import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

function getFingerprint(req: VercelRequest): string {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  // Simple hash — not crypto-secure, just dedup
  let hash = 0;
  const str = `${ip}:${ua}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { buildingGate } = req.query;
  if (typeof buildingGate !== 'string') {
    return res.status(400).json({ error: 'Missing buildingGate' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const sql = neon(databaseUrl);
  const fingerprint = getFingerprint(req);

  if (req.method === 'GET') {
    const [comments, votes, userVoteResult] = await Promise.all([
      sql`SELECT text, created_at FROM comments WHERE building_gate = ${buildingGate} ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT
            SUM(CASE WHEN vote THEN 1 ELSE 0 END)::int as yes,
            SUM(CASE WHEN NOT vote THEN 1 ELSE 0 END)::int as no
          FROM accuracy_votes WHERE building_gate = ${buildingGate}`,
      sql`SELECT id FROM accuracy_votes WHERE building_gate = ${buildingGate} AND voter_fingerprint = ${fingerprint} LIMIT 1`,
    ]);

    return res.status(200).json({
      comments,
      votes: { yes: votes[0]?.yes || 0, no: votes[0]?.no || 0 },
      userVoted: userVoteResult.length > 0,
    });
  }

  if (req.method === 'POST') {
    const { comment, vote } = req.body || {};

    if (typeof comment === 'string' && comment.trim()) {
      const sanitized = comment.trim().slice(0, 500);
      await sql`INSERT INTO comments (building_gate, text) VALUES (${buildingGate}, ${sanitized})`;
    }

    if (typeof vote === 'boolean') {
      await sql`INSERT INTO accuracy_votes (building_gate, vote, voter_fingerprint) VALUES (${buildingGate}, ${vote}, ${fingerprint}) ON CONFLICT (building_gate, voter_fingerprint) DO NOTHING`;
    }

    // Return updated state
    const [comments, votes, userVoteResult] = await Promise.all([
      sql`SELECT text, created_at FROM comments WHERE building_gate = ${buildingGate} ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT
            SUM(CASE WHEN vote THEN 1 ELSE 0 END)::int as yes,
            SUM(CASE WHEN NOT vote THEN 1 ELSE 0 END)::int as no
          FROM accuracy_votes WHERE building_gate = ${buildingGate}`,
      sql`SELECT id FROM accuracy_votes WHERE building_gate = ${buildingGate} AND voter_fingerprint = ${fingerprint} LIMIT 1`,
    ]);

    return res.status(200).json({
      comments,
      votes: { yes: votes[0]?.yes || 0, no: votes[0]?.no || 0 },
      userVoted: userVoteResult.length > 0,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
