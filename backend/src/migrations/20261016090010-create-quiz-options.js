'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // composite (id, question_id) exists so attempt_answers can FK both columns,
    // guaranteeing an answer's option always belongs to its recorded question
    await q(`
      CREATE TABLE quiz_options (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
        option_text VARCHAR(500) NOT NULL,
        is_correct  BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT quiz_options_id_question_unique UNIQUE (id, question_id)
      );
    `);

    // exactly one correct option per question
    await q(`CREATE UNIQUE INDEX quiz_options_one_correct_per_question ON quiz_options (question_id) WHERE is_correct;`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS quiz_options;`);
  },
};
