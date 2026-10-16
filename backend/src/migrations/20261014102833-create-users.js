'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE users (
        id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name          VARCHAR(100) NOT NULL CHECK (length(name) > 0),
        email         VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        role          user_role NOT NULL DEFAULT 'student',
        avatar_url    TEXT NULL,
        is_banned     BOOLEAN NOT NULL DEFAULT false,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await q(`CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));`);
    await q(`CREATE INDEX users_role_idx ON users (role);`);

    await q(`
      CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);
  },

  async down(queryInterface) {
    // dropping the table also drops its indexes and trigger
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS users;`);
  },
};