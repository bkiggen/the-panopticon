# Panopticon Roadmap

## 🛠️ Admin/Maintenance

### Scraper Health Dashboard
**Priority: High**

Track the health and reliability of all scrapers to ensure data quality and uptime.

**Features:**
- Dashboard showing last successful run for each scraper
- Failed scraper alerts with error details
- Success/failure rate over time (7 days, 30 days)
- Average scrape duration metrics
- Theatre coverage status (which theatres have fresh data)

**Technical Notes:**
- Store scraper run logs in database
- Track: timestamp, scraper name, status (success/failure), error message, event count
- Add cron job monitoring with alerting

---

### Event Deduplication
**Priority: Medium**

Automatically detect and merge duplicate movie events to maintain clean data.

**Features:**
- Detect duplicates based on: title similarity, date, theatre, format
- Fuzzy matching for titles (handle "The Godfather" vs "GODFATHER" vs "The Godfather (1972)")
- Admin UI to review and approve merges
- Merge strategy: combine showtimes, preserve best image/description
- Log all merge actions for audit trail

**Technical Notes:**
- Use string similarity algorithms (Levenshtein distance)
- Consider same movie = 85%+ title match + same date + same theatre
- Merge on scraper run vs. manual admin action
- Keep original events in archive table

---

### Change Detection
**Priority: Low**

Track changes to showtimes and alert when theatres update their schedules.

**Features:**
- "What changed since last scrape" diff view
- Track: new events added, events removed, showtime changes
- Alert admins when showtimes are updated
- Display "Updated 2 hours ago" badges on events
- Change history log per event

**Technical Notes:**
- Create snapshot of events before each scrape
- Compare new scrape results to snapshot
- Store diffs in changelog table
- Optional: notify users following specific movies

---

## Implementation Order

1. **Scraper Health Dashboard** (most critical for operations)
2. **Event Deduplication** (improves data quality)
3. **Change Detection** (nice-to-have, builds on scraper infrastructure)
