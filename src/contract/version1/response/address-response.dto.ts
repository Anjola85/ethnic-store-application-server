export interface AddressRespDto {
  id: number;
  isPrimary: boolean;
  unit?: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
}
