export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerName: string;
  phone: string;
  email: string;
  whatsappNumber?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    pincode: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  businessDetails: {
    licenseNumber: string;
    gstNumber?: string;
    panNumber?: string;
    fssaiLicense?: string;
  };
  operatingHours: {
    isOpen: boolean;
    is24Hours: boolean;
    schedule: {
      [key: string]: {
        isOpen: boolean;
        openTime?: string;
        closeTime?: string;
        breakTime?: {
          start: string;
          end: string;
        };
      };
    };
  };
  deliveryInfo: {
    deliveryRadius: number; // km
    minimumOrderAmount: number;
    deliveryFee: number;
    freeDeliveryAbove: number;
    estimatedDeliveryTime: string;
    deliveryAreas: string[];
  };
  ratings: {
    overall: number;
    totalReviews: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  performance: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averagePreparationTime: number; // minutes
    onTimeDeliveryRate: number; // percentage
    responseTime: number; // seconds
  };
  features: {
    acceptsCashOnDelivery: boolean;
    instantConfirmation: boolean;
    specialOffers: boolean;
    loyaltyProgram: boolean;
    giftWrapping: boolean;
    bulkOrders: boolean;
  };
  images: {
    logo: string;
    storefront: string;
    interior?: string[];
    products?: string[];
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  specialties: string[];
  badges: string[];
  commissionRate: number;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  joinedDate: string;
  lastActive: string;
}

export const demoShops: Shop[] = [
  {
    id: '1',
    name: 'Premium Liquor Store',
    slug: 'premium-liquor-store',
    description: 'Your one-stop destination for premium alcoholic beverages. We offer a wide selection of imported and domestic brands at competitive prices.',
    ownerName: 'Rajesh Kumar',
    phone: '+91-9876543210',
    email: 'owner@premiumliquor.com',
    whatsappNumber: '+91-9876543210',
    address: {
      addressLine1: '123, MG Road',
      addressLine2: 'Near Metro Station',
      landmark: 'Opposite City Mall',
      pincode: '110001',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    businessDetails: {
      licenseNumber: 'DL-LQ-2023-001234',
      gstNumber: '07AABCP1234L1Z1',
      panNumber: 'AABCP1234L',
      fssaiLicense: '10017047000123',
    },
    operatingHours: {
      isOpen: true,
      is24Hours: false,
      schedule: {
        monday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        tuesday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        wednesday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        thursday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        friday: { isOpen: true, openTime: '10:00', closeTime: '23:30' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '23:30' },
        sunday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
      },
    },
    deliveryInfo: {
      deliveryRadius: 8,
      minimumOrderAmount: 299,
      deliveryFee: 49,
      freeDeliveryAbove: 999,
      estimatedDeliveryTime: '8-12 min',
      deliveryAreas: ['Connaught Place', 'Khan Market', 'India Gate', 'Karol Bagh', 'Paharganj'],
    },
    ratings: {
      overall: 4.5,
      totalReviews: 1247,
      breakdown: {
        5: 623,
        4: 374,
        3: 186,
        2: 41,
        1: 23,
      },
    },
    performance: {
      totalOrders: 5432,
      completedOrders: 5234,
      cancelledOrders: 198,
      averagePreparationTime: 8,
      onTimeDeliveryRate: 94.5,
      responseTime: 45,
    },
    features: {
      acceptsCashOnDelivery: true,
      instantConfirmation: true,
      specialOffers: true,
      loyaltyProgram: true,
      giftWrapping: true,
      bulkOrders: true,
    },
    images: {
      logo: 'https://example.com/shop1-logo.jpg',
      storefront: 'https://example.com/shop1-front.jpg',
      interior: [
        'https://example.com/shop1-interior1.jpg',
        'https://example.com/shop1-interior2.jpg',
      ],
      products: [
        'https://example.com/shop1-products1.jpg',
        'https://example.com/shop1-products2.jpg',
      ],
    },
    socialMedia: {
      instagram: '@premiumliquorstore',
      facebook: 'premiumliquorstore',
      website: 'https://premiumliquor.com',
    },
    specialties: ['Premium Whiskeys', 'Imported Wines', 'Craft Beers', 'Single Malts'],
    badges: ['Top Performer', 'Fast Service', 'Customer Favorite'],
    commissionRate: 12,
    isActive: true,
    isFeatured: true,
    isVerified: true,
    joinedDate: '2023-01-15',
    lastActive: '2024-01-16T18:30:00Z',
  },
  {
    id: '2',
    name: 'City Wine & Spirits',
    slug: 'city-wine-spirits',
    description: 'Modern liquor store specializing in wines and premium spirits. We pride ourselves on excellent customer service and competitive pricing.',
    ownerName: 'Priya Sharma',
    phone: '+91-9876543211',
    email: 'info@citywine.com',
    whatsappNumber: '+91-9876543211',
    address: {
      addressLine1: '456, Park Street',
      addressLine2: 'Ground Floor',
      landmark: 'Near Park Hotel',
      pincode: '110003',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.6304,
      longitude: 77.2177,
    },
    businessDetails: {
      licenseNumber: 'DL-LQ-2023-001235',
      gstNumber: '07AABCP1235M1Z1',
      panNumber: 'AABCP1235M',
      fssaiLicense: '10017047000124',
    },
    operatingHours: {
      isOpen: true,
      is24Hours: false,
      schedule: {
        monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' },
      },
    },
    deliveryInfo: {
      deliveryRadius: 6,
      minimumOrderAmount: 399,
      deliveryFee: 39,
      freeDeliveryAbove: 899,
      estimatedDeliveryTime: '10-15 min',
      deliveryAreas: ['CP', 'Khan Market', 'Lodhi Road', 'Safdarjung'],
    },
    ratings: {
      overall: 4.2,
      totalReviews: 892,
      breakdown: {
        5: 401,
        4: 267,
        3: 134,
        2: 67,
        1: 23,
      },
    },
    performance: {
      totalOrders: 3456,
      completedOrders: 3298,
      cancelledOrders: 158,
      averagePreparationTime: 12,
      onTimeDeliveryRate: 91.2,
      responseTime: 62,
    },
    features: {
      acceptsCashOnDelivery: true,
      instantConfirmation: true,
      specialOffers: true,
      loyaltyProgram: false,
      giftWrapping: true,
      bulkOrders: true,
    },
    images: {
      logo: 'https://example.com/shop2-logo.jpg',
      storefront: 'https://example.com/shop2-front.jpg',
    },
    specialties: ['Premium Wines', 'Craft Spirits', 'Local Brands'],
    badges: ['Wine Specialist', 'Good Service'],
    commissionRate: 15,
    isActive: true,
    isFeatured: false,
    isVerified: true,
    joinedDate: '2023-03-22',
    lastActive: '2024-01-16T19:45:00Z',
  },
  {
    id: '3',
    name: 'Royal Beverages',
    slug: 'royal-beverages',
    description: 'Traditional liquor store with a modern touch. We offer authentic brands and personalized service to our valued customers.',
    ownerName: 'Amit Patel',
    phone: '+91-9876543212',
    email: 'contact@royalbeverages.com',
    address: {
      addressLine1: '789, Nehru Place',
      addressLine2: 'Shop No. 15',
      landmark: 'Near Metro Station',
      pincode: '110019',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.5494,
      longitude: 77.2500,
    },
    businessDetails: {
      licenseNumber: 'DL-LQ-2023-001236',
      gstNumber: '07AABCP1236N1Z1',
      panNumber: 'AABCP1236N',
    },
    operatingHours: {
      isOpen: true,
      is24Hours: false,
      schedule: {
        monday: { isOpen: true, openTime: '11:00', closeTime: '22:30' },
        tuesday: { isOpen: true, openTime: '11:00', closeTime: '22:30' },
        wednesday: { isOpen: true, openTime: '11:00', closeTime: '22:30' },
        thursday: { isOpen: true, openTime: '11:00', closeTime: '22:30' },
        friday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
        saturday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
        sunday: { isOpen: false },
      },
    },
    deliveryInfo: {
      deliveryRadius: 5,
      minimumOrderAmount: 499,
      deliveryFee: 59,
      freeDeliveryAbove: 1199,
      estimatedDeliveryTime: '12-18 min',
      deliveryAreas: ['Nehru Place', 'Kalkaji', 'Greater Kailash', 'Lajpat Nagar'],
    },
    ratings: {
      overall: 3.8,
      totalReviews: 567,
      breakdown: {
        5: 198,
        4: 170,
        3: 113,
        2: 57,
        1: 29,
      },
    },
    performance: {
      totalOrders: 2234,
      completedOrders: 2089,
      cancelledOrders: 145,
      averagePreparationTime: 15,
      onTimeDeliveryRate: 87.5,
      responseTime: 89,
    },
    features: {
      acceptsCashOnDelivery: true,
      instantConfirmation: false,
      specialOffers: false,
      loyaltyProgram: false,
      giftWrapping: false,
      bulkOrders: true,
    },
    images: {
      logo: 'https://example.com/shop3-logo.jpg',
      storefront: 'https://example.com/shop3-front.jpg',
    },
    specialties: ['Local Brands', 'Budget Options', 'Bulk Orders'],
    badges: ['Reliable Service'],
    commissionRate: 18,
    isActive: true,
    isFeatured: false,
    isVerified: true,
    joinedDate: '2023-05-10',
    lastActive: '2024-01-16T17:20:00Z',
  },
];