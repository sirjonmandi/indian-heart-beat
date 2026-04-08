export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  alcoholPercentage: number;
  volume: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  preparationTime: number; // minutes
  sku: string;
  barcode?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  servingSize?: string;
  ingredients?: string[];
  manufacturer?: string;
  countryOfOrigin: string;
  ageRestriction: number;
  createdAt?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  volume: string;
  price: number;
  originalPrice?: number;
  sku: string;
  inStock: boolean;
}

export const demoProducts: Product[] = [
  // BEER CATEGORY
  {
    id: '1',
    name: 'Kingfisher Ultra',
    brand: 'Kingfisher',
    category: 'Beer',
    price: 180,
    originalPrice: 200,
    image: 'https://example.com/kingfisher-ultra.jpg',
    images: [
      'https://example.com/kingfisher-ultra-1.jpg',
      'https://example.com/kingfisher-ultra-2.jpg',
      'https://example.com/kingfisher-ultra-3.jpg'
    ],
    description: 'Kingfisher Ultra is a premium lager beer with a smooth, crisp taste and refreshing finish. Brewed with the finest ingredients for a superior drinking experience.',
    alcoholPercentage: 4.8,
    volume: '650ml',
    rating: 4.2,
    reviewCount: 1285,
    inStock: true,
    stockQuantity: 150,
    tags: ['Premium', 'Lager', 'Refreshing', 'Popular'],
    preparationTime: 2,
    sku: 'KF-ULTRA-650',
    barcode: '8901030875526',
    isPopular: true,
    isFeatured: true,
    servingSize: 'Best served chilled at 4-6°C',
    ingredients: ['Water', 'Malted Barley', 'Rice', 'Hops', 'Yeast'],
    manufacturer: 'United Breweries Limited',
    countryOfOrigin: 'India',
    ageRestriction: 21,
    createdAt: '2023-01-15',
    variants: [
      {
        id: '1a',
        name: 'Kingfisher Ultra 330ml',
        volume: '330ml',
        price: 95,
        originalPrice: 110,
        sku: 'KF-ULTRA-330',
        inStock: true
      },
      {
        id: '1b',
        name: 'Kingfisher Ultra 500ml',
        volume: '500ml',
        price: 140,
        sku: 'KF-ULTRA-500',
        inStock: true
      }
    ]
  },
  {
    id: '2',
    name: 'Heineken',
    brand: 'Heineken',
    category: 'Beer',
    price: 220,
    image: 'https://example.com/heineken.jpg',
    description: 'Heineken is a premium Dutch lager beer with a distinctive taste and crisp finish. Made with pure malt, hops, yeast and water.',
    alcoholPercentage: 5.0,
    volume: '650ml',
    rating: 4.5,
    reviewCount: 892,
    inStock: true,
    stockQuantity: 85,
    tags: ['Premium', 'International', 'Dutch', 'Classic'],
    preparationTime: 2,
    sku: 'HNK-650',
    isPopular: true,
    countryOfOrigin: 'Netherlands',
    ageRestriction: 21,
  },
  {
    id: '3',
    name: 'Budweiser',
    brand: 'Budweiser',
    category: 'Beer',
    price: 195,
    originalPrice: 220,
    image: 'https://example.com/budweiser.jpg',
    description: 'Budweiser is a medium-bodied, flavorful, crisp American-style lager. Brewed with the best barley malt and a blend of premium hop varieties.',
    alcoholPercentage: 4.5,
    volume: '650ml',
    rating: 4.1,
    reviewCount: 1156,
    inStock: true,
    stockQuantity: 120,
    tags: ['American', 'Classic', 'Crisp'],
    preparationTime: 2,
    sku: 'BUD-650',
    countryOfOrigin: 'India',
    ageRestriction: 21,
  },

  // WINE CATEGORY
  {
    id: '4',
    name: 'Sula Sauvignon Blanc',
    brand: 'Sula',
    category: 'Wine',
    price: 850,
    originalPrice: 950,
    image: 'https://example.com/sula-sauvignon.jpg',
    description: 'A crisp, dry white wine with tropical fruit flavors and citrusy notes. Perfect for pairing with seafood and light dishes.',
    alcoholPercentage: 12.5,
    volume: '750ml',
    rating: 4.3,
    reviewCount: 567,
    inStock: true,
    stockQuantity: 45,
    tags: ['White Wine', 'Dry', 'Citrusy', 'Premium'],
    preparationTime: 3,
    sku: 'SULA-SB-750',
    isFeatured: true,
    servingSize: 'Serve chilled at 8-10°C',
    countryOfOrigin: 'India',
    ageRestriction: 21,
  },
  {
    id: '5',
    name: 'Jacob\'s Creek Shiraz',
    brand: 'Jacob\'s Creek',
    category: 'Wine',
    price: 1250,
    image: 'https://example.com/jacobs-creek.jpg',
    description: 'A full-bodied red wine with rich berry flavors and subtle oak notes. Perfect for red meat and hearty dishes.',
    alcoholPercentage: 13.8,
    volume: '750ml',
    rating: 4.6,
    reviewCount: 423,
    inStock: true,
    stockQuantity: 32,
    tags: ['Red Wine', 'Full-bodied', 'Australian', 'Premium'],
    preparationTime: 3,
    sku: 'JC-SHIRAZ-750',
    countryOfOrigin: 'Australia',
    ageRestriction: 21,
  },

  // WHISKEY CATEGORY
  {
    id: '6',
    name: 'Royal Challenge',
    brand: 'Royal Challenge',
    category: 'Whiskey',
    price: 1450,
    originalPrice: 1600,
    image: 'https://example.com/royal-challenge.jpg',
    description: 'Premium Indian whiskey with rich flavor and smooth finish. Aged to perfection for a superior drinking experience.',
    alcoholPercentage: 42.8,
    volume: '750ml',
    rating: 4.4,
    reviewCount: 789,
    inStock: true,
    stockQuantity: 65,
    tags: ['Premium', 'Indian', 'Smooth', 'Aged'],
    preparationTime: 3,
    sku: 'RC-750',
    isPopular: true,
    servingSize: 'Serve neat or with ice',
    countryOfOrigin: 'India',
    ageRestriction: 21,
  },
  {
    id: '7',
    name: 'Johnnie Walker Red Label',
    brand: 'Johnnie Walker',
    category: 'Whiskey',
    price: 2200,
    image: 'https://example.com/johnnie-red.jpg',
    description: 'World\'s best-selling Scotch Whisky. A blend of grain and malt whiskies with a distinctive smoky flavor.',
    alcoholPercentage: 40.0,
    volume: '750ml',
    rating: 4.7,
    reviewCount: 1423,
    inStock: true,
    stockQuantity: 28,
    tags: ['Scotch', 'Premium', 'Smoky', 'International'],
    preparationTime: 3,
    sku: 'JW-RED-750',
    isFeatured: true,
    countryOfOrigin: 'Scotland',
    ageRestriction: 21,
  },

  // VODKA CATEGORY
  {
    id: '8',
    name: 'Absolut Vodka',
    brand: 'Absolut',
    category: 'Vodka',
    price: 2400,
    originalPrice: 2600,
    image: 'https://example.com/absolut-vodka.jpg',
    description: 'Premium Swedish vodka with pure and clean taste. Made from winter wheat and pristine water.',
    alcoholPercentage: 40.0,
    volume: '750ml',
    rating: 4.8,
    reviewCount: 1156,
    inStock: true,
    stockQuantity: 42,
    tags: ['Premium', 'Swedish', 'Pure', 'Classic'],
    preparationTime: 2,
    sku: 'ABS-750',
    isPopular: true,
    isFeatured: true,
    countryOfOrigin: 'Sweden',
    ageRestriction: 21,
  },
  {
    id: '9',
    name: 'Grey Goose',
    brand: 'Grey Goose',
    category: 'Vodka',
    price: 4500,
    image: 'https://example.com/grey-goose.jpg',
    description: 'Ultra-premium French vodka crafted from the finest French wheat and pristine water from Gensac springs.',
    alcoholPercentage: 40.0,
    volume: '750ml',
    rating: 4.9,
    reviewCount: 634,
    inStock: true,
    stockQuantity: 18,
    tags: ['Ultra-Premium', 'French', 'Luxury', 'Smooth'],
    preparationTime: 3,
    sku: 'GG-750',
    countryOfOrigin: 'France',
    ageRestriction: 21,
  },

  // RUM CATEGORY
  {
    id: '10',
    name: 'Bacardi White Rum',
    brand: 'Bacardi',
    category: 'Rum',
    price: 1650,
    image: 'https://example.com/bacardi-white.jpg',
    description: 'Light and smooth white rum perfect for cocktails. Aged and filtered for exceptional smoothness.',
    alcoholPercentage: 37.5,
    volume: '750ml',
    rating: 4.3,
    reviewCount: 892,
    inStock: false,
    stockQuantity: 0,
    tags: ['White Rum', 'Cocktails', 'Smooth', 'Classic'],
    preparationTime: 2,
    sku: 'BAC-WHITE-750',
    countryOfOrigin: 'Puerto Rico',
    ageRestriction: 21,
  },
  {
    id: '11',
    name: 'Captain Morgan Spiced Rum',
    brand: 'Captain Morgan',
    category: 'Rum',
    price: 1850,
    originalPrice: 2000,
    image: 'https://example.com/captain-morgan.jpg',
    description: 'Spiced rum with hints of vanilla, brown sugar, and warm spices. Perfect for mixing or enjoying neat.',
    alcoholPercentage: 35.0,
    volume: '750ml',
    rating: 4.5,
    reviewCount: 721,
    inStock: true,
    stockQuantity: 35,
    tags: ['Spiced', 'Vanilla', 'Sweet', 'Popular'],
    preparationTime: 2,
    sku: 'CM-SPICED-750',
    countryOfOrigin: 'Jamaica',
    ageRestriction: 21,
  },

  // GIN CATEGORY
  {
    id: '12',
    name: 'Bombay Sapphire',
    brand: 'Bombay Sapphire',
    category: 'Gin',
    price: 2100,
    image: 'https://example.com/bombay-sapphire.jpg',
    description: 'Premium London Dry Gin with a distinctive blend of 10 botanicals. Perfect for cocktails.',
    alcoholPercentage: 40.0,
    volume: '750ml',
    rating: 4.6,
    reviewCount: 543,
    inStock: true,
    stockQuantity: 29,
    tags: ['London Dry', 'Botanicals', 'Premium', 'Cocktails'],
    preparationTime: 2,
    sku: 'BS-750',
    countryOfOrigin: 'England',
    ageRestriction: 21,
  },

  // MIXERS CATEGORY
  {
    id: '13',
    name: 'Schweppes Tonic Water',
    brand: 'Schweppes',
    category: 'Mixers',
    price: 80,
    image: 'https://example.com/schweppes-tonic.jpg',
    description: 'Premium tonic water with a distinctive bitter taste. Perfect mixer for gin and other spirits.',
    alcoholPercentage: 0,
    volume: '200ml',
    rating: 4.1,
    reviewCount: 234,
    inStock: true,
    stockQuantity: 200,
    tags: ['Mixer', 'Tonic', 'Bitter', 'Classic'],
    preparationTime: 1,
    sku: 'SCH-TONIC-200',
    countryOfOrigin: 'India',
    ageRestriction: 0,
  },
  {
    id: '14',
    name: 'Red Bull Energy Drink',
    brand: 'Red Bull',
    category: 'Mixers',
    price: 125,
    image: 'https://example.com/red-bull.jpg',
    description: 'Premium energy drink perfect for mixing with vodka and other spirits. Contains caffeine and taurine.',
    alcoholPercentage: 0,
    volume: '250ml',
    rating: 4.4,
    reviewCount: 1567,
    inStock: true,
    stockQuantity: 180,
    tags: ['Energy', 'Mixer', 'Caffeine', 'Popular'],
    preparationTime: 1,
    sku: 'RB-250',
    isPopular: true,
    countryOfOrigin: 'Austria',
    ageRestriction: 0,
  },
  {
    id: '15',
    name: 'Coca-Cola',
    brand: 'Coca-Cola',
    category: 'Mixers',
    price: 45,
    image: 'https://example.com/coca-cola.jpg',
    description: 'Classic cola soft drink. Perfect mixer for rum and whiskey cocktails.',
    alcoholPercentage: 0,
    volume: '300ml',
    rating: 4.3,
    reviewCount: 2341,
    inStock: true,
    stockQuantity: 300,
    tags: ['Cola', 'Classic', 'Mixer', 'Soft Drink'],
    preparationTime: 1,
    sku: 'CC-300',
    countryOfOrigin: 'India',
    ageRestriction: 0,
  },
];