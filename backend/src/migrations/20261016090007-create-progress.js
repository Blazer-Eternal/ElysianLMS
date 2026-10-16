'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE progress (
        id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id    INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT progress_user_lesson_unique UNIQUE (user_id, lesson_id)
      );
    `);

    await q(`CREATE INDEX progress_lesson_id_idx ON progress (lesson_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS progress;`);
  },
};
