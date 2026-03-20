import { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

// Test user data
export const testUser = {
  email: "test@example.com",
  password: "testpassword123",
  name: "Test User",
};

export const testAdmin = {
  email: "admin@example.com",
  password: "adminpassword123",
  name: "Admin User",
  isAdmin: true,
};

/**
 * Create a test user in the database
 */
export async function createTestUser(userData = testUser, isAdmin = false) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      hashedPassword,
      isAdmin,
    },
  });
}

/**
 * Create a test admin user
 */
export async function createTestAdmin() {
  return createTestUser(testAdmin, true);
}

/**
 * Generate a valid JWT token for a user
 * Note: Token format must match production (authController.ts)
 */
export function generateTestToken(userId: number, email: string, isAdmin = false) {
  return jwt.sign(
    {
      id: userId.toString(), // Convert to string like production
      email,
      role: isAdmin ? "admin" : "user", // Use role, not isAdmin
    },
    process.env.JWT_SECRET || "test-secret-key",
    { expiresIn: "1d" }
  );
}

/**
 * Clean up test users
 */
export async function cleanupTestUsers() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [testUser.email, testAdmin.email],
      },
    },
  });
}

/**
 * Clean up all movie events (useful for integration tests)
 */
export async function cleanupMovieEvents() {
  await prisma.movieEvent.deleteMany({});
}

/**
 * Create a test movie event
 */
export async function createTestMovieEvent(overrides = {}) {
  const defaultEvent = {
    date: new Date(),
    title: "Test Movie",
    originalTitle: "Test Movie",
    times: ["7:00 PM", "9:30 PM"],
    format: "Digital",
    imageUrl: "https://example.com/image.jpg",
    genres: ["Drama", "Action"],
    theatre: "Test Theater",
    accessibility: [],
    discount: [],
  };

  return prisma.movieEvent.create({
    data: { ...defaultEvent, ...overrides },
  });
}

/**
 * Make an authenticated request
 */
export function authRequest(app: Express, token: string) {
  return {
    get: (url: string) =>
      request(app).get(url).set("Authorization", `Bearer ${token}`),
    post: (url: string) =>
      request(app).post(url).set("Authorization", `Bearer ${token}`),
    put: (url: string) =>
      request(app).put(url).set("Authorization", `Bearer ${token}`),
    delete: (url: string) =>
      request(app).delete(url).set("Authorization", `Bearer ${token}`),
  };
}
