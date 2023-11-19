export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return regex.test(phoneNumber);
};
