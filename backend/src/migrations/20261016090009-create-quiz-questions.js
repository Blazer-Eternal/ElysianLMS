'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE quiz_questions (
        id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        quiz_id       INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        order_index   INTEGER NOT NULL CHECK (order_index >= 0),
        CONSTRAINT quiz_questions_quiz_order_unique UNIQUE (quiz_id, order_index) DEFERRABLE INITIALLY DEFERRED
      );
    `);

    await q(`CREATE INDEX quiz_questions_quiz_id_idx ON quiz_questions (quiz_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS quiz_questions;`);
  },
};
