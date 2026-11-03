export interface DemoRider {
  id: string;
  name: string;
  type: "in_house" | "shared";
  typeLabel: string;
  pharmacyName?: string;
  phone: string;
  vehicle: string;
  rating: string;
  eta: string;
  status: "Available at shop" | "2 mins away" | "4 mins away" | "On Delivery";
}

export const DEMO_RIDERS: DemoRider[] = [
  {
    id: "rider-ramu",
    name: "Ramu",
    type: "in_house",
    typeLabel: "Store In-House Rider",
    pharmacyName: "Shree Ganesh Medicals",
    phone: "+91 98765 22001",
    vehicle: "Bajaj Platina (KA-03-HF-4412)",
    rating: "4.9★",
    eta: "Ready at store counter",
    status: "Available at shop"
  },
  {
    id: "rider-kiran",
    name: "Kiran",
    type: "in_house",
    typeLabel: "Store In-House Rider",
    pharmacyName: "Shree Ganesh Medicals",
    phone: "+91 98765 22002",
    vehicle: "Hero Electric Scooter (KA-03-EV-1120)",
    rating: "4.8★",
    eta: "Ready at store counter",
    status: "Available at shop"
  },
  {
    id: "rider-ravi",
    name: "Ravi Kumar",
    type: "shared",
    typeLabel: "ArogyaSwift Shared Partner (Ekart)",
    phone: "+91 98765 99887",
    vehicle: "TVS Jupiter (KA-04-AB-9921)",
    rating: "4.9★",
    eta: "2 mins away · Indiranagar",
    status: "2 mins away"
  },
  {
    id: "rider-sunil",
    name: "Sunil Das",
    type: "shared",
    typeLabel: "ArogyaSwift Shared Partner (Dunzo Fleet)",
    phone: "+91 98765 33004",
    vehicle: "Ather 450X (KA-01-EL-7788)",
    rating: "4.8★",
    eta: "4 mins away · Defence Colony",
    status: "4 mins away"
  }
];

export const getRiderById = (id?: string) => {
  return DEMO_RIDERS.find((r) => r.id === id) || DEMO_RIDERS[0];
};

export const getRiderByName = (name?: string) => {
  if (!name) return undefined;
  return DEMO_RIDERS.find((r) => name.toLowerCase().includes(r.name.toLowerCase()));
};

