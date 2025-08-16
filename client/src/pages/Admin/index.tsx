import { Button } from "@mui/material";
import { AdminService } from "@/services/adminService";

export const Admin = () => {
  const handleScrape = async () => {
    await AdminService.runScrapers();
  };

  return (
    <div>
      <Button onClick={handleScrape}>Scrape</Button>
    </div>
  );
};
