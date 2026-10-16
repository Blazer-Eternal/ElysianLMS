'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE courses (
        id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        teacher_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        category_id   INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL,
        title         VARCHAR(200) NOT NULL CHECK (length(title) > 0),
        slug          VARCHAR(220) NOT NULL UNIQUE,
        description   TEXT NOT NULL DEFAULT '',
        price         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
        thumbnail_url TEXT NULL,
        status        course_status NOT NULL DEFAULT 'draft',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await q(`CREATE INDEX courses_status_category_idx ON courses (status, category_id);`);
    await q(`CREATE INDEX courses_teacher_id_idx ON courses (teacher_id);`);

    await q(`
      CREATE TRIGGER trg_courses_updated_at
      BEFORE UPDATE ON courses
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS courses;`);
  },
};