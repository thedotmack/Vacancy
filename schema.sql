CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  building_gate VARCHAR(10) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accuracy_votes (
  id SERIAL PRIMARY KEY,
  building_gate VARCHAR(10) NOT NULL,
  vote BOOLEAN NOT NULL,
  voter_fingerprint VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_gate ON comments(building_gate);
CREATE INDEX idx_votes_gate ON accuracy_votes(building_gate);
CREATE UNIQUE INDEX idx_votes_unique ON accuracy_votes(building_gate, voter_fingerprint);
