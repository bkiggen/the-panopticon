// Hollywood Theatre Manual Scraper
// Instructions:
// 1. Visit https://hollywoodtheatre.org/showtimes/
// 2. Open browser console (F12)
// 3. Paste this entire script and press Enter
// 4. Wait for it to scrape all months
// 5. Copy the JSON output and paste into Bulk Movie Event Upload

(async function() {
  const THEATRE_NAME = 'Hollywood Theatre';

  console.log('🎬 Hollywood Theatre Manual Scraper Starting...\n');
  console.log('This will take a few minutes to scrape 3 months of data.\n');

  class HollywoodManualScraper {
    constructor() {
      this.allEvents = [];
    }

    // Clean movie title (remove "in 35mm", etc.)
    cleanTitle(title) {
      return title
        .replace(/\s+in\s+(35mm|16mm|70mm)$/i, '')
        .replace(/\s+with\s+.+$/i, '')
        .trim();
    }

    // Detect format from title
    detectFormat(title) {
      if (/in\s+35mm/i.test(title)) return '35mm';
      if (/in\s+16mm/i.test(title)) return '16mm';
      if (/in\s+70mm/i.test(title)) return '70mm';
      return 'Digital';
    }

    // Scrape current calendar view
    scrapeCurrentCalendar() {
      const events = [];
      const movieEvents = document.querySelectorAll('.fc-event, .fc-daygrid-event');

      console.log(`   Found ${movieEvents.length} event elements in DOM`);

      movieEvents.forEach((eventEl) => {
        try {
          // Get date from parent cell
          const dateCell = eventEl.closest('[data-date]');
          if (!dateCell) return;

          const date = dateCell.getAttribute('data-date');
          if (!date) return;

          // Get title
          const titleEl = eventEl.querySelector('.fc-event-title, [class*="title"]');
          if (!titleEl) return;

          const rawTitle = titleEl.textContent.trim();
          if (!rawTitle) return;

          // Get times (as array of strings, not objects)
          const times = [];
          const timeElements = eventEl.querySelectorAll('span');
          timeElements.forEach(span => {
            const timeText = span.textContent.trim();
            if (timeText.match(/\d{1,2}:\d{2}\s*(am|pm)/i)) {
              times.push(timeText); // Just the string, not {time: timeText}
            }
          });

          // Get image from FullCalendar data or DOM
          let imageUrl = '';
          try {
            if (eventEl.fcSeg?.eventRange?.def?.extendedProps?.image) {
              imageUrl = eventEl.fcSeg.eventRange.def.extendedProps.image;
            }
          } catch (e) {
            // FullCalendar data not available, will try DOM
          }

          if (!imageUrl) {
            const imageEl = eventEl.querySelector('[style*="background-image"]');
            if (imageEl) {
              const bgImage = imageEl.style.backgroundImage;
              const match = bgImage.match(/url\(["']?(.+?)["']?\)/);
              if (match) imageUrl = match[1];
            }
          }

          // Get detail URL from FullCalendar data
          let detailUrl = null;
          try {
            if (eventEl.fcSeg?.eventRange?.def?.extendedProps?.permalink) {
              detailUrl = eventEl.fcSeg.eventRange.def.extendedProps.permalink;
            }
          } catch (e) {
            // FullCalendar data not available
          }

          // Clean title (remove "in 35mm" etc)
          const cleanedTitle = this.cleanTitle(rawTitle);

          if (rawTitle && times.length > 0) {
            events.push({
              date,
              title: cleanedTitle,
              originalTitle: rawTitle,
              times: times.length > 0 ? times : ['7:00 PM'], // Array of strings
              detailUrl: detailUrl,
              format: this.detectFormat(rawTitle),
              imageUrl,
              theatre: THEATRE_NAME,
              accessibility: null,
              discount: null,
            });
          }
        } catch (error) {
          console.warn('Error processing event:', error);
        }
      });

      return events;
    }

    // Click next month button
    async clickNextMonth() {
      const nextButton = document.querySelector('.fc-next-button');
      if (!nextButton) return false;

      nextButton.click();

      // Wait longer for calendar to reload and FullCalendar to attach event data
      await this.delay(3000, 4000);

      // Extra wait to ensure FullCalendar event data is attached
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    }

    // Delay helper
    async delay(min = 1000, max = 3000) {
      const ms = Math.random() * (max - min) + min;
      await new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main scraping method
    async scrape(monthsToScrape = 3) {
      console.log(`📅 Scraping ${monthsToScrape} months of events...\n`);

      for (let month = 0; month < monthsToScrape; month++) {
        console.log(`📊 Scraping month ${month + 1}/${monthsToScrape}...`);

        const events = this.scrapeCurrentCalendar();
        this.allEvents.push(...events);

        console.log(`   Found ${events.length} events`);

        if (month < monthsToScrape - 1) {
          const hasNext = await this.clickNextMonth();
          if (!hasNext) {
            console.log('   No more months available');
            break;
          }
        }
      }

      console.log(`\n✅ Scraping complete! Found ${this.allEvents.length} total events\n`);
      return this.allEvents;
    }

    // Output events as JSON
    outputJSON(events) {
      console.log(`\n📊 Scraped ${events.length} events from ${THEATRE_NAME}\n`);
      console.log('✅ Copy the JSON below and paste it into the Bulk Movie Event Upload:\n');
      console.log('═'.repeat(60));
      console.log(JSON.stringify(events, null, 2));
      console.log('═'.repeat(60));
      console.log('\n📋 Instructions:');
      console.log('1. Select all the JSON above (between the lines)');
      console.log('2. Copy it (Ctrl+C / Cmd+C)');
      console.log('3. Go to your Admin → Bulk Movie Event Upload');
      console.log('4. Paste the JSON and click Upload\n');
    }
  }

  // Run the scraper
  try {
    const scraper = new HollywoodManualScraper();
    const events = await scraper.scrape(3); // Scrape 3 months

    if (events.length > 0) {
      scraper.outputJSON(events);
    } else {
      console.log('⚠️  No events found. Make sure you are on the showtimes page!');
    }
  } catch (error) {
    console.error('💥 Scraper error:', error);
  }
})();
