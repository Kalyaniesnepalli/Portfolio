
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import clientPromise from "@/lib/mongodb";


export async function POST(request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (
      !name ||
      !email ||
      !message ||
      name.length > 100 ||
      email.length > 254 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "Please enter valid contact details." },
        { status: 400 }
      );
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(
      process.env.MONGODB_DB || "Portfolio"
    );

    await db.collection("Userdata").insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    // Email is optional during initial frontend development.
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipient = process.env.CONTACT_EMAIL;

    if (smtpHost && smtpUser && smtpPass && recipient) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio" <${smtpUser}>`,
        to: email,
        replyTo: recipient,
        subject: "Thank you for contacting us",
        text: `Hi ${name},\n\nThank you for reaching out! Your message has been received. I'll get back to you as soon as possible.\n\nBest regards,\nAryan`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your message was received successfully.",
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Unable to process your request right now." },
      { status: 500 }
    );
  }
}
