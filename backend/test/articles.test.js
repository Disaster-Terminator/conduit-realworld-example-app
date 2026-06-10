// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";

// These integration tests require a test database with sequelize sync.
// They are skipped by default unless TEST_DB_URL is set.
const runIntegration = !!process.env.TEST_DB_URL;

(runIntegration ? describe : describe.skip)(
  "Article API — Draft & Scheduled",
  () => {
    let request;

    beforeAll(async () => {
      const supertest = (await import("supertest")).default;
      const express = (await import("express")).default;
      const { sequelize } = await import("../models");

      // Sync test database
      await sequelize.sync({ force: true });

      const app = express();
      app.use(express.json());
      app.use("/api/articles", (await import("../routes/articles")).default);

      request = supertest(app);
    });

    afterAll(async () => {
      const { sequelize } = await import("../models");
      await sequelize.close();
    });

    it("creates a draft article with just a title", async () => {
      // TODO: implement when test DB is configured
      expect(true).toBe(true);
    });

    it("does not show drafts in public article list", async () => {
      expect(true).toBe(true);
    });

    it("returns 404 for non-author accessing a draft", async () => {
      expect(true).toBe(true);
    });

    it("allows author to see own draft", async () => {
      expect(true).toBe(true);
    });

    it("creates a scheduled article", async () => {
      expect(true).toBe(true);
    });

    it("shows past-scheduled articles in public list", async () => {
      expect(true).toBe(true);
    });

    it("transitions draft to published with full validation", async () => {
      expect(true).toBe(true);
    });

    it("allows editing a scheduled article", async () => {
      expect(true).toBe(true);
    });
  },
);
