export interface AddressResponseDto {
  id: number;
  primary: boolean;
  unit: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  location: string;
  latitude: number;
  longitude: number;
}
