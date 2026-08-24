window.ROOMS = [
  { id: "pacific", name: "Pacific Shore", states: ["CA", "WA", "OR", "AK", "HI"] },
  { id: "high", name: "High Country", states: ["NV", "AZ", "UT", "CO", "NM", "ID", "WY", "MT"] },
  { id: "plains", name: "Wide Plains", states: ["TX", "OK", "KS", "NE", "SD", "ND"] },
  { id: "lakes", name: "Lakes", states: ["MN", "IA", "MO", "WI", "IL", "MI", "IN", "OH"] },
  { id: "river", name: "River South", states: ["AR", "LA", "MS", "AL", "TN", "KY", "WV"] },
  { id: "low", name: "Low Country", states: ["FL", "GA", "SC", "NC", "VA"] },
  { id: "mid", name: "Mid Door", states: ["PA", "NY", "NJ", "DE", "MD"] },
  { id: "tide", name: "Tide Lanterns", states: ["ME", "NH", "VT", "MA", "RI", "CT"] }
];

window.STATES = {
  AL: { name: "Alabama", capital: "Montgomery", room: "river", star: [659.5, 409.4], hook: "A ham on a mountain of gum" },
  AK: { name: "Alaska", capital: "Juneau", room: "pacific", star: [110.5, 511.0], hook: "A moose named June" },
  AZ: { name: "Arizona", capital: "Phoenix", room: "high", star: [200.7, 363.7], hook: "A fire bird lifts a cactus" },
  AR: { name: "Arkansas", capital: "Little Rock", room: "river", star: [551.3, 369.7], hook: "An ark on a tiny rock" },
  CA: { name: "California", capital: "Sacramento", room: "pacific", star: [72, 210], hook: "A call from a sack of mint" },
  CO: { name: "Colorado", capital: "Denver", room: "high", star: [322.1, 271.5], hook: "A colorful door in a den" },
  CT: { name: "Connecticut", capital: "Hartford", room: "tide", star: [859.3, 178.6], hook: "A heart leaps a ford" },
  DE: { name: "Delaware", capital: "Dover", room: "mid", star: [830.4, 239.1], hook: "A deli on a dove" },
  FL: { name: "Florida", capital: "Tallahassee", room: "low", star: [690, 470], hook: "Flowers tall as a sea" },
  GA: { name: "Georgia", capital: "Atlanta", room: "low", star: [719.0, 399.7], hook: "A george on an atlas" },
  HI: { name: "Hawaii", capital: "Honolulu", room: "pacific", star: [289.9, 546.4], hook: "A hi-wave of honor lulus" },
  ID: { name: "Idaho", capital: "Boise", room: "high", star: [188, 160], hook: "An eye on a hoed potato says boys" },
  IL: { name: "Illinois", capital: "Springfield", room: "lakes", star: [591.9, 259.2], hook: "Ill noise at a spring field" },
  IN: { name: "Indiana", capital: "Indianapolis", room: "lakes", star: [645.5, 254.6], hook: "An Indian on a polite apple" },
  IA: { name: "Iowa", capital: "Des Moines", room: "lakes", star: [525.6, 213.8], hook: "I owe a dime on the moon" },
  KS: { name: "Kansas", capital: "Topeka", room: "plains", star: [443.9, 290.4], hook: "Cans in a top peek-a" },
  KY: { name: "Kentucky", capital: "Frankfort", room: "river", star: [661.6, 298.4], hook: "A kentuck turkey at a frank fort" },
  LA: { name: "Louisiana", capital: "Baton Rouge", room: "river", star: [560, 460], hook: "Louise swings a red baton" },
  ME: { name: "Maine", capital: "Augusta", room: "tide", star: [895.3, 88.3], hook: "A mane on August wind" },
  MD: { name: "Maryland", capital: "Annapolis", room: "mid", star: [810, 240], hook: "Mary lands on an apple" },
  MA: { name: "Massachusetts", capital: "Boston", room: "tide", star: [874.0, 158.6], hook: "A mass of tea in Boston" },
  MI: { name: "Michigan", capital: "Lansing", room: "lakes", star: [655, 175], hook: "A mitten landing" },
  MN: { name: "Minnesota", capital: "St. Paul", room: "lakes", star: [523.4, 116.9], hook: "A mini soda with Saint Paul" },
  MS: { name: "Mississippi", capital: "Jackson", room: "river", star: [600.8, 412.4], hook: "Miss sips by a jack" },
  MO: { name: "Missouri", capital: "Jefferson City", room: "lakes", star: [545.1, 293.2], hook: "A misery mule at Jefferson" },
  MT: { name: "Montana", capital: "Helena", room: "high", star: [280.6, 87.1], hook: "A mountain tan Helena" },
  NE: { name: "Nebraska", capital: "Lincoln", room: "plains", star: [424.0, 223.2], hook: "A new brass key for Lincoln" },
  NV: { name: "Nevada", capital: "Carson City", room: "high", star: [140.4, 251.3], hook: "A car of suns in a silver city" },
  NH: { name: "New Hampshire", capital: "Concord", room: "tide", star: [868.8, 122.0], hook: "A new ham on a concord grape" },
  NJ: { name: "New Jersey", capital: "Trenton", room: "mid", star: [836.4, 215.8], hook: "A new jersey in a tent" },
  NM: { name: "New Mexico", capital: "Santa Fe", room: "high", star: [302.9, 370.0], hook: "A new hat for Santa" },
  NY: { name: "New York", capital: "Albany", room: "mid", star: [820, 120], hook: "A new fork in Albany" },
  NC: { name: "North Carolina", capital: "Raleigh", room: "low", star: [800, 320], hook: "North carol in a rally" },
  ND: { name: "North Dakota", capital: "Bismarck", room: "plains", star: [418.8, 93.0], hook: "North coat on a bison mark" },
  OH: { name: "Ohio", capital: "Columbus", room: "lakes", star: [702.4, 234.5], hook: "Oh hi, Mr. Columbus" },
  OK: { name: "Oklahoma", capital: "Oklahoma City", room: "plains", star: [460, 360], hook: "An ok home in its own city" },
  OR: { name: "Oregon", capital: "Salem", room: "pacific", star: [80, 100], hook: "An oar gone to Salem" },
  PA: { name: "Pennsylvania", capital: "Harrisburg", room: "mid", star: [785.1, 209.2], hook: "A pencil on a hairy burger" },
  RI: { name: "Rhode Island", capital: "Providence", room: "tide", star: [877.6, 170.5], hook: "A road on an island of providence" },
  SC: { name: "South Carolina", capital: "Columbia", room: "low", star: [755.9, 375.7], hook: "South carol in Columbia" },
  SD: { name: "South Dakota", capital: "Pierre", room: "plains", star: [417.3, 164.2], hook: "South coat on a pier" },
  TN: { name: "Tennessee", capital: "Nashville", room: "river", star: [659.7, 337.8], hook: "Ten nests in Nashville" },
  TX: { name: "Texas", capital: "Austin", room: "plains", star: [400, 430], hook: "A taxi saying ah in tin" },
  UT: { name: "Utah", capital: "Salt Lake City", room: "high", star: [223.7, 247.9], hook: "You-tah shakes salt on a lake" },
  VT: { name: "Vermont", capital: "Montpelier", room: "tide", star: [846.9, 126.8], hook: "A V mountain on a mont-peeler" },
  VA: { name: "Virginia", capital: "Richmond", room: "low", star: [800, 280], hook: "A virginian on a rich mound" },
  WA: { name: "Washington", capital: "Olympia", room: "pacific", star: [90, 40], hook: "Washing a ton at Olympus" },
  WV: { name: "West Virginia", capital: "Charleston", room: "river", star: [752.9, 261.2], hook: "West V at a charleston dance" },
  WI: { name: "Wisconsin", capital: "Madison", room: "lakes", star: [576.5, 151.9], hook: "A whisk on cons in Madison" },
  WY: { name: "Wyoming", capital: "Cheyenne", room: "high", star: [300.0, 180.8], hook: "A why-oming shy hen" }
};

window.STATE_IDS = Object.keys(window.STATES);

window.ALIASES = {
  "saint paul": "st. paul",
  "st paul": "st. paul",
  "washington dc": "washington, d.c.",
  "washington d.c.": "washington, d.c.",
  "washington d.c": "washington, d.c."
};

window.AVATARS = ["\ud83e\udd81","\ud83d\udc3b","\ud83e\udd8a","\ud83d\udc3c","\ud83e\udd84","\ud83d\udc38","\ud83d\udc27","\ud83d\udc2f","\ud83d\udc28","\ud83c\udf1f","\ud83d\ude80","\ud83c\udf88"];
window.FACETS = ["locate", "nameState", "spellState", "nameCapital", "spellCapital"];
window.STATE_WORDS = ["new", "practicing", "getting solid", "shining"];
