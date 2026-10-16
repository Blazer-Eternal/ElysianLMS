'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE quizzes (
        id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        lesson_id  INTEGER NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
        title      VARCHAR(200) NOT NULL CHECK (length(title) > 0),
        pass_score INTEGER NOT NULL DEFAULT 50 CHECK (pass_score BETWEEN 0 AND 100)
      );
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS quizzes;`);
  },
};
