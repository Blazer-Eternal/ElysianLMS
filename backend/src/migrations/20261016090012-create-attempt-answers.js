'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // Composite FK (option_id, question_id) -> quiz_options (id, question_id):
    // the DB itself guarantees the chosen option belongs to the answered question.
    // ON DELETE SET NULL (option_id) keeps the answer row but drops the pointer
    // if the option is deleted. Requires PostgreSQL 15+ for the column-list form.
    await q(`
      CREATE TABLE attempt_answers (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        attempt_id  INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
        option_id   INTEGER NULL,
        CONSTRAINT attempt_answers_attempt_question_unique UNIQUE (attempt_id, question_id),
        CONSTRAINT attempt_answers_option_question_fk
          FOREIGN KEY (option_id, question_id) REFERENCES quiz_options (id, question_id)
          ON DELETE SET NULL (option_id)
      );
    `);

    await q(`CREATE INDEX attempt_answers_question_id_idx ON attempt_answers (question_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS attempt_answers;`);
  },
};
