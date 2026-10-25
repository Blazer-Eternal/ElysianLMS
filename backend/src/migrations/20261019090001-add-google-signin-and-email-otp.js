'use strict';

// Google Sign-In + email OTP verification.
//  - users gains email_verified (the OTP gate) and google_sub (account linking).
//  - password_hash becomes nullable: Google-created accounts have no password.
//  - email_otps stores the active verification code per user with the attempt
//    and resend counters that drive the 2-minute / 3-attempt / 24-hour rules.
module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;`);
    await q(`ALTER TABLE users ADD COLUMN google_sub VARCHAR(255) NULL;`);
    await q(
      `CREATE UNIQUE INDEX users_google_sub_key ON users (google_sub) WHERE google_sub IS NOT NULL;`
    );

    // Google-only accounts have no password, so the NOT NULL guard has to go.
    await q(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`);

    await q(`
      CREATE TABLE email_otps (
        id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash    CHAR(64) NOT NULL,
        attempts     INTEGER NOT NULL DEFAULT 0,
        send_count   INTEGER NOT NULL DEFAULT 1,
        expires_at   TIMESTAMPTZ NOT NULL,
        locked_until TIMESTAMPTZ NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // Exactly one active verification row per user (resend updates in place).
    await q(`CREATE UNIQUE INDEX email_otps_user_id_key ON email_otps (user_id);`);

    await q(`
      CREATE TRIGGER trg_email_otps_updated_at
      BEFORE UPDATE ON email_otps
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);
  },

  async down(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    await q(`DROP TABLE IF EXISTS email_otps;`);
    await q(`DROP INDEX IF EXISTS users_google_sub_key;`);
    await q(`ALTER TABLE users DROP COLUMN IF EXISTS google_sub;`);
    await q(`ALTER TABLE users DROP COLUMN IF EXISTS email_verified;`);
    await q(`ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;`);
  },
};
