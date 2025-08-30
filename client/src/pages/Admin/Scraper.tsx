import { Button } from "@mui/material";
import { AdminService } from "@/services/adminService";

export const Scraper = () => {
  const handleScrape = async () => {
    await AdminService.runScrapers();
  };

  return (
    <div>
      <Button onClick={handleScrape}>Trigger Data Scraping</Button>
    </div>
  );
};
