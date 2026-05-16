import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import emailService from "../services/emailService";

const MAGIC_LINK_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const requestMagicLink = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || !user.isAdmin) {
      return res.json({ message: "If an account exists for this email, a login link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const loginUrl = `${process.env.CLIENT_URL}/magic-link?token=${token}`;

    // In dev, log the link so you can test without email configured
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n🔗 [DEV] Magic link for ${email}:\n${loginUrl}\n`);
    }

    // Respond immediately — send email in background so SMTP latency never blocks the request
    res.json({ message: "If an account exists for this email, a login link has been sent." });

    emailService.sendMagicLinkEmail(email, token).catch((err) =>
      console.error("Failed to send magic link email:", err)
    );
  } catch (error) {
    console.error("Magic link request error:", error);
    res.status(500).json({ error: "Failed to send login link" });
  }
};

export const verifyMagicLink = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token?: string };

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired login link" });
    }

    // Clear token so it can't be reused
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: null, resetTokenExpiry: null },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const jwtToken = jwt.sign(
      { id: user.id.toString(), email: user.email, role: "admin" },
      jwtSecret,
      { expiresIn: "7d" } as jwt.SignOptions
    );

    res.json({
      token: jwtToken,
      user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    console.error("Magic link verify error:", error);
    res.status(500).json({ error: "Failed to verify login link" });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  res.json({ valid: true, user: req.user });
};
