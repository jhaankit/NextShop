import type { StoreLocation } from "@/types/domain";

const weekdayHours = {
  Monday: "7:00 AM - 6:00 PM",
  Tuesday: "7:00 AM - 6:00 PM",
  Wednesday: "7:00 AM - 6:00 PM",
  Thursday: "7:00 AM - 6:00 PM",
  Friday: "7:00 AM - 6:00 PM",
  Saturday: "8:00 AM - 4:00 PM",
  Sunday: "Closed"
};

export const storeLocations: StoreLocation[] = [
  {
    id: "store_aus_001",
    name: "Harbor Paint & Design - Austin",
    address: { label: "Austin showroom", line1: "1200 South Congress Ave", city: "Austin", region: "TX", postalCode: "78704", country: "US" },
    position: { lat: 30.2502, lng: -97.7505 },
    phone: "(512) 555-0148",
    email: "austin@harborpaint.example",
    hours: weekdayHours,
    services: ["Color consultation", "Contractor desk", "Curbside pickup"]
  },
  {
    id: "store_dal_001",
    name: "Harbor Paint & Design - Dallas",
    address: { label: "Dallas design center", line1: "2140 McKinney Ave", city: "Dallas", region: "TX", postalCode: "75201", country: "US" },
    position: { lat: 32.7927, lng: -96.8039 },
    phone: "(214) 555-0173",
    email: "dallas@harborpaint.example",
    hours: { ...weekdayHours, Saturday: "8:00 AM - 2:00 PM" },
    services: ["Color consultation", "Delivery", "Pro account support"]
  },
  {
    id: "store_den_001",
    name: "Summit Paint Supply - Denver",
    address: { label: "Denver store", line1: "1701 Wynkoop St", city: "Denver", region: "CO", postalCode: "80202", country: "US" },
    position: { lat: 39.7527, lng: -104.999 },
    phone: "(303) 555-0194",
    email: "denver@summitpaint.example",
    hours: weekdayHours,
    services: ["Contractor desk", "Delivery", "Sample matching"]
  },
  {
    id: "store_phx_001",
    name: "Desert Coatings - Phoenix",
    address: { label: "Phoenix store", line1: "401 E Jefferson St", city: "Phoenix", region: "AZ", postalCode: "85004", country: "US" },
    position: { lat: 33.4469, lng: -112.0679 },
    phone: "(602) 555-0126",
    email: "phoenix@desertcoatings.example",
    hours: { ...weekdayHours, Saturday: "7:00 AM - 3:00 PM" },
    services: ["Exterior coatings", "Contractor desk", "Curbside pickup"]
  },
  {
    id: "store_la_001",
    name: "Pacific Color Studio - Los Angeles",
    address: { label: "Los Angeles studio", line1: "600 S Spring St", city: "Los Angeles", region: "CA", postalCode: "90014", country: "US" },
    position: { lat: 34.0441, lng: -118.2518 },
    phone: "(213) 555-0132",
    email: "losangeles@pacificcolor.example",
    hours: weekdayHours,
    services: ["Color consultation", "Sample matching", "Delivery"]
  },
  {
    id: "store_sf_001",
    name: "Bay Finish Supply - San Francisco",
    address: { label: "San Francisco store", line1: "1 Ferry Building", city: "San Francisco", region: "CA", postalCode: "94111", country: "US" },
    position: { lat: 37.7955, lng: -122.3937 },
    phone: "(415) 555-0188",
    email: "sf@bayfinish.example",
    hours: { ...weekdayHours, Sunday: "10:00 AM - 2:00 PM" },
    services: ["Color consultation", "Pro account support", "Curbside pickup"]
  },
  {
    id: "store_chi_001",
    name: "North Loop Paint Co. - Chicago",
    address: { label: "Chicago store", line1: "222 W Merchandise Mart Plz", city: "Chicago", region: "IL", postalCode: "60654", country: "US" },
    position: { lat: 41.8885, lng: -87.6354 },
    phone: "(312) 555-0119",
    email: "chicago@northlooppaint.example",
    hours: weekdayHours,
    services: ["Designer showroom", "Contractor desk", "Delivery"]
  },
  {
    id: "store_nyc_001",
    name: "Metro Finish Supply - New York",
    address: { label: "Manhattan store", line1: "110 W 34th St", city: "New York", region: "NY", postalCode: "10001", country: "US" },
    position: { lat: 40.7507, lng: -73.9896 },
    phone: "(212) 555-0161",
    email: "nyc@metrofinish.example",
    hours: { ...weekdayHours, Saturday: "9:00 AM - 5:00 PM" },
    services: ["Color consultation", "Sample matching", "Pro account support"]
  },
  {
    id: "store_atl_001",
    name: "Peachtree Paint Supply - Atlanta",
    address: { label: "Atlanta store", line1: "675 Ponce De Leon Ave NE", city: "Atlanta", region: "GA", postalCode: "30308", country: "US" },
    position: { lat: 33.7725, lng: -84.3651 },
    phone: "(404) 555-0170",
    email: "atlanta@peachtreepaint.example",
    hours: weekdayHours,
    services: ["Delivery", "Contractor desk", "Curbside pickup"]
  },
  {
    id: "store_mia_001",
    name: "Coastal Color Supply - Miami",
    address: { label: "Miami store", line1: "701 S Miami Ave", city: "Miami", region: "FL", postalCode: "33131", country: "US" },
    position: { lat: 25.7677, lng: -80.1937 },
    phone: "(305) 555-0199",
    email: "miami@coastalcolor.example",
    hours: { ...weekdayHours, Saturday: "8:00 AM - 5:00 PM" },
    services: ["Exterior coatings", "Color consultation", "Delivery"]
  }
];
