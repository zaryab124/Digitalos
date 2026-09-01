import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = signupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid input data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const {
      phoneNumber,
      email,
      password,
      fullName,
      fullNameUr,
      cityId,
      role,
      preferredLanguage,
    } = validated.data;

    // Check if phone or email already registered
    const existingPhone = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PHONE_ALREADY_EXISTS",
            message: "A user with this phone number is already registered.",
          },
        },
        { status: 409 }
      );
    }

    if (email && email.trim() !== "") {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EMAIL_ALREADY_EXISTS",
              message: "A user with this email address is already registered.",
            },
          },
          { status: 409 }
        );
      }
    }

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CITY_NOT_FOUND",
            message: "The selected city does not exist.",
          },
        },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        email: email && email.trim() !== "" ? email : null,
        passwordHash,
        fullName,
        fullNameUr,
        cityId,
        preferredLanguage,
        isPhoneVerified: true, // Auto-verify on registration in MVP
        roles: {
          create: [{ roleId: role }],
        },
      },
      include: {
        roles: true,
        city: true,
      },
    });

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
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An internal server error occurred while creating your account.",
        },
      },
      { status: 500 }
    );
  }
}
