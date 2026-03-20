import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../lib/prisma";
import {
  createTestAdmin,
  createTestMovieEvent,
  cleanupTestUsers,
  cleanupMovieEvents,
  generateTestToken,
  authRequest,
} from "../../test/helpers";

const app = createApp();

describe("Movie Events Routes", () => {
  let adminToken: string;
  let adminId: number;

  beforeAll(async () => {
    await cleanupTestUsers();
    await cleanupMovieEvents();

    // Create an admin user for authenticated tests
    const admin = await createTestAdmin();
    adminId = admin.id;
    adminToken = generateTestToken(admin.id, admin.email, true);
  });

  afterAll(async () => {
    await cleanupMovieEvents();
    await cleanupTestUsers();
    await prisma.$disconnect();
  });

  describe("GET /api/movie-events", () => {
    beforeEach(async () => {
      await cleanupMovieEvents();
    });

    it("should return empty array when no events exist", async () => {
      const response = await request(app).get("/api/movie-events");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("events");
      expect(response.body.events).toEqual([]);
      expect(response.body).toHaveProperty("total", 0);
    });

    it("should return paginated events", async () => {
      // Create multiple test events
      await createTestMovieEvent({ title: "Movie 1" });
      await createTestMovieEvent({ title: "Movie 2" });
      await createTestMovieEvent({ title: "Movie 3" });

      const response = await request(app)
        .get("/api/movie-events")
        .query({ page: 1, limit: 2 }); // API uses 'limit' not 'pageSize'

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.totalPages).toBe(2);
    });

    it("should filter events by theatre", async () => {
      await createTestMovieEvent({ title: "Movie 1", theatre: "Cinema A" });
      await createTestMovieEvent({ title: "Movie 2", theatre: "Cinema B" });
      await createTestMovieEvent({ title: "Movie 3", theatre: "Cinema A" });

      const response = await request(app)
        .get("/api/movie-events")
        .query({ theatres: "Cinema A" });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(2);
      expect(
        response.body.events.every((e: { theatre: string }) => e.theatre === "Cinema A")
      ).toBe(true);
    });

    it("should filter events by search term", async () => {
      await createTestMovieEvent({ title: "The Matrix" });
      await createTestMovieEvent({ title: "Inception" });
      await createTestMovieEvent({ title: "The Matrix Reloaded" });

      const response = await request(app)
        .get("/api/movie-events")
        .query({ search: "Matrix" });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(2);
    });

    it("should filter events by format", async () => {
      await createTestMovieEvent({ title: "Movie 1", format: "35mm" });
      await createTestMovieEvent({ title: "Movie 2", format: "Digital" });
      await createTestMovieEvent({ title: "Movie 3", format: "35mm" });

      const response = await request(app)
        .get("/api/movie-events")
        .query({ formats: "35mm" });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(2);
    });

    it("should filter events by date range", async () => {
      // Create dates at noon to avoid timezone boundary issues
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await createTestMovieEvent({ title: "Today", date: today });
      await createTestMovieEvent({ title: "Tomorrow", date: tomorrow });
      await createTestMovieEvent({ title: "Next Week", date: nextWeek });

      // Query with date range that includes today and tomorrow (endDate is exclusive boundary)
      const response = await request(app)
        .get("/api/movie-events")
        .query({
          startDate: today.toISOString().split("T")[0],
          endDate: dayAfter.toISOString().split("T")[0], // Day after tomorrow to include tomorrow
        });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(2);
    });
  });

  describe("GET /api/movie-events/:id", () => {
    it("should return a specific event by id", async () => {
      const event = await createTestMovieEvent({ title: "Specific Movie" });

      const response = await request(app).get(`/api/movie-events/${event.id}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Specific Movie");
      expect(response.body.id).toBe(event.id);
    });

    it("should return 404 for non-existent event", async () => {
      const response = await request(app).get("/api/movie-events/99999");

      expect(response.status).toBe(404);
    });

    it("should return 500 for invalid id (NaN causes Prisma error)", async () => {
      // parseInt("invalid") returns NaN, which causes Prisma to throw
      const response = await request(app).get("/api/movie-events/invalid");

      // The controller parses as NaN, Prisma throws an error -> 500
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/movie-events (Admin only)", () => {
    beforeEach(async () => {
      await cleanupMovieEvents();
    });

    it("should create a new event when authenticated as admin", async () => {
      const eventData = {
        date: new Date().toISOString(),
        title: "New Movie",
        originalTitle: "New Movie",
        times: ["7:00 PM"],
        format: "Digital",
        imageUrl: "https://example.com/image.jpg",
        genres: ["Action"],
        theatre: "Test Theater",
        accessibility: [],
        discount: [],
      };

      const response = await authRequest(app, adminToken)
        .post("/api/movie-events")
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("New Movie");
      expect(response.body).toHaveProperty("id");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(app).post("/api/movie-events").send({
        title: "New Movie",
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 for invalid event data", async () => {
      const response = await authRequest(app, adminToken)
        .post("/api/movie-events")
        .send({ title: "" }); // Missing required fields

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/movie-events/:id (Admin only)", () => {
    it("should update an existing event", async () => {
      const event = await createTestMovieEvent({ title: "Original Title" });

      const response = await authRequest(app, adminToken)
        .put(`/api/movie-events/${event.id}`)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated Title");
    });

    it("should return 401 when not authenticated", async () => {
      const event = await createTestMovieEvent();

      const response = await request(app)
        .put(`/api/movie-events/${event.id}`)
        .send({ title: "Updated" });

      expect(response.status).toBe(401);
    });

    it("should return 400 for non-existent event", async () => {
      const response = await authRequest(app, adminToken)
        .put("/api/movie-events/99999")
        .send({ title: "Updated" });

      // Update of non-existent returns 400 (prisma throws)
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/movie-events/:id (Admin only)", () => {
    it("should delete an existing event", async () => {
      const event = await createTestMovieEvent({ title: "To Delete" });

      const response = await authRequest(app, adminToken).delete(
        `/api/movie-events/${event.id}`
      );

      // Delete returns 204 No Content
      expect(response.status).toBe(204);

      // Verify it's actually deleted
      const checkResponse = await request(app).get(
        `/api/movie-events/${event.id}`
      );
      expect(checkResponse.status).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
      const event = await createTestMovieEvent();

      const response = await request(app).delete(
        `/api/movie-events/${event.id}`
      );

      expect(response.status).toBe(401);
    });

    it("should return 400 for non-existent event", async () => {
      const response = await authRequest(app, adminToken).delete(
        "/api/movie-events/99999"
      );

      // Delete of non-existent returns 400 (prisma throws)
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/movie-events/bulk (Admin only)", () => {
    beforeEach(async () => {
      await cleanupMovieEvents();
    });

    it("should create multiple events at once", async () => {
      const movieData = [
        {
          date: new Date().toISOString(),
          title: "Bulk Movie 1",
          originalTitle: "Bulk Movie 1",
          times: ["7:00 PM"],
          format: "Digital",
          imageUrl: "",
          genres: [],
          theatre: "Test Theater",
          accessibility: [],
          discount: [],
        },
        {
          date: new Date().toISOString(),
          title: "Bulk Movie 2",
          originalTitle: "Bulk Movie 2",
          times: ["9:00 PM"],
          format: "Digital",
          imageUrl: "",
          genres: [],
          theatre: "Test Theater",
          accessibility: [],
          discount: [],
        },
      ];

      const response = await authRequest(app, adminToken)
        .post("/api/movie-events/bulk")
        .send({ movieData });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("count", 2);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(app)
        .post("/api/movie-events/bulk")
        .send({ movieData: [] });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/movie-events/delete-all (Admin only)", () => {
    it("should delete all events", async () => {
      // Create some events first
      await createTestMovieEvent({ title: "Movie 1" });
      await createTestMovieEvent({ title: "Movie 2" });

      const response = await authRequest(app, adminToken).post(
        "/api/movie-events/delete-all"
      );

      expect(response.status).toBe(200);

      // Verify all are deleted
      const checkResponse = await request(app).get("/api/movie-events");
      expect(checkResponse.body.events).toHaveLength(0);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(app).post("/api/movie-events/delete-all");

      expect(response.status).toBe(401);
    });
  });
});
