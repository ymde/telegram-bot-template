echo "** Creating default DB and users"

mysql -u root -p$MARIADB_ROOT_PASSWORD --execute \
"CREATE DATABASE IF NOT EXISTS $MARIADB_DATABASE;
GRANT ALL PRIVILEGES ON $MARIADB_DATABASE.* TO '$MARIADB_USER'@'%';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"

echo "** Finished creating default DB and users"
