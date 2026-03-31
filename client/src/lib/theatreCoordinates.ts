// Theatre coordinates for Portland, OR area
// Coordinates are [latitude, longitude]

export interface TheatreLocation {
  name: string;
  coordinates: [number, number];
  address: string;
  phone: string;
  website: string;
  neighborhood: string;
}

export const theatreLocations: TheatreLocation[] = [
  {
    name: "Academy Theater",
    coordinates: [45.5188, -122.5835], // 7818 SE Stark St
    address: "7818 SE Stark St, Portland, OR 97215",
    phone: "(503) 252-0500",
    website: "https://www.academytheaterpdx.com",
    neighborhood: "Montavilla",
  },
  {
    name: "Cinema 21",
    coordinates: [45.5269, -122.6945], // 616 NW 21st Ave
    address: "616 NW 21st Ave, Portland, OR 97209",
    phone: "(503) 223-4515",
    website: "https://cinema21.com",
    neighborhood: "Nob Hill",
  },
  {
    name: "Hollywood Theatre",
    coordinates: [45.5346, -122.6197], // 4122 NE Sandy Blvd
    address: "4122 NE Sandy Blvd, Portland, OR 97212",
    phone: "(503) 281-4215",
    website: "https://hollywoodtheatre.org",
    neighborhood: "Hollywood",
  },
  {
    name: "Clinton Street Theater",
    coordinates: [45.5034, -122.6335], // 2522 SE Clinton St
    address: "2522 SE Clinton St, Portland, OR 97202",
    phone: "(503) 238-8899",
    website: "https://cstpdx.com/",
    neighborhood: "Hosford-Abernethy",
  },
];

// Portland center coordinates for initial map view
export const PORTLAND_CENTER: [number, number] = [45.5152, -122.6784];
