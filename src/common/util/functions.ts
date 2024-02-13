export const getCurrentEpochTime = (): number => {
  return Math.floor(new Date().getTime() / 1000);
};
