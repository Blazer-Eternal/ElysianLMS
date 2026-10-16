'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // provider and ref must be set together or not at all
    await q(`
      CREATE TABLE lessons (
        id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        section_id     INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
        title          VARCHAR(200) NOT NULL CHECK (length(title) > 0),
        video_provider video_provider NULL,
        video_ref      TEXT NULL,
        content        TEXT NULL,
        is_preview     BOOLEAN NOT NULL DEFAULT false,
        order_index    INTEGER NOT NULL CHECK (order_index >= 0),
        CONSTRAINT lessons_video_pair_check CHECK ((video_provider IS NULL) = (video_ref IS NULL)),
        CONSTRAINT lessons_section_order_unique UNIQUE (section_id, order_index) DEFERRABLE INITIALLY DEFERRED
      );
    `);

    await q(`CREATE INDEX lessons_section_id_idx ON lessons (section_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS lessons;`);
  },
};
