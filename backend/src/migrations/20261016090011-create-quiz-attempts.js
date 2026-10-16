'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE quiz_attempts (
        id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        quiz_id      INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score        INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
        passed       BOOLEAN NOT NULL,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await q(`CREATE INDEX quiz_attempts_quiz_user_idx ON quiz_attempts (quiz_id, user_id);`);
    await q(`CREATE INDEX quiz_attempts_user_id_idx ON quiz_attempts (user_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS quiz_attempts;`);
  },
};
