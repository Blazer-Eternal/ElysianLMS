'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE sessions (
        id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await q(`CREATE INDEX sessions_user_id_idx ON sessions (user_id);`);
    await q(`CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS sessions;`);
  },
};