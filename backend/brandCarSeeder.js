const mongoose = require("mongoose");
const Car = require("./models/Car");
const dotenv = require("dotenv");
const colors = require("colors");

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 12 Popular Car Models with Brand-Specific Images
const cars = [
  {
    name: "Mercedes-Benz C-Class",
    description:
      "Experience luxury and performance with the Mercedes-Benz C-Class. This premium sedan offers exceptional comfort, advanced safety features, and a smooth driving experience perfect for business trips or special occasions.",
    type: "luxury",
    price: 120,
    discountPrice: 99,
    year: 2023,
    transmission: "AUTO",
    mileage: "15 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "mercedes-c-class.jpg",
    gallery: [
      "mercedes-c-class-interior.jpg",
      "mercedes-c-class-side.jpg",
      "mercedes-c-class-rear.jpg",
    ],
    features: [
      "MBUX Infotainment",
      "Air Conditioning",
      "Bluetooth Connectivity",
      "GPS Navigation",
      "Backup Camera",
      "Leather Seats",
      "Sunroof",
      "Premium Audio System",
    ],
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "BMW 3 Series",
    description:
      "The BMW 3 Series is the ultimate driving machine with sporty handling, premium interior, and cutting-edge technology. Perfect for those who appreciate driving dynamics combined with luxury.",
    type: "luxury",
    price: 110,
    discountPrice: 89,
    year: 2023,
    transmission: "AUTO",
    mileage: "16 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "bmw-3-series.jpg",
    gallery: [
      "bmw-3-series-interior.jpg",
      "bmw-3-series-side.jpg",
      "bmw-3-series-rear.jpg",
    ],
    features: [
      "iDrive System",
      "Climate Control",
      "Harman Kardon Sound",
      "Heated Seats",
      "Parking Sensors",
      "LED Headlights",
      "Keyless Entry",
      "Sport Mode",
    ],
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Audi A4",
    description:
      "The sophisticated Audi A4 delivers a perfect blend of technology, comfort and refined driving dynamics. Its elegant design and premium materials make every journey special.",
    type: "luxury",
    price: 115,
    discountPrice: 95,
    year: 2023,
    transmission: "AUTO",
    mileage: "17 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "audi-a4.jpg",
    gallery: ["audi-a4-interior.jpg", "audi-a4-side.jpg", "audi-a4-rear.jpg"],
    features: [
      "Virtual Cockpit",
      "Quattro AWD",
      "Bang & Olufsen Audio",
      "Panoramic Sunroof",
      "Leather Interior",
      "Ambient Lighting",
      "Wireless Charging",
    ],
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Toyota Camry",
    description:
      "The reliable Toyota Camry offers a comfortable and fuel-efficient ride with spacious interiors and modern technology features. Perfect for family trips and daily commutes.",
    type: "sedan",
    price: 75,
    discountPrice: 65,
    year: 2023,
    transmission: "AUTO",
    mileage: "20 km/l",
    fuel: "Hybrid",
    seats: 5,
    image: "toyota-camry.jpg",
    gallery: [
      "toyota-camry-interior.jpg",
      "toyota-camry-side.jpg",
      "toyota-camry-rear.jpg",
    ],
    features: [
      "Toyota Safety Sense",
      "Entune Infotainment",
      "Dual-Zone Climate",
      "Blind Spot Monitor",
      "Lane Departure Alert",
      "Adaptive Cruise Control",
    ],
    isAvailable: true,
    isPopular: false,
  },
  {
    name: "Honda Accord",
    description:
      "The Honda Accord combines reliability, fuel efficiency, and advanced safety features in a stylish sedan package. Known for its spacious interior and smooth ride quality.",
    type: "sedan",
    price: 78,
    discountPrice: 70,
    year: 2023,
    transmission: "AUTO",
    mileage: "19 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "honda-accord.jpg",
    gallery: [
      "honda-accord-interior.jpg",
      "honda-accord-side.jpg",
      "honda-accord-rear.jpg",
    ],
    features: [
      "Honda Sensing",
      "Apple CarPlay",
      "Android Auto",
      "Remote Start",
      "Heated Seats",
      "Power Moonroof",
      "Premium Audio",
    ],
    isAvailable: true,
    isPopular: false,
  },
  {
    name: "Tesla Model 3",
    description:
      "Experience the future of driving with the Tesla Model 3. This all-electric sedan offers incredible performance, cutting-edge technology, and zero emissions.",
    type: "luxury",
    price: 150,
    discountPrice: 130,
    year: 2023,
    transmission: "AUTO",
    mileage: "500 km range",
    fuel: "Electric",
    seats: 5,
    image: "tesla-model-3.jpg",
    gallery: [
      "tesla-model-3-interior.jpg",
      "tesla-model-3-side.jpg",
      "tesla-model-3-rear.jpg",
    ],
    features: [
      "Autopilot",
      "15-inch Touchscreen",
      "Supercharger Access",
      "Over-the-Air Updates",
      "Premium Connectivity",
      "Glass Roof",
      "Mobile Connector",
    ],
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Ford Mustang",
    description:
      "The iconic Ford Mustang delivers pure American muscle car experience with powerful performance, distinctive styling, and exhilarating driving dynamics.",
    type: "sports",
    price: 200,
    discountPrice: 180,
    year: 2023,
    transmission: "MANUAL",
    mileage: "12 km/l",
    fuel: "Petrol",
    seats: 4,
    image: "ford-mustang.jpg",
    gallery: [
      "ford-mustang-interior.jpg",
      "ford-mustang-side.jpg",
      "ford-mustang-rear.jpg",
    ],
    features: [
      "V8 Engine",
      "Sport Suspension",
      "Performance Package",
      "Launch Control",
      "Track Apps",
      "Recaro Seats",
      "Brembo Brakes",
    ],
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Chevrolet Camaro",
    description:
      "The Chevrolet Camaro is a legendary American sports car that combines aggressive styling with impressive performance and modern technology features.",
    type: "sports",
    price: 190,
    discountPrice: 170,
    year: 2023,
    transmission: "AUTO",
    mileage: "13 km/l",
    fuel: "Petrol",
    seats: 4,
    image: "chevrolet-camaro.jpg",
    gallery: [
      "chevrolet-camaro-interior.jpg",
      "chevrolet-camaro-side.jpg",
      "chevrolet-camaro-rear.jpg",
    ],
    features: [
      "Performance Data Recorder",
      "Magnetic Ride Control",
      "Head-Up Display",
      "Wireless Charging",
      "Ventilated Seats",
      "Performance Exhaust",
    ],
    isAvailable: true,
    isPopular: false,
  },
  {
    name: "Jeep Wrangler",
    description:
      "The rugged Jeep Wrangler is built for adventure with exceptional off-road capabilities, removable doors and roof, and iconic design that stands out anywhere.",
    type: "suv",
    price: 140,
    discountPrice: 125,
    year: 2023,
    transmission: "AUTO",
    mileage: "14 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "jeep-wrangler.jpg",
    gallery: [
      "jeep-wrangler-interior.jpg",
      "jeep-wrangler-side.jpg",
      "jeep-wrangler-rear.jpg",
    ],
    features: [
      "4x4 Capability",
      "Removable Doors",
      "Fold-Down Windshield",
      "Rock Rails",
      "Skid Plates",
      "Uconnect System",
      "LED Lighting",
    ],
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Range Rover Evoque",
    description:
      "The stylish Range Rover Evoque combines luxury with capability, offering premium materials, advanced technology, and excellent on and off-road performance.",
    type: "suv",
    price: 180,
    discountPrice: 160,
    year: 2023,
    transmission: "AUTO",
    mileage: "15 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "range-rover-evoque.jpg",
    gallery: [
      "range-rover-evoque-interior.jpg",
      "range-rover-evoque-side.jpg",
      "range-rover-evoque-rear.jpg",
    ],
    features: [
      "Terrain Response",
      "Meridian Audio",
      "Panoramic Roof",
      "Windsor Leather",
      "Configurable Dynamics",
      "Touch Pro Duo",
      "ClearSight Technology",
    ],
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Volkswagen Golf",
    description:
      "The Volkswagen Golf is a versatile compact car that offers German engineering, fuel efficiency, and a perfect balance of performance and practicality.",
    type: "economy",
    price: 60,
    discountPrice: 50,
    year: 2023,
    transmission: "AUTO",
    mileage: "22 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "volkswagen-golf.jpg",
    gallery: [
      "volkswagen-golf-interior.jpg",
      "volkswagen-golf-side.jpg",
      "volkswagen-golf-rear.jpg",
    ],
    features: [
      "Digital Cockpit",
      "Car-Net Connectivity",
      "Adaptive Cruise Control",
      "Blind Spot Monitor",
      "App-Connect",
      "Climatronic AC",
    ],
    isAvailable: true,
    isPopular: false,
  },
  {
    name: "Hyundai Elantra",
    description:
      "The modern Hyundai Elantra offers exceptional value with contemporary styling, advanced safety features, and impressive fuel economy in a compact sedan package.",
    type: "economy",
    price: 55,
    discountPrice: 45,
    year: 2023,
    transmission: "AUTO",
    mileage: "24 km/l",
    fuel: "Petrol",
    seats: 5,
    image: "hyundai-elantra.jpg",
    gallery: [
      "hyundai-elantra-interior.jpg",
      "hyundai-elantra-side.jpg",
      "hyundai-elantra-rear.jpg",
    ],
    features: [
      "SmartSense Safety",
      "Wireless Android Auto",
      "Wireless Apple CarPlay",
      "Bose Premium Audio",
      "Blue Link Connected Services",
      "Heated/Ventilated Seats",
    ],
    isAvailable: true,
    isPopular: false,
  },
];

// Import into DB
const importData = async () => {
  try {
    await Car.deleteMany();
    await Car.create(cars);
    console.log("Car data imported successfully!".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Car.deleteMany();
    console.log("Car data destroyed successfully!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Please add a proper flag: -i (import) or -d (delete)");
  process.exit();
}
