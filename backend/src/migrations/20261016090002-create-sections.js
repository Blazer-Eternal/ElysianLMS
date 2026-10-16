'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // DEFERRABLE so a course's sections can be reordered inside one
    // transaction without tripping the constraint mid-flight
    await q(`
      CREATE TABLE sections (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title       VARCHAR(200) NOT NULL CHECK (length(title) > 0),
        order_index INTEGER NOT NULL CHECK (order_index >= 0),
        CONSTRAINT sections_course_order_unique UNIQUE (course_id, order_index) DEFERRABLE INITIALLY DEFERRED
      );
    `);

    await q(`CREATE INDEX sections_course_id_idx ON sections (course_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS sections;`);
  },
};
