import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jampur_digital_os_super_secret_jwt_key_2026_secure_key"
);

export const AUTH_COOKIE_NAME = "jdos_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface JWTPayloadData {
  userId: string;
  phone: string;
  email?: string | null;
  roles: string[];
  cityId: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createSessionToken(payload: JWTPayloadData): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<JWTPayloadData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayloadData;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        city: true,
      },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      fullName: user.fullName,
      fullNameUr: user.fullNameUr,
      avatarUrl: user.avatarUrl,
      preferredLanguage: user.preferredLanguage,
      cityId: user.cityId,
      city: user.city,
      roles: user.roles.map((r) => r.roleId),
      isPhoneVerified: user.isPhoneVerified,
    };
  } catch {
    return null;
  }
}
