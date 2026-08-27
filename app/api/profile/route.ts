import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
	const u = await currentUser();
	if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const b = await req.json();
	const profileImage = typeof b.profileImage === "string" ? b.profileImage : "";
	if (profileImage.length > 2_500_000) {
		return NextResponse.json({ error: "Profile picture must be smaller than 2 MB." }, { status: 413 });
	}

	const data: any = {};
	for (const field of ["name", "phone", "college", "degree", "branch", "semester", "skills", "bio", "github", "linkedin", "portfolio"]) {
		if (typeof b[field] === "string") data[field] = b[field];
	}
	if (typeof b.profileImage === "string") data.profileImage = profileImage;
	if (b.graduationYear) data.graduationYear = Number(b.graduationYear);
	await db.user.update({ where: { id: u.id }, data });
	return NextResponse.json({ ok: true });
	if (b.graduationYear) data.graduationYear = Number(b.graduationYear);
	await db.user.update({ where: { id: u.id }, data });
	return NextResponse.json({ ok: true });
}
