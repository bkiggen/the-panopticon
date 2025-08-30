import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import BulkMovieEventUpload from "./Upload";
import { Scraper } from "./Scraper";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    "aria-controls": `admin-tabpanel-${index}`,
  };
}

export const Admin = () => {
  const [value, setValue] = useState(0);

  // @ts-expect-error TS2345
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="admin tabs">
          <Tab label="Bulk Upload" {...a11yProps(0)} />
          <Tab label="Trigger" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <BulkMovieEventUpload />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Scraper />
      </TabPanel>
    </Box>
  );
};
