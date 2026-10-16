'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');`);
    await q(`CREATE TYPE course_status AS ENUM ('draft', 'pending', 'published', 'rejected', 'archived');`);
    await q(`CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'refunded');`);
    await q(`CREATE TYPE payment_gateway AS ENUM ('esewa', 'khalti');`);
    await q(`CREATE TYPE staff_role AS ENUM ('ta', 'co_teacher');`);
    await q(`CREATE TYPE video_provider AS ENUM ('youtube', 'cloudinary');`);

    await q(`
      CREATE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  },

  async down(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`DROP FUNCTION IF EXISTS set_updated_at();`);
    await q(`DROP TYPE IF EXISTS video_provider;`);
    await q(`DROP TYPE IF EXISTS staff_role;`);
    await q(`DROP TYPE IF EXISTS payment_gateway;`);
    await q(`DROP TYPE IF EXISTS order_status;`);
    await q(`DROP TYPE IF EXISTS course_status;`);
    await q(`DROP TYPE IF EXISTS user_role;`);
  },
};