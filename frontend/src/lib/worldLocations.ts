/**
 * ArogyaSwift - World Locations, Countries, Dial Codes, and Area Zones
 * Comprehensive international directory supporting patient delivery addresses and area zones worldwide.
 */

export interface WorldCountry {
  code: string;       // ISO 2-letter code (e.g., 'IN', 'US')
  name: string;       // Country name
  flag: string;       // Flag emoji
  dialCode: string;   // International telephone dial code (e.g., '+91', '+1')
  zones: string[];    // Major / Popular Area Zones & Metropolitan Delivery Nodes
}

export const WORLD_COUNTRIES: WorldCountry[] = [
  // Top / High Frequency Countries with Curated Zones
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    dialCode: "+91",
    zones: [
      "Indiranagar, Bengaluru",
      "Defence Colony, Indiranagar",
      "Domlur, Bengaluru",
      "HAL 2nd Stage, Bengaluru",
      "Koramangala, Bengaluru",
      "HSR Layout, Bengaluru",
      "Whitefield, Bengaluru",
      "Jayanagar, Bengaluru",
      "JP Nagar, Bengaluru",
      "Malleshwaram, Bengaluru",
      "Bandra West, Mumbai",
      "Andheri West, Mumbai",
      "Powai, Mumbai",
      "South Mumbai / Colaba",
      "Connaught Place, New Delhi",
      "Cyber City, Gurugram",
      "Sector 18, Noida",
      "Hitec City / Gachibowli, Hyderabad",
      "Banjara Hills, Hyderabad",
      "T. Nagar, Chennai",
      "Adyar / Besant Nagar, Chennai",
      "Kothrud / Baner, Pune",
      "Salt Lake City, Kolkata",
      "SG Highway / Bodakdev, Ahmedabad",
    ],
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    dialCode: "+1",
    zones: [
      "Manhattan (New York, NY)",
      "Brooklyn (New York, NY)",
      "Queens (New York, NY)",
      "Downtown Los Angeles, CA",
      "Santa Monica / Westside (LA, CA)",
      "Silicon Valley (San Jose / Palo Alto, CA)",
      "San Francisco Downtown / Mission, CA",
      "The Loop / Downtown (Chicago, IL)",
      "Downtown Houston, TX",
      "Brickell / South Beach (Miami, FL)",
      "Downtown Seattle, WA",
      "Back Bay / Downtown (Boston, MA)",
      "Downtown Austin, TX",
      "Uptown / Downtown (Dallas, TX)",
      "Midtown / Buckhead (Atlanta, GA)",
      "Dupont Circle (Washington, DC)",
      "Scottsdale / Phoenix, AZ",
      "Denver Downtown / LoDo, CO",
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    dialCode: "+44",
    zones: [
      "Westminster & Soho (Central London)",
      "Camden & King's Cross (London)",
      "Canary Wharf & Isle of Dogs (London)",
      "Kensington & Chelsea (London)",
      "City of London Financial District",
      "Islington & Shoreditch (London)",
      "Manchester City Centre & Salford",
      "Birmingham City Centre & Edgbaston",
      "Edinburgh Old & New Town",
      "Glasgow City Centre & West End",
      "Leeds City Centre",
      "Bristol Harbourside & Clifton",
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    dialCode: "+971",
    zones: [
      "Downtown Dubai & Burj Khalifa",
      "Dubai Marina & JBR",
      "Business Bay, Dubai",
      "Palm Jumeirah, Dubai",
      "Deira & Old Dubai",
      "Jumeirah Lake Towers (JLT), Dubai",
      "Al Barsha, Dubai",
      "Al Reem Island, Abu Dhabi",
      "Corniche & Downtown, Abu Dhabi",
      "Yas Island, Abu Dhabi",
      "Sharjah City Centre & Al Majaz",
      "Ajman Corniche Zone",
    ],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    dialCode: "+1",
    zones: [
      "Downtown Toronto & Bay St (ON)",
      "North York / Scarborough (Toronto, ON)",
      "Mississauga City Centre (ON)",
      "Downtown Vancouver & Yaletown (BC)",
      "Richmond & Burnaby (BC)",
      "Downtown Montreal & Old Port (QC)",
      "Plateau-Mont-Royal (Montreal, QC)",
      "Downtown Calgary & Beltline (AB)",
      "Downtown Ottawa & ByWard Market (ON)",
      "Downtown Edmonton (AB)",
    ],
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    dialCode: "+61",
    zones: [
      "Sydney CBD & Circular Quay (NSW)",
      "Bondi & Eastern Suburbs (Sydney, NSW)",
      "Parramatta & Western Sydney (NSW)",
      "Melbourne CBD & Docklands (VIC)",
      "Southbank & St Kilda (Melbourne, VIC)",
      "Brisbane City & South Bank (QLD)",
      "Perth CBD & Northbridge (WA)",
      "Adelaide City Centre (SA)",
      "Surfers Paradise (Gold Coast, QLD)",
    ],
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    dialCode: "+65",
    zones: [
      "Downtown Core & Marina Bay",
      "Orchard Road & River Valley",
      "Jurong East & Boon Lay",
      "Tampines & Pasir Ris",
      "Bedok & Marine Parade",
      "Woodlands & Yishun",
      "Novena & Toa Payoh",
      "HarbourFront & Sentosa",
    ],
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    dialCode: "+49",
    zones: [
      "Berlin Mitte & Kreuzberg",
      "Berlin Charlottenburg & Wilmersdorf",
      "Munich Altstadt-Lehel & Schwabing",
      "Munich Maxvorstadt",
      "Frankfurt Innenstadt & Westend",
      "Hamburg Mitte & HafenCity",
      "Cologne Innenstadt",
      "Stuttgart Mitte",
      "Düsseldorf Stadtmitte",
    ],
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    dialCode: "+33",
    zones: [
      "Paris 1er-8e (Louvre, Opéra, Champs-Élysées)",
      "Paris 9e-11e (Gare, Bastille, Marais)",
      "Paris 15e-16e (Tour Eiffel, Passy)",
      "Lyon Presqu'île & Part-Dieu",
      "Marseille Vieux-Port & Castellane",
      "Nice Promenade des Anglais",
      "Toulouse Capitole",
      "Bordeaux Centre",
    ],
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    dialCode: "+81",
    zones: [
      "Tokyo - Shibuya & Shinjuku",
      "Tokyo - Chiyoda & Ginza",
      "Tokyo - Minato, Roppongi & Akasaka",
      "Tokyo - Shinagawa & Ikebukuro",
      "Osaka - Umeda (Kita) & Namba (Minami)",
      "Kyoto - Karasuma & Gion",
      "Yokohama - Minato Mirai 21",
      "Fukuoka - Hakata & Tenjin",
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    dialCode: "+966",
    zones: [
      "Riyadh - Al Olaya & King Fahd",
      "Riyadh - Al Malqa & Al Yasmin",
      "Riyadh - Diplomatic Quarter",
      "Jeddah - Al Corniche & Al Shati",
      "Jeddah - Al Rawdah & Al Andalus",
      "Dammam - Corniche & Al Faisaliyah",
      "Al Khobar - Corniche & Al Olaya",
      "Mecca - Central Haram Zone",
      "Medina - Central Haram Zone",
    ],
  },
  {
    code: "QA",
    name: "Qatar",
    flag: "🇶🇦",
    dialCode: "+974",
    zones: [
      "Doha - West Bay & Diplomatic Area",
      "Doha - The Pearl-Qatar",
      "Doha - Lusail Marina District",
      "Doha - Old Airport & Al Sadd",
      "Al Rayyan Central Zone",
    ],
  },
  {
    code: "KW",
    name: "Kuwait",
    flag: "🇰🇼",
    dialCode: "+965",
    zones: [
      "Kuwait City - Sharq & Qibla",
      "Salmiya - Coastal Zone",
      "Hawally District",
      "Al Ahmadi & Fahaheel",
    ],
  },
  {
    code: "OM",
    name: "Oman",
    flag: "🇴🇲",
    dialCode: "+968",
    zones: [
      "Muscat - Ruwi & Mutrah",
      "Muscat - Al Mouj & Seeb",
      "Muscat - Qurum & Shatti Al Qurum",
      "Salalah City Centre",
    ],
  },
  {
    code: "BH",
    name: "Bahrain",
    flag: "🇧🇭",
    dialCode: "+973",
    zones: [
      "Manama - Seef Financial District",
      "Manama - Juffair & Adliya",
      "Amwaj Islands & Muharraq",
      "Riffa Central",
    ],
  },
  {
    code: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    dialCode: "+60",
    zones: [
      "Kuala Lumpur - KLCC & Bukit Bintang",
      "Kuala Lumpur - Bangsar & Mont Kiara",
      "Petaling Jaya & Damansara (Selangor)",
      "Subang Jaya & Shah Alam (Selangor)",
      "George Town & Bayan Lepas (Penang)",
      "Johor Bahru City Centre",
    ],
  },
  {
    code: "ID",
    name: "Indonesia",
    flag: "🇮🇩",
    dialCode: "+62",
    zones: [
      "Jakarta - SCBD & Sudirman",
      "Jakarta - Menteng & Kuningan",
      "Jakarta - Kebayoran Baru / Senopati",
      "Bali - Seminyak & Canggu",
      "Bali - Kuta & Denpasar",
      "Surabaya - Gubeng & Tunjungan",
      "Bandung - Dago & Riau",
    ],
  },
  {
    code: "TH",
    name: "Thailand",
    flag: "🇹🇭",
    dialCode: "+66",
    zones: [
      "Bangkok - Sukhumvit & Asok",
      "Bangkok - Silom & Sathorn",
      "Bangkok - Siam & Phaya Thai",
      "Phuket - Patong & Phuket Town",
      "Chiang Mai - Nimman & Old City",
      "Pattaya Central",
    ],
  },
  {
    code: "PH",
    name: "Philippines",
    flag: "🇵🇭",
    dialCode: "+63",
    zones: [
      "Makati CBD & Poblacion (Metro Manila)",
      "Bonifacio Global City - BGC (Taguig)",
      "Ortigas Center (Pasig / Mandaluyong)",
      "Quezon City - Diliman & Cubao",
      "Cebu City - IT Park & Lahug",
      "Davao City - Poblacion",
    ],
  },
  {
    code: "VN",
    name: "Vietnam",
    flag: "🇻🇳",
    dialCode: "+84",
    zones: [
      "Ho Chi Minh City - District 1 (Ben Nghe)",
      "Ho Chi Minh City - District 2 / Thao Dien",
      "Hanoi - Hoan Kiem & Old Quarter",
      "Hanoi - Ba Dinh & Tay Ho (West Lake)",
      "Da Nang - Hai Chau & Son Tra",
    ],
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    dialCode: "+27",
    zones: [
      "Johannesburg - Sandton & Rosebank",
      "Johannesburg - Bryanston & Fourways",
      "Cape Town - City Bowl & V&A Waterfront",
      "Cape Town - Camps Bay & Atlantic Seaboard",
      "Durban - Umhlanga & North Beach",
      "Pretoria - Menlyn & Hatfield",
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    dialCode: "+234",
    zones: [
      "Lagos - Victoria Island & Ikoyi",
      "Lagos - Lekki Phase 1 & 2",
      "Lagos - Ikeja Central & GRA",
      "Abuja - Maitama & Asokoro",
      "Abuja - Wuse 2 & Garki",
      "Port Harcourt - Old GRA",
    ],
  },
  {
    code: "EG",
    name: "Egypt",
    flag: "🇪🇬",
    dialCode: "+20",
    zones: [
      "Cairo - New Cairo & 5th Settlement",
      "Cairo - Zamalek & Downtown",
      "Cairo - Maadi & Degla",
      "Giza - 6th of October & Sheikh Zayed",
      "Alexandria - Corniche & Smouha",
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    dialCode: "+254",
    zones: [
      "Nairobi - Westlands & Parklands",
      "Nairobi - Kilimani & Kileleshwa",
      "Nairobi - Karen & Lavington",
      "Nairobi - Upper Hill & CBD",
      "Mombasa - Nyali & City Centre",
    ],
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    dialCode: "+55",
    zones: [
      "São Paulo - Avenida Paulista & Jardins",
      "São Paulo - Itaim Bibi & Vila Olímpia",
      "Rio de Janeiro - Copacabana & Ipanema",
      "Rio de Janeiro - Barra da Tijuca",
      "Brasília - Plano Piloto (Asa Sul / Norte)",
      "Belo Horizonte - Savassi & Funcionários",
      "Curitiba - Batel & Centro",
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    dialCode: "+52",
    zones: [
      "Mexico City - Polanco & Reforma",
      "Mexico City - Condesa & Roma Norte",
      "Mexico City - Santa Fe",
      "Monterrey - San Pedro Garza García",
      "Guadalajara - Providencia & Zapopan",
      "Cancún - Zona Hotelera & Centro",
    ],
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    dialCode: "+54",
    zones: [
      "Buenos Aires - Palermo & Soho",
      "Buenos Aires - Recoleta & Retiro",
      "Buenos Aires - Puerto Madero",
      "Córdoba - Nueva Córdoba & Centro",
      "Rosario - Centro & Pichincha",
    ],
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    dialCode: "+56",
    zones: [
      "Santiago - Las Condes & El Golf",
      "Santiago - Providencia & Bellavista",
      "Santiago - Vitacura & Lo Barnechea",
      "Valparaíso & Viña del Mar",
    ],
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    dialCode: "+57",
    zones: [
      "Bogotá - Chapinero Alto & Chico",
      "Bogotá - Usaquén & Santa Bárbara",
      "Medellín - El Poblado & Laureles",
      "Cali - Granada & Ciudad Jardín",
      "Cartagena - Bocagrande & Old Town",
    ],
  },
  {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    dialCode: "+39",
    zones: [
      "Rome - Centro Storico & Trastevere",
      "Rome - Parioli & Prati",
      "Milan - Duomo, Brera & Quadrilatero",
      "Milan - Porta Nuova & Isola",
      "Florence - Centro & Santa Maria Novella",
      "Naples - Chiaia & Centro Storico",
      "Turin - Centro & Crocetta",
    ],
  },
  {
    code: "ES",
    name: "Spain",
    flag: "🇪🇸",
    dialCode: "+34",
    zones: [
      "Madrid - Barrio de Salamanca & Recoletos",
      "Madrid - Chamberí & Malasaña",
      "Madrid - Centro & Sol",
      "Barcelona - Eixample Dreta & Esquerra",
      "Barcelona - Gràcia & Sarrià",
      "Valencia - Ciutat Vella & Ruzafa",
      "Seville - Casco Antiguo & Triana",
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    dialCode: "+31",
    zones: [
      "Amsterdam - Centrum & Grachtengordel",
      "Amsterdam - Zuid & Zuidas Business",
      "Rotterdam - Centrum & Kop van Zuid",
      "The Hague - Centrum & Scheveningen",
      "Utrecht - Binnenstad",
    ],
  },
  {
    code: "CH",
    name: "Switzerland",
    flag: "🇨🇭",
    dialCode: "+41",
    zones: [
      "Zurich - Altstadt & Enge",
      "Zurich - Oerlikon & Seefeld",
      "Geneva - Centre & Eaux-Vives",
      "Basel - Grossbasel & St. Alban",
      "Lausanne - Centre & Ouchy",
      "Bern - Innere Stadt",
    ],
  },
  {
    code: "SE",
    name: "Sweden",
    flag: "🇸🇪",
    dialCode: "+46",
    zones: [
      "Stockholm - Norrmalm & Östermalm",
      "Stockholm - Södermalm & Kungsholmen",
      "Gothenburg - Centrum & Linné",
      "Malmö - Centrum & Västra Hamnen",
    ],
  },
  {
    code: "NO",
    name: "Norway",
    flag: "🇳🇴",
    dialCode: "+47",
    zones: [
      "Oslo - Sentrum & Frogner",
      "Oslo - Majorstuen & Grünerløkka",
      "Bergen - Sentrum & Bryggen",
      "Trondheim - Midtbyen",
      "Stavanger - Sentrum",
    ],
  },
  {
    code: "DK",
    name: "Denmark",
    flag: "🇩🇰",
    dialCode: "+45",
    zones: [
      "Copenhagen - Indre By & Vesterbro",
      "Copenhagen - Østerbro & Nørrebro",
      "Aarhus - C & Frederiksbjerg",
      "Odense - Centrum",
    ],
  },
  {
    code: "IE",
    name: "Ireland",
    flag: "🇮🇪",
    dialCode: "+353",
    zones: [
      "Dublin - City Centre South (Dublin 2)",
      "Dublin - Docklands (Silicon Docks)",
      "Dublin - Ballsbridge & Rathmines (Dublin 4/6)",
      "Cork City Centre",
      "Galway City Centre",
    ],
  },
  {
    code: "NZ",
    name: "New Zealand",
    flag: "🇳🇿",
    dialCode: "+64",
    zones: [
      "Auckland - CBD & Viaduct Harbour",
      "Auckland - Ponsonby & Newmarket",
      "Wellington - Central & Te Aro",
      "Christchurch - Central City",
    ],
  },
  {
    code: "KR",
    name: "South Korea",
    flag: "🇰🇷",
    dialCode: "+82",
    zones: [
      "Seoul - Gangnam & Teheran-ro",
      "Seoul - Jung-gu & Myeongdong",
      "Seoul - Mapo & Hongdae",
      "Seoul - Yongsan & Itaewon",
      "Busan - Haeundae & Seomyeon",
      "Incheon - Songdo International City",
    ],
  },
  {
    code: "TR",
    name: "Turkey",
    flag: "🇹🇷",
    dialCode: "+90",
    zones: [
      "Istanbul - Beşiktaş & Levent",
      "Istanbul - Kadıköy & Moda",
      "Istanbul - Şişli & Nişantaşı",
      "Ankara - Çankaya & Kızılay",
      "Izmir - Konak & Alsancak",
    ],
  },
  {
    code: "IL",
    name: "Israel",
    flag: "🇮🇱",
    dialCode: "+972",
    zones: [
      "Tel Aviv - Lev HaIr & Rothschild",
      "Tel Aviv - Florentin & Neve Tzedek",
      "Jerusalem - City Center & Rehavia",
      "Haifa - Carmel & Downtown",
      "Herzliya Pituach High-Tech Hub",
    ],
  },
  {
    code: "RU",
    name: "Russia",
    flag: "🇷🇺",
    dialCode: "+7",
    zones: [
      "Moscow - Central Administrative Okrug",
      "Moscow - Presnensky & Moscow City",
      "Saint Petersburg - Central & Petrogradsky",
      "Novosibirsk - Tsentralny",
    ],
  },
  {
    code: "PL",
    name: "Poland",
    flag: "🇵🇱",
    dialCode: "+48",
    zones: [
      "Warsaw - Śródmieście & Mokotów",
      "Warsaw - Wola Business Hub",
      "Kraków - Stare Miasto & Kazimierz",
      "Wrocław - Stare Miasto",
      "Gdańsk - Śródmieście",
    ],
  },
  {
    code: "BE",
    name: "Belgium",
    flag: "🇧🇪",
    dialCode: "+32",
    zones: [
      "Brussels - European Quarter & Ixelles",
      "Brussels - City Centre & Louise",
      "Antwerp - Centrum & Zurenborg",
      "Ghent - Binnenstad",
    ],
  },
  {
    code: "AT",
    name: "Austria",
    flag: "🇦🇹",
    dialCode: "+43",
    zones: [
      "Vienna - Innere Stadt (1st District)",
      "Vienna - Leopoldstadt & Neubau",
      "Salzburg - Altstadt",
      "Graz - Innere Stadt",
    ],
  },
  {
    code: "PT",
    name: "Portugal",
    flag: "🇵🇹",
    dialCode: "+351",
    zones: [
      "Lisbon - Baixa & Chiado",
      "Lisbon - Parque das Nações",
      "Porto - Ribeira & Boavista",
      "Cascais Coastal Zone",
    ],
  },
  {
    code: "GR",
    name: "Greece",
    flag: "🇬🇷",
    dialCode: "+30",
    zones: [
      "Athens - Syntagma & Kolonaki",
      "Athens - Plaka & Monastiraki",
      "Thessaloniki - City Centre",
      "Heraklion Central (Crete)",
    ],
  },

  // Additional World Countries (Covering the Entire World)
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", dialCode: "+93", zones: ["Kabul Central", "Herat", "Mazar-i-Sharif"] },
  { code: "AL", name: "Albania", flag: "🇦🇱", dialCode: "+355", zones: ["Tirana Central", "Durrës", "Vlorë"] },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", dialCode: "+213", zones: ["Algiers Centre", "Oran", "Constantine"] },
  { code: "AD", name: "Andorra", flag: "🇦🇩", dialCode: "+376", zones: ["Andorra la Vella", "Escaldes-Engordany"] },
  { code: "AO", name: "Angola", flag: "🇦🇴", dialCode: "+244", zones: ["Luanda Central", "Benguela", "Huambo"] },
  { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬", dialCode: "+1268", zones: ["St. John's Central"] },
  { code: "AM", name: "Armenia", flag: "🇦🇲", dialCode: "+374", zones: ["Yerevan Kentron", "Gyumri"] },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", dialCode: "+994", zones: ["Baku City Centre", "Ganja", "Sumqayit"] },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", dialCode: "+1242", zones: ["Nassau Central", "Freeport"] },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880", zones: ["Dhaka - Gulshan & Banani", "Dhaka - Dhanmondi", "Chittagong Central", "Sylhet"] },
  { code: "BB", name: "Barbados", flag: "🇧🇧", dialCode: "+1246", zones: ["Bridgetown Central", "St. Michael"] },
  { code: "BY", name: "Belarus", flag: "🇧🇾", dialCode: "+375", zones: ["Minsk Central", "Brest", "Grodno"] },
  { code: "BZ", name: "Belize", flag: "🇧🇿", dialCode: "+501", zones: ["Belize City", "Belmopan"] },
  { code: "BJ", name: "Benin", flag: "🇧🇯", dialCode: "+229", zones: ["Cotonou Central", "Porto-Novo"] },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", dialCode: "+975", zones: ["Thimphu Central", "Phuntsholing", "Paro"] },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591", zones: ["La Paz Central", "Santa Cruz de la Sierra", "Cochabamba"] },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", dialCode: "+387", zones: ["Sarajevo Centar", "Banja Luka", "Mostar"] },
  { code: "BW", name: "Botswana", flag: "🇧🇼", dialCode: "+267", zones: ["Gaborone Central", "Francistown"] },
  { code: "BN", name: "Brunei", flag: "🇧🇳", dialCode: "+673", zones: ["Bandar Seri Begawan", "Kuala Belait"] },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", dialCode: "+359", zones: ["Sofia Centre", "Plovdiv", "Varna"] },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226", zones: ["Ouagadougou Central", "Bobo-Dioulasso"] },
  { code: "BI", name: "Burundi", flag: "🇧🇮", dialCode: "+257", zones: ["Bujumbura Central", "Gitega"] },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", dialCode: "+855", zones: ["Phnom Penh - Daun Penh", "Siem Reap Central"] },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", dialCode: "+237", zones: ["Douala Central", "Yaoundé Centre"] },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻", dialCode: "+238", zones: ["Praia Central", "Mindelo"] },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫", dialCode: "+236", zones: ["Bangui Central"] },
  { code: "TD", name: "Chad", flag: "🇹🇩", dialCode: "+235", zones: ["N'Djamena Central"] },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86", zones: ["Shanghai - Pudong & Huangpu", "Beijing - Chaoyang & Haidian", "Shenzhen - Nanshan & Futian", "Guangzhou - Tianhe"] },
  { code: "KM", name: "Comoros", flag: "🇰🇲", dialCode: "+269", zones: ["Moroni Central"] },
  { code: "CG", name: "Congo (Brazzaville)", flag: "🇨🇬", dialCode: "+242", zones: ["Brazzaville Central", "Pointe-Noire"] },
  { code: "CD", name: "Congo (Kinshasa)", flag: "🇨🇩", dialCode: "+243", zones: ["Kinshasa - Gombe", "Lubumbashi"] },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506", zones: ["San José Central", "Escazú", "Heredia"] },
  { code: "HR", name: "Croatia", flag: "🇭🇷", dialCode: "+385", zones: ["Zagreb - Donji Grad", "Split Centre", "Dubrovnik"] },
  { code: "CU", name: "Cuba", flag: "🇨🇺", dialCode: "+53", zones: ["Havana - Vedado & Old Havana", "Santiago de Cuba"] },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", dialCode: "+357", zones: ["Nicosia Central", "Limassol Marina", "Larnaca"] },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", dialCode: "+420", zones: ["Prague 1 (Old Town)", "Prague 2 (Vinohrady)", "Brno Centre"] },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", dialCode: "+253", zones: ["Djibouti City Central"] },
  { code: "DM", name: "Dominica", flag: "🇩🇲", dialCode: "+1767", zones: ["Roseau Central"] },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", dialCode: "+1809", zones: ["Santo Domingo - Piantini", "Santiago de los Caballeros", "Punta Cana"] },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593", zones: ["Quito - Mariscal & Cumbayá", "Guayaquil - Samborondón", "Cuenca"] },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503", zones: ["San Salvador - San Benito", "Santa Tecla"] },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", dialCode: "+240", zones: ["Malabo Central", "Bata"] },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", dialCode: "+291", zones: ["Asmara Central"] },
  { code: "EE", name: "Estonia", flag: "🇪🇪", dialCode: "+372", zones: ["Tallinn - Kesklinn & Old Town", "Tartu Central"] },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", dialCode: "+268", zones: ["Mbabane Central", "Manzini"] },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", dialCode: "+251", zones: ["Addis Ababa - Bole & Kazanchis", "Hawassa"] },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", dialCode: "+679", zones: ["Suva Central", "Nadi"] },
  { code: "FI", name: "Finland", flag: "🇫🇮", dialCode: "+358", zones: ["Helsinki - Kamppi & Kluuvi", "Espoo", "Tampere Central"] },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241", zones: ["Libreville Central", "Port-Gentil"] },
  { code: "GM", name: "Gambia", flag: "🇬🇲", dialCode: "+220", zones: ["Banjul Central", "Serekunda"] },
  { code: "GE", name: "Georgia", flag: "🇬🇪", dialCode: "+995", zones: ["Tbilisi - Vake & Saburtalo", "Batumi Central"] },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233", zones: ["Accra - Airport Residential & Osu", "Kumasi Central"] },
  { code: "GD", name: "Grenada", flag: "🇬🇩", dialCode: "+1473", zones: ["St. George's Central"] },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502", zones: ["Guatemala City - Zona 10 & 14", "Antigua Guatemala"] },
  { code: "GN", name: "Guinea", flag: "🇬🇳", dialCode: "+224", zones: ["Conakry Central"] },
  { code: "GY", name: "Guyana", flag: "🇬🇾", dialCode: "+592", zones: ["Georgetown Central"] },
  { code: "HT", name: "Haiti", flag: "🇭🇹", dialCode: "+509", zones: ["Port-au-Prince - Pétion-Ville"] },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504", zones: ["Tegucigalpa Central", "San Pedro Sula"] },
  { code: "HU", name: "Hungary", flag: "🇭🇺", dialCode: "+36", zones: ["Budapest - District V (Belváros)", "Budapest - District VII", "Debrecen"] },
  { code: "IS", name: "Iceland", flag: "🇮🇸", dialCode: "+354", zones: ["Reykjavík - Miðborg (Downtown)", "Kópavogur"] },
  { code: "IR", name: "Iran", flag: "🇮🇷", dialCode: "+98", zones: ["Tehran - Shemiran & Sa'adat Abad", "Isfahan", "Shiraz"] },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", dialCode: "+964", zones: ["Baghdad - Mansour & Karrada", "Erbil Central", "Basra"] },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", dialCode: "+1876", zones: ["Kingston - New Kingston", "Montego Bay"] },
  { code: "JO", name: "Jordan", flag: "🇯🇴", dialCode: "+962", zones: ["Amman - Abdoun & Jabal Amman", "Aqaba"] },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", dialCode: "+7", zones: ["Almaty - Medeu & Bostandyk", "Astana - Yesil District"] },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", dialCode: "+961", zones: ["Beirut - Hamra & Achrafieh", "Tripoli"] },
  { code: "LY", name: "Libya", flag: "🇱🇾", dialCode: "+218", zones: ["Tripoli Central", "Benghazi"] },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", dialCode: "+352", zones: ["Luxembourg City - Ville-Haute & Kirchberg"] },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", dialCode: "+261", zones: ["Antananarivo Central"] },
  { code: "MV", name: "Maldives", flag: "🇲🇻", dialCode: "+960", zones: ["Malé City Central", "Hulhumalé"] },
  { code: "MT", name: "Malta", flag: "🇲🇹", dialCode: "+356", zones: ["Valletta Central", "Sliema & St. Julian's"] },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", dialCode: "+230", zones: ["Port Louis Central", "Grand Baie", "Ebène City"] },
  { code: "MC", name: "Monaco", flag: "🇲🇨", dialCode: "+377", zones: ["Monte Carlo", "La Condamine", "Fontvieille"] },
  { code: "MA", name: "Morocco", flag: "🇲🇦", dialCode: "+212", zones: ["Casablanca - Anfa & Gauthier", "Rabat - Agdal", "Marrakech - Guéliz"] },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dialCode: "+977", zones: ["Kathmandu - Thamel & Lazimpat", "Lalitpur - Jhamsikhel", "Pokhara"] },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92", zones: ["Karachi - Clifton & DHA", "Lahore - Gulberg & DHA", "Islamabad - F-6 & F-7"] },
  { code: "PA", name: "Panama", flag: "🇵🇦", dialCode: "+507", zones: ["Panama City - Punta Pacífica & San Francisco"] },
  { code: "PE", name: "Peru", flag: "🇵🇪", dialCode: "+51", zones: ["Lima - Miraflores & San Isidro", "Cusco Central"] },
  { code: "RO", name: "Romania", flag: "🇷🇴", dialCode: "+40", zones: ["Bucharest - Sector 1 (Dorobanți)", "Cluj-Napoca Central"] },
  { code: "RS", name: "Serbia", flag: "🇷🇸", dialCode: "+381", zones: ["Belgrade - Stari Grad & Vračar", "Novi Sad"] },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dialCode: "+94", zones: ["Colombo - Kollupitiya & Cinnamon Gardens", "Kandy"] },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", dialCode: "+886", zones: ["Taipei - Xinyi & Daan", "Kaohsiung Central"] },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", dialCode: "+380", zones: ["Kyiv - Pechersk & Shevchenkivskyi", "Lviv Central"] },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598", zones: ["Montevideo - Pocitos & Punta Carretas"] },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", dialCode: "+998", zones: ["Tashkent - Mirabad & Chilanzar", "Samarkand"] },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", dialCode: "+263", zones: ["Harare - Borrowdale & Avondale", "Bulawayo"] },
];

/**
 * Universal Worldwide Area Zones (Global Highlights)
 */
export const GLOBAL_HIGHLIGHT_ZONES: string[] = [
  "Indiranagar, Bengaluru (IN)",
  "Koramangala, Bengaluru (IN)",
  "Bandra West, Mumbai (IN)",
  "Cyber City, Gurugram (IN)",
  "Manhattan, New York (US)",
  "Silicon Valley / San Jose (US)",
  "Downtown Los Angeles (US)",
  "Westminster, London (GB)",
  "Canary Wharf, London (GB)",
  "Downtown Dubai & Burj Khalifa (AE)",
  "Dubai Marina & JBR (AE)",
  "Downtown Toronto, Ontario (CA)",
  "Sydney CBD & Circular Quay (AU)",
  "Marina Bay & Downtown (SG)",
  "Berlin Mitte (DE)",
  "Paris 1er-8e Central (FR)",
  "Shibuya & Shinjuku, Tokyo (JP)",
  "Al Olaya, Riyadh (SA)",
];

/**
 * Find Country by Code or Name
 */
export function findCountry(query: string): WorldCountry | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return WORLD_COUNTRIES.find(
    (c) =>
      c.code.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      c.dialCode.toLowerCase() === q
  );
}

/**
 * Get Available Area Zones for a Given Country
 */
export function getZonesForCountry(countryCodeOrName: string): string[] {
  const country = findCountry(countryCodeOrName);
  if (country && country.zones && country.zones.length > 0) {
    return country.zones;
  }
  return GLOBAL_HIGHLIGHT_ZONES;
}

/**
 * Construct Full Worldwide Address String
 */
export function formatWorldwideAddress(data: {
  address: string;
  area: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string {
  const parts: string[] = [];
  if (data.address?.trim()) parts.push(data.address.trim());
  if (data.area?.trim()) parts.push(data.area.trim());
  if (data.city?.trim() && !data.area?.toLowerCase().includes(data.city.toLowerCase())) {
    parts.push(data.city.trim());
  }
  if (data.state?.trim()) parts.push(data.state.trim());
  if (data.postalCode?.trim()) parts.push(data.postalCode.trim());
  if (data.country?.trim()) parts.push(data.country.trim());

  return parts.join(", ");
}

/**
 * Clean & Format International Phone Number
 * Accepts any valid phone number from anywhere in the world (7 to 15 digits according to E.164).
 */
export function cleanInternationalPhone(input: string, defaultDialCode = "+91"): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // If already starts with '+', keep the '+' and strip spaces/dashes
  if (trimmed.startsWith("+")) {
    return "+" + trimmed.replace(/\D/g, "");
  }

  // Strip non-digits
  const digitsOnly = trimmed.replace(/\D/g, "");

  // If user entered full international number with country code without '+', return with '+'
  if (digitsOnly.length > 10 && (digitsOnly.startsWith("91") || digitsOnly.startsWith("1") || digitsOnly.startsWith("44") || digitsOnly.startsWith("971"))) {
    return `+${digitsOnly}`;
  }

  // Otherwise combine with selected dial code
  const dialPrefix = defaultDialCode.startsWith("+") ? defaultDialCode : `+${defaultDialCode}`;
  return `${dialPrefix} ${digitsOnly}`;
}

/**
 * Check if a phone number is a valid international telephone number (7-15 digits E.164)
 */
export function isValidInternationalPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
