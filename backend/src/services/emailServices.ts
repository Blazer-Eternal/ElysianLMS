import { environment } from "../config";

// Delivery adapter for authentication emails. No SMTP/provider is configured
// in this project yet, so this module is the single seam where one plugs in.
//
// Current behaviour:
//   - development: the reset link is printed to the server console
//   - production: a warning is logged and the link is NOT emitted anywhere
//     (the API still returns a generic "if the email exists" response, so
//     password reset effectively waits until an email provider is wired up)
export class EmailServices {
  private constructor() {}

  public static sendPasswordResetEmail(email: string, resetUrl: string): void {
    if (environment === "production") {
      console.warn(
        `[email] password reset requested for ${email} but no email provider is configured — link not delivered. ` +
          `Configure an SMTP/provider in EmailServices before enabling password reset in production.`
      );
      return;
    }

    console.info(`[email] password reset link for ${email}:\n  ${resetUrl}`);
  }

  // Verification code for a Google sign-in whose email isn't verified yet.
  // Same delivery seam as password reset: console in dev, a real provider in
  // production. The code is 6 digits and short-lived — never log it in prod.
  public static sendVerificationOtp(email: string, code: string, ttlMin: number): void {
    if (environment === "production") {
      console.warn(
        `[email] verification requested for ${email} but no email provider is configured — code not delivered. ` +
          `Configure an SMTP/provider in EmailServices before enabling email verification in production.`
      );
      return;
    }

    console.info(
      `[email] verification code for ${email} (valid ${ttlMin} min):\n  ${code}`
    );
  }
}
