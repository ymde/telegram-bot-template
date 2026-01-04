-- migrate:up
CREATE TABLE activity_logs (
    user_id Int64,
    chat_id Int64,

    event LowCardinality(String),

    params Map(String, String) DEFAULT map(),
    result Map(String, String) DEFAULT map(),

    status Enum8('success' = 1, 'error' = 2) DEFAULT 'success',

    created_at DateTime64(3) DEFAULT now64(3),

    INDEX idx_event event TYPE set(100) GRANULARITY 4
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (user_id, created_at)
TTL toDateTime(created_at) + INTERVAL 6 MONTH
SETTINGS index_granularity = 8192;

-- migrate:down
DROP TABLE IF EXISTS activity_logs;
