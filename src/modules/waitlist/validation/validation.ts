export const customerValidation = (data: any) => {
  const { firstName, lastName, mobile, email, zipCode, country, promotions } =
    data;
  if (!firstName) {
    throw new Error('First name is required');
  }
  if (!lastName) {
    throw new Error('Last name is required');
  }
  if (!mobile) {
    throw new Error('Mobile is required');
  }

  if (!mobile.countryCode) {
    throw new Error('Country code is required');
  }

  if (!mobile.phoneNumber) {
    throw new Error('Phone number is required');
  }

  if (!mobile.isoType) {
    throw new Error('ISO code is required');
  }

  if (!email) {
    throw new Error('Email is required');
  }
  if (!zipCode) {
    throw new Error('Zip code is required');
  }
  if (!country) {
    throw new Error('Country is required');
  }
  if (promotions === undefined || promotions === null) {
    throw new Error('Promotions is required');
  }

  return null;
};

export const businessValidation = (data: any) => {
  const { name, mobile, email, address, businessType, countryEthnicity } = data;

  if (!name) {
    throw new Error('name is required');
  }
  if (!mobile) {
    throw new Error('Mobile is required');
  }

  if (
    !mobile.countryCode ||
    mobile.countryCode === undefined ||
    mobile.countryCode === ''
  ) {
    throw new Error('Country code is required');
  }

  if (!mobile.phoneNumber) {
    throw new Error('Phone number is required');
  }

  if (!mobile.isoType) {
    throw new Error('ISO type is required');
  }

  if (!email) {
    throw new Error('Email is required');
  }
  if (!address) {
    throw new Error('Address is required');
  }
  // if (!address.street) {
  //   throw new Error('Street is required');
  // }
  // if (!address.city) {
  //   throw new Error('City is required');
  // }
  // if (!address.province) {
  //   throw new Error('Province is required');
  // }
  // if (!address.postalCode) {
  //   throw new Error('Postal code is required');
  // }
  // if (!address.country) {
  //   throw new Error('Country is required');
  // }
  if (!businessType) {
    throw new Error('Business type is required');
  }

  if (!countryEthnicity) {
    throw new Error('country ethnicity is required');
  }

  return null;
};

export const shopperValidation = (data: any) => {
  const { firstName, lastName, mobile, email, zipCode, country, age } = data;
  if (!firstName) {
    throw new Error('First name is required');
  }
  if (!lastName) {
    throw new Error('Last name is required');
  }
  if (!mobile) {
    throw new Error('Mobile is required');
  }

  if (!mobile.countryCode) {
    throw new Error('Country code is required');
  }

  if (!mobile.phoneNumber) {
    throw new Error('Phone number is required');
  }

  if (!mobile.isoType) {
    throw new Error('ISO code is required');
  }

  if (!email) {
    throw new Error('Email is required');
  }
  if (!zipCode) {
    throw new Error('Zip code is required');
  }
  if (!country) {
    throw new Error('Country is required');
  }
  if (!age) {
    throw new Error('Age is required');
  }

  return null;
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return regex.test(phoneNumber);
};
