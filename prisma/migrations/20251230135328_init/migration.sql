-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegram_id` BIGINT NOT NULL,
    `username` VARCHAR(255) NULL,
    `first_name` VARCHAR(255) NULL,
    `language` ENUM('RU', 'EN') NOT NULL DEFAULT 'RU',
    `is_banned` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_telegram_id_key`(`telegram_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
