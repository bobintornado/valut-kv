-- create keys table
CREATE TABLE IF NOT EXISTS keys (
	id serial PRIMARY KEY,
	key text UNIQUE,
	value text
);

-- create history_values table
CREATE TABLE IF NOT EXISTS history_values (
	key_id integer REFERENCES keys(id) ON DELETE CASCADE,
	value text,
	timestamp timestamptz NOT NULL DEFAULT (now() at time zone 'utc')
);

-- create index of querying performance
CREATE INDEX IF NOT EXISTS key_index ON keys (key);
CREATE INDEX IF NOT EXISTS time_stamp_index ON history_values (timestamp);
