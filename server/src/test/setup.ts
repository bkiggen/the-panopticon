// Set environment BEFORE any imports
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "1d";

import { beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../lib/prisma";

beforeAll(async () => {
  // Any global setup before all tests
});

afterAll(async () => {
  // Disconnect prisma after all tests
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data before each test if needed
  // This runs before each test file
});
