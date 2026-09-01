import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  "jampur_digital_os_super_secret_jwt_key_2026_secure_key"
);

test("Auth: Password hashing and verification", async () => {
  const plainPassword = "SecretPassword@123";
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hashed, plainPassword, "Password hash must not match plain text");
  assert.equal(await bcrypt.compare(plainPassword, hashed), true, "Valid password should verify");
  assert.equal(await bcrypt.compare("WrongPassword", hashed), false, "Invalid password should fail");
});

test("Auth: JWT session creation and verification", async () => {
  const payload = {
    userId: "user_test_123",
    phone: "+923001234567",
    roles: ["CUSTOMER", "BUSINESS_OWNER"],
    cityId: "city_jampur_01",
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  assert.ok(token, "JWT token must be generated");

  const { payload: verified } = await jwtVerify(token, JWT_SECRET);
  assert.equal(verified.userId, payload.userId);
  assert.equal(verified.phone, payload.phone);
  assert.deepEqual(verified.roles, payload.roles);
  assert.equal(verified.cityId, payload.cityId);
});

test("Auth: Invalid JWT token rejection", async () => {
  const invalidToken = "invalid.jwt.token.string";
  await assert.rejects(
    async () => {
      await jwtVerify(invalidToken, JWT_SECRET);
    },
    "Invalid token must throw verification error"
  );
});
