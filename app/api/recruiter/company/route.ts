import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "RECRUITER" || !u.recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const companyMeta = {
      tagline: body.tagline || "",
      industry: body.industry || "",
      companySize: body.companySize || "",
      location: body.location || "",
      foundedYear: body.foundedYear || "",
      about: body.about || "",
      perks: body.perks || "",
      recruiterTitle: body.recruiterTitle || "",
      aiThreshold: Number(body.aiThreshold) || 70,
      emailNotifications: Boolean(body.emailNotifications ?? true),
      dailyDigest: Boolean(body.dailyDigest ?? true),
      interviewReminders: Boolean(body.interviewReminders ?? true)
    };

    // Update Recruiter record
    await db.recruiter.update({
      where: { id: u.recruiter.id },
      data: {
        companyName: body.companyName || u.recruiter.companyName,
        website: body.website !== undefined ? body.website : u.recruiter.website,
        description: JSON.stringify(companyMeta)
      }
    });

    // Update User record for recruiter contact info
    await db.user.update({
      where: { id: u.id },
      data: {
        name: body.recruiterName || u.name,
        phone: body.recruiterPhone !== undefined ? body.recruiterPhone : u.phone,
        bio: body.recruiterBio !== undefined ? body.recruiterBio : u.bio,
        linkedin: body.recruiterLinkedin !== undefined ? body.recruiterLinkedin : u.linkedin
      }
    });

    return NextResponse.json({ ok: true, message: "Company profile and settings saved successfully!" });
  } catch (error) {
    console.error("Failed to update recruiter company details:", error);
    return NextResponse.json({ error: "Failed to update company settings." }, { status: 500 });
  }
}
