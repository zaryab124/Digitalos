import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      city: true,
      applications: {
        include: { opportunity: true },
        orderBy: { appliedAt: "desc" },
      },
      listings: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: { profile },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      educationLevel,
      institutionName,
      fieldOfStudy,
      skills,
      interests,
      graduationYear,
      bio,
      cgpaOrMarks,
      cityId,
    } = body;

    const targetCityId = cityId || user.cityId;

    const skillsJson = typeof skills === "string" ? skills : JSON.stringify(skills || []);
    const interestsJson = typeof interests === "string" ? interests : JSON.stringify(interests || []);

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        educationLevel: educationLevel || "BACHELORS",
        institutionName: institutionName || "Govt College Jampur",
        fieldOfStudy: fieldOfStudy || null,
        skills: skillsJson,
        interests: interestsJson,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        bio: bio || null,
        cgpaOrMarks: cgpaOrMarks || null,
        cityId: targetCityId,
      },
      create: {
        userId: user.id,
        cityId: targetCityId,
        educationLevel: educationLevel || "BACHELORS",
        institutionName: institutionName || "Govt College Jampur",
        fieldOfStudy: fieldOfStudy || null,
        skills: skillsJson,
        interests: interestsJson,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        bio: bio || null,
        cgpaOrMarks: cgpaOrMarks || null,
      },
      include: { city: true },
    });

    // Ensure user has STUDENT role
    const hasRole = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: user.id, roleId: "STUDENT" } },
    });
    if (!hasRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: "STUDENT" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Student profile saved successfully.",
      data: { profile },
    });
  } catch (error) {
    console.error("Student profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to save student profile." } },
      { status: 500 }
    );
  }
}
