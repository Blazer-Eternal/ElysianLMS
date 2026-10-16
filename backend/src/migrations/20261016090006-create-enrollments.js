'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // order_id NULL means a free-course enrollment
    await q(`
      CREATE TABLE enrollments (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
        order_id    INTEGER NULL REFERENCES orders(id) ON DELETE RESTRICT,
        enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id),
        CONSTRAINT enrollments_order_unique UNIQUE (order_id)
      );
    `);

    await q(`CREATE INDEX enrollments_course_id_idx ON enrollments (course_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS enrollments;`);
  },
};
