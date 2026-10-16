'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE course_staff (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        staff_role  staff_role NOT NULL DEFAULT 'ta',
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT course_staff_course_user_unique UNIQUE (course_id, user_id)
      );
    `);

    await q(`CREATE INDEX course_staff_user_id_idx ON course_staff (user_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS course_staff;`);
  },
};
