import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Phone number/email and password are required.",
          },
        },
        { status: 400 }
      );
    }

    const { identifier, password } = validated.data;

    // Search user by phone or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: identifier },
          { phoneNumber: identifier.startsWith("+") ? identifier : `+92${identifier.replace(/^0/, "")}` },
          { email: identifier.toLowerCase() },
        ],
      },
      include: {
        roles: true,
        city: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid phone/email or password.",
          },
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_SUSPENDED",
            message: "Your account has been deactivated. Please contact administration.",
          },
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid phone/email or password.",
          },
        },
        { status: 401 }
      );
    }

    const userRoles = user.roles.map((r) => r.roleId);

    // Create session token
    const token = await createSessionToken({
      userId: user.id,
      phone: user.phoneNumber,
      email: user.email,
      roles: userRoles,
      cityId: user.cityId,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          fullName: user.fullName,
          fullNameUr: user.fullNameUr,
          preferredLanguage: user.preferredLanguage,
          city: user.city,
          roles: userRoles,
        },
      },
    });

    // Set secure HttpOnly cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An internal server error occurred during login.",
        },
      },
      { status: 500 }
    );
  }
}
