-- migrate:up
CREATE TABLE analytics (
    user_id Int64,
    chat_id Int64,
    key LowCardinality(String),
    args Map(String, String) DEFAULT map(),
    value Int64 DEFAULT 1,
    created_at DateTime DEFAULT now(),

    INDEX idx_key key TYPE set(1000) GRANULARITY 4
)
ENGINE = SummingMergeTree(value)
PARTITION BY toYYYYMM(created_at)
ORDER BY (key, args, user_id, created_at)
SETTINGS index_granularity = 8192;

-- migrate:down
DROP TABLE IF EXISTS analytics;
