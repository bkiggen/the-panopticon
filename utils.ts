export const getPacificTime = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });
};

export const getTodayInPacific = () => {
  const nowInPacific = getPacificTime();
  const todayInPacific = new Date(nowInPacific);
  todayInPacific.setHours(0, 0, 0, 0);
  return todayInPacific;
};

export const formatDateForPacific = (date: Date) => {
  return date.toISOString().split("T")[0];
};
