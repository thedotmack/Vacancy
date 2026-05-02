import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';

const BUILDING_GATE_PATTERN = /^[A-Za-z0-9]{1,10}$/;

function getFingerprint(req: VercelRequest): string {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  return createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 16);
}

async function fetchFeedbackState(sql: NeonQueryFunction<false, false>, buildingGate: string, fingerprint: string) {
  const [comments, votes, userVoteResult] = await Promise.all([
    sql`SELECT text, created_at FROM comments WHERE building_gate = ${buildingGate} ORDER BY created_at DESC LIMIT 50`,
    sql`SELECT
          SUM(CASE WHEN vote THEN 1 ELSE 0 END)::int as yes,
          SUM(CASE WHEN NOT vote THEN 1 ELSE 0 END)::int as no
        FROM accuracy_votes WHERE building_gate = ${buildingGate}`,
    sql`SELECT id FROM accuracy_votes WHERE building_gate = ${buildingGate} AND voter_fingerprint = ${fingerprint} LIMIT 1`,
  ]);
  const votesRow = votes[0] as Record<string, number> | undefined;
  return {
    comments,
    votes: { yes: votesRow?.yes || 0, no: votesRow?.no || 0 },
    userVoted: userVoteResult.length > 0,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { buildingGate } = req.query;
  if (typeof buildingGate !== 'string' || !BUILDING_GATE_PATTERN.test(buildingGate)) {
    return res.status(400).json({ error: 'Invalid buildingGate' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const sql = neon(databaseUrl);
  const fingerprint = getFingerprint(req);

  try {
    if (req.method === 'GET') {
      const state = await fetchFeedbackState(sql, buildingGate, fingerprint);
      return res.status(200).json(state);
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

      const state = await fetchFeedbackState(sql, buildingGate, fingerprint);
      return res.status(200).json(state);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Feedback API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
