
--
-- Database schema
--

CREATE DATABASE IF NOT EXISTS analytics;

CREATE TABLE analytics.activity_logs
(
    `user_id` Int64,
    `chat_id` Int64,
    `event` LowCardinality(String),
    `params` Map(String, String) DEFAULT map(),
    `result` Map(String, String) DEFAULT map(),
    `status` Enum8('success' = 1, 'error' = 2) DEFAULT 'success',
    `created_at` DateTime64(3) DEFAULT now64(3),
    INDEX idx_event event TYPE set(100) GRANULARITY 4
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(created_at)
ORDER BY (user_id, created_at)
TTL toDateTime(created_at) + toIntervalMonth(6)
SETTINGS index_granularity = 8192;

CREATE TABLE analytics.analytics
(
    `user_id` Int64,
    `chat_id` Int64,
    `key` LowCardinality(String),
    `args` Map(String, String) DEFAULT map(),
    `value` Int64 DEFAULT 1,
    `created_at` DateTime DEFAULT now(),
    INDEX idx_key key TYPE set(1000) GRANULARITY 4
)
ENGINE = SummingMergeTree(value)
PARTITION BY toYYYYMM(created_at)
ORDER BY (key, args, user_id, created_at)
SETTINGS index_granularity = 8192;

CREATE TABLE analytics.schema_migrations
(
    `version` String,
    `ts` DateTime DEFAULT now(),
    `applied` UInt8 DEFAULT 1
)
ENGINE = ReplacingMergeTree(ts)
PRIMARY KEY version
ORDER BY version
SETTINGS index_granularity = 8192;


--
-- Dbmate schema migrations
--

INSERT INTO schema_migrations (version) VALUES
    ('20260104000001'),
    ('20260104000002');
