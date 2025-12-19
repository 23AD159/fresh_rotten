export const COIMBATORE_REGION_CITIES = [
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Pollachi", lat: 10.6686, lon: 77.0064 },
  { name: "Tiruppur", lat: 11.1085, lon: 77.3411 },
  { name: "Erode", lat: 11.3410, lon: 77.7172 },
  { name: "Salem", lat: 11.6643, lon: 78.1460 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Karur", lat: 10.9603, lon: 78.0766 },
  { name: "Dindigul", lat: 10.3676, lon: 77.9800 },
  { name: "Nilgiris", lat: 11.4000, lon: 76.7000 },
  { name: "Udumalpet", lat: 10.9450, lon: 77.2800 }
];

export const getCityList = () => COIMBATORE_REGION_CITIES.map(c => c.name);

export const getCityCoords = (cityName) => {
  const c = COIMBATORE_REGION_CITIES.find(x => x.name === cityName);
  return c ? { lat: c.lat, lon: c.lon } : null;
};