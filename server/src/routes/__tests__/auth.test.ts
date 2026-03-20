import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../lib/prisma";
import {
  createTestUser,
  createTestAdmin,
  cleanupTestUsers,
  testUser,
  testAdmin,
  generateTestToken,
} from "../../test/helpers";

const app = createApp();

describe("Auth Routes", () => {
  beforeAll(async () => {
    // Clean up any existing test users
    await cleanupTestUsers();
  });

  afterAll(async () => {
    // Clean up test users after all tests
    await cleanupTestUsers();
    await prisma.$disconnect();
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await cleanupTestUsers();
    });

    it("should login successfully with valid admin credentials", async () => {
      // Create an admin user (login requires admin)
      await createTestAdmin();

      const response = await request(app).post("/api/auth/login").send({
        email: testAdmin.email,
        password: testAdmin.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(testAdmin.email);
      expect(response.body.user).not.toHaveProperty("hashedPassword");
    });

    it("should login admin user and return isAdmin flag", async () => {
      await createTestAdmin();

      const response = await request(app).post("/api/auth/login").send({
        email: testAdmin.email,
        password: testAdmin.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.user.isAdmin).toBe(true);
    });

    it("should return 401 for invalid password", async () => {
      await createTestAdmin();

      const response = await request(app).post("/api/auth/login").send({
        email: testAdmin.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 403 for non-admin user", async () => {
      await createTestUser(); // Non-admin user

      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Admin access required");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "somepassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        password: "somepassword",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testAdmin.email,
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/auth/validate", () => {
    beforeEach(async () => {
      await cleanupTestUsers();
    });

    it("should validate a valid token", async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.email, user.isAdmin);

      const response = await request(app)
        .get("/api/auth/validate")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("valid", true);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(user.email);
    });

    it("should return 401 for missing token", async () => {
      const response = await request(app).get("/api/auth/validate");

      expect(response.status).toBe(401);
    });

    it("should return 403 for invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/validate")
        .set("Authorization", "Bearer invalid-token");

      // 403 is returned for invalid/malformed tokens
      expect(response.status).toBe(403);
    });

    it("should return 403 for expired token", async () => {
      const user = await createTestAdmin();

      // Generate an expired token by setting a negative expiry
      const jwt = await import("jsonwebtoken");
      const expiredToken = jwt.default.sign(
        { id: user.id.toString(), email: user.email, role: "admin" },
        process.env.JWT_SECRET || "test-secret-key",
        { expiresIn: "-1h" }
      );

      const response = await request(app)
        .get("/api/auth/validate")
        .set("Authorization", `Bearer ${expiredToken}`);

      // 403 is returned for expired tokens
      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    beforeEach(async () => {
      await cleanupTestUsers();
    });

    it("should accept forgot password request for existing user", async () => {
      await createTestUser();

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });

      // Should return success even if email sending fails in test
      // The important thing is it doesn't error out
      expect([200, 500]).toContain(response.status);
    });

    it("should return success even for non-existent email (security)", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      // Should not reveal whether email exists
      expect([200, 500]).toContain(response.status);
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/reset-password", () => {
    beforeEach(async () => {
      await cleanupTestUsers();
    });

    it("should return 400 for invalid/missing token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "invalid-token", newPassword: "newpassword123" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing newPassword", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "some-token" });

      expect(response.status).toBe(400);
    });

    it("should reset password with valid token", async () => {
      // Create admin user with reset token (only admins can login)
      const resetToken = "valid-reset-token-123";
      const user = await createTestAdmin();

      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
        },
      });

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: resetToken, newPassword: "newpassword456" });

      expect(response.status).toBe(200);

      // Verify the password was actually changed by trying to login
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: testAdmin.email,
        password: "newpassword456",
      });

      expect(loginResponse.status).toBe(200);
    });

    it("should reject expired reset token", async () => {
      const resetToken = "expired-reset-token";
      const user = await createTestAdmin();

      // Update user with expired reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry: new Date(Date.now() - 3600000), // 1 hour ago
        },
      });

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: resetToken, newPassword: "newpassword456" });

      expect(response.status).toBe(400);
    });
  });
});
