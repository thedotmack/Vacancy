export interface BuildingComment {
  text: string;
  created_at: string;
}

export interface BuildingFeedback {
  comments: BuildingComment[];
  votes: { yes: number; no: number };
  userVoted: boolean;
}

let voteCountCache: Record<string, { yes: number; no: number }> | null = null;

export async function fetchAllVoteCounts(): Promise<Record<string, { yes: number; no: number }>> {
  if (voteCountCache) return voteCountCache;
  try {
    const response = await fetch('/api/feedback');
    if (!response.ok) return {};
    voteCountCache = await response.json();
    return voteCountCache!;
  } catch {
    return {};
  }
}

export async function fetchBuildingFeedback(gate: string): Promise<BuildingFeedback> {
  try {
    const response = await fetch(`/api/feedback/${encodeURIComponent(gate)}`);
    if (!response.ok) return { comments: [], votes: { yes: 0, no: 0 }, userVoted: false };
    return await response.json();
  } catch {
    return { comments: [], votes: { yes: 0, no: 0 }, userVoted: false };
  }
}

export async function submitVote(gate: string, isAccurate: boolean): Promise<BuildingFeedback | null> {
  try {
    const response = await fetch(`/api/feedback/${encodeURIComponent(gate)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: isAccurate }),
    });
    if (!response.ok) return null;
    const result = await response.json();
    // Update cache
    if (voteCountCache) {
      voteCountCache[gate] = result.votes;
    }
    return result;
  } catch {
    return null;
  }
}

export async function submitComment(gate: string, text: string): Promise<BuildingFeedback | null> {
  try {
    const response = await fetch(`/api/feedback/${encodeURIComponent(gate)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: text }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function invalidateVoteCache(): void {
  voteCountCache = null;
}
