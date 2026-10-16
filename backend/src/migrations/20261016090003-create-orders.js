'use strict';

module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`
      CREATE TABLE orders (
        id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        course_id        INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
        amount           NUMERIC(10,2) NOT NULL CHECK (amount > 0),
        gateway          payment_gateway NOT NULL,
        status           order_status NOT NULL DEFAULT 'pending',
        transaction_id   VARCHAR(100) NULL,
        gateway_response JSONB NULL,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        paid_at          TIMESTAMPTZ NULL,
        refunded_at      TIMESTAMPTZ NULL,
        CONSTRAINT orders_status_paid_at_check CHECK (status <> 'paid' OR paid_at IS NOT NULL),
        CONSTRAINT orders_status_refunded_at_check CHECK (status <> 'refunded' OR refunded_at IS NOT NULL)
      );
    `);

    // PG treats NULLs as distinct, so unpaid orders with NULL transaction_id coexist
    await q(`CREATE UNIQUE INDEX orders_gateway_transaction_unique ON orders (gateway, transaction_id);`);
    // at most one paid order per user per course
    await q(`CREATE UNIQUE INDEX orders_one_paid_per_user_course ON orders (user_id, course_id) WHERE status = 'paid';`);

    await q(`CREATE INDEX orders_status_created_at_idx ON orders (status, created_at);`);
    await q(`CREATE INDEX orders_course_id_idx ON orders (course_id);`);
    await q(`CREATE INDEX orders_user_id_idx ON orders (user_id);`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS orders;`);
  },
};
