// ─────────────────────────────────────────────
//  COLORES — Palette Bourgogne
// ─────────────────────────────────────────────
export const Colors = {
  // Primarios
  burgundy: '#6B1A2A',       // Vino tinto oscuro
  burgundyLight: '#A0283F',  // Vino medio
  gold: '#C9973A',           // Dorado uva
  goldLight: '#E8BC6A',      // Dorado claro
  cream: '#F5EDD6',          // Crema pergamino
  // Neutros
  dark: '#1A0A00',           // Casi negro
  darkBrown: '#2D1A0A',      // Marrón oscuro
  brown: '#5C3317',          // Marrón barrica
  warmGray: '#8C7B6B',       // Gris cálido
  lightGray: '#E8DDD0',      // Gris muy claro
  white: '#FAFAF8',          // Blanco cálido
  // Funcionales
  success: '#4A7C59',        // Verde hoja vid
  warning: '#C9973A',
  error: '#C0392B',
  info: '#2980B9',
  // Mapa
  mapMarkerCave: '#6B1A2A',
  mapMarkerCommerce: '#C9973A',
  mapMarkerUser: '#2980B9',
};

// ─────────────────────────────────────────────
//  API DIJON MÉTROPOLE — OpenDataSoft
// ─────────────────────────────────────────────
export const API = {
  BASE_URL: 'https://data.metropole-dijon.fr/api/v2',
  DATASETS: {
    COMMERCES: 'commerces-de-dijon',
    EQUIPEMENTS_PUBLICS: 'equipements-publics',
    EQUIPEMENTS_ADMIN: 'equipements-administratifs',
    EQUIPEMENTS_SOCIAUX: 'equipements-sociaux',
    BATIMENTS: 'batis_ampliweb@dijon-metropole', // fallback
  },
  // Coordenadas centro de Dijon
  CENTER: {
    latitude: 47.3220,
    longitude: 5.0415,
  },
  DEFAULT_RADIUS: 5000, // metros
  MAX_RECORDS: 100,
};

// ─────────────────────────────────────────────
//  API TOURISTICO — data.gouv.fr / BFC Tourisme
// ─────────────────────────────────────────────
export const TOURISM_API = {
  // API Datatourisme nacional — sin auth requerida
  BASE_URL: 'https://diffuseur.datatourisme.fr/webservice',
  // API de Bourgogne caves — BIVB (Bureau Interprofessionnel Vins Bourgogne)
  // Se usa via la API pública de data.gouv.fr
  CAVES_SEARCH: 'https://api-adresse.data.gouv.fr/search',
};

// ─────────────────────────────────────────────
//  CATEGORÍAS DE COMMERCES (Dijon dataset)
// ─────────────────────────────────────────────
export const COMMERCE_CATEGORIES = {
  CAVE: ['cave', 'vins', 'caviste', 'vin'],
  RESTAURANT: ['restaurant', 'brasserie', 'bistrot', 'café', 'bar'],
  GASTRONOMIE: ['fromagerie', 'charcuterie', 'épicerie', 'traiteur', 'boulangerie'],
  ARTISANAT: ['artisan', 'poterie', 'galerie'],
};

// ─────────────────────────────────────────────
//  DONNÉES MOCK — fallback si API no responde
// ─────────────────────────────────────────────
export const MOCK_CAVES = [
  {
    id: 'mock-1',
    name: 'Caves de la Reine Pédauque',
    address: '2 route de Beaune, Aloxe-Corton',
    latitude: 47.0654,
    longitude: 4.8699,
    category: 'cave',
    description: 'Cave historique au cœur de la Côte de Beaune. Visites et dégustations.',
    phone: '+33 3 80 25 00 00',
    website: 'https://www.reine-pedauque.com',
    openingHours: 'Lun-Dim: 10h-18h',
    appellations: ['Aloxe-Corton', 'Corton-Charlemagne', 'Pernand-Vergelesses'],
    distance: null,
  },
  {
    id: 'mock-2',
    name: 'Bouchard Père & Fils',
    address: '15 Château de Beaune, Beaune',
    latitude: 47.0248,
    longitude: 4.8393,
    category: 'cave',
    description: 'Domaine emblématique de Bourgogne. Plus de 300 ans d\'histoire vinicole.',
    phone: '+33 3 80 24 80 24',
    website: 'https://www.bouchard-pereetfils.com',
    openingHours: 'Lun-Dim: 9h30-18h30',
    appellations: ['Beaune', 'Meursault', 'Gevrey-Chambertin'],
    distance: null,
  },
  {
    id: 'mock-3',
    name: 'Maison Louis Jadot',
    address: '21 rue Eugène Spuller, Beaune',
    latitude: 47.0261,
    longitude: 4.8352,
    category: 'cave',
    description: 'Maison de négoce-éleveur fondée en 1859. Vins de grande renommée mondiale.',
    phone: '+33 3 80 22 10 57',
    website: 'https://www.louisjadot.com',
    openingHours: 'Lun-Ven: 9h-17h',
    appellations: ['Gevrey-Chambertin', 'Chambolle-Musigny', 'Nuits-Saint-Georges'],
    distance: null,
  },
  {
    id: 'mock-4',
    name: 'Cave Millésime — Dijon Centre',
    address: '15 rue de la Liberté, Dijon',
    latitude: 47.3219,
    longitude: 5.0407,
    category: 'cave',
    description: 'Caviste indépendant au cœur de Dijon. Sélection pointue de vins de Bourgogne.',
    phone: '+33 3 80 30 15 45',
    website: null,
    openingHours: 'Mar-Sam: 10h-19h30',
    appellations: ['Gevrey-Chambertin', 'Meursault', 'Chablis'],
    distance: null,
  },
  {
    id: 'mock-5',
    name: 'L\'Imaginaire — Cave à Vins',
    address: '4 rue Bannelier, Dijon',
    latitude: 47.3231,
    longitude: 5.0421,
    category: 'cave',
    description: 'Vins naturels et biodynamiques de Bourgogne. Dégustations sur place.',
    phone: '+33 3 80 68 12 33',
    website: null,
    openingHours: 'Mer-Sam: 11h-20h',
    appellations: ['Irancy', 'Auxey-Duresses', 'Mâcon'],
    distance: null,
  },
  {
    id: 'mock-6',
    name: 'Domaine de la Vougeraie',
    address: 'Route nationale, Prémeaux-Prissey',
    latitude: 47.1127,
    longitude: 4.9530,
    category: 'cave',
    description: 'Domaine en biodynamie. Wines from Gevrey to Puligny.',
    phone: '+33 3 80 62 48 25',
    website: 'https://www.domainedelavougeraie.com',
    openingHours: 'Sur RDV uniquement',
    appellations: ['Vougeot', 'Bonnes-Mares', 'Clos Blanc de Vougeot'],
    distance: null,
  },
];

export const ROUTES_VIN = [
  {
    id: 'route-1',
    name: 'Route des Grands Crus',
    description: 'De Dijon à Santenay — 60 km à travers les appellations les plus prestigieuses de Bourgogne.',
    duration: '1 journée',
    distance: '60 km',
    difficulty: 'Facile',
    waypoints: [
      { name: 'Dijon', lat: 47.3220, lng: 5.0415 },
      { name: 'Marsannay-la-Côte', lat: 47.2716, lng: 5.0048 },
      { name: 'Gevrey-Chambertin', lat: 47.2244, lng: 4.9714 },
      { name: 'Vougeot', lat: 47.1722, lng: 4.9546 },
      { name: 'Nuits-Saint-Georges', lat: 47.1192, lng: 4.9504 },
      { name: 'Beaune', lat: 47.0248, lng: 4.8393 },
    ],
    color: '#6B1A2A',
  },
  {
    id: 'route-2',
    name: 'Route des Hautes-Côtes',
    description: 'Les villages perchés au-dessus de la Côte de Nuits. Vins d\'altitude et paysages spectaculaires.',
    duration: 'Demi-journée',
    distance: '35 km',
    difficulty: 'Modéré',
    waypoints: [
      { name: 'Nuits-Saint-Georges', lat: 47.1192, lng: 4.9504 },
      { name: 'Villars-Fontaine', lat: 47.1600, lng: 4.8900 },
      { name: 'Meuilley', lat: 47.1800, lng: 4.8750 },
    ],
    color: '#C9973A',
  },
];
