'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE reviews (
        id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id  INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment    TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT reviews_user_course_unique UNIQUE (user_id, course_id)
      );
    `);

    await q(`CREATE INDEX reviews_course_id_idx ON reviews (course_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS reviews;`);
  },
};
