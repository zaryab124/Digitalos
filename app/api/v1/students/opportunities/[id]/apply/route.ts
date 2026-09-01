import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required to apply." } },
      { status: 401 }
    );
  }

  const { id: opportunityId } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Opportunity not found." } },
      { status: 404 }
    );
  }

  // Find or auto-provision StudentProfile
  let student = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    student = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        cityId: user.cityId,
        institutionName: "Govt College Jampur",
        educationLevel: "BACHELORS",
      },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { coverLetter, resumeUrl } = body;

    // Check duplicate
    const existing = await prisma.opportunityApplication.findUnique({
      where: {
        opportunityId_studentId: {
          opportunityId,
          studentId: student.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "DUPLICATE_APPLICATION", message: "You have already submitted an application for this opportunity." },
        },
        { status: 400 }
      );
    }

    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId,
        studentId: student.id,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || null,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully.",
        data: { application },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Opportunity application error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit application." } },
      { status: 500 }
    );
  }
}
