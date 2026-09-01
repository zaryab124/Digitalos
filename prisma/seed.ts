import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Jampur Digital OS Seed (Phase 1 + Phase 2 + Phase 3)...");

  // 1. Seed Roles
  const roles = [
    {
      id: "CUSTOMER",
      name: "Customer / Citizen",
      description: "Local citizen accessing directory, reviews, services, and orders",
      permissions: JSON.stringify(["profile:manage", "order:place", "review:create", "service:request"]),
    },
    {
      id: "BUSINESS_OWNER",
      name: "Business Owner / Merchant",
      description: "Local shopkeeper or merchant managing catalog, offers, and orders",
      permissions: JSON.stringify(["profile:manage", "shop:create", "catalog:manage", "order:fulfill", "offer:create"]),
    },
    {
      id: "SERVICE_PROVIDER",
      name: "Service Provider / Artisan",
      description: "Skilled artisan or technician providing home & technical repairs",
      permissions: JSON.stringify(["profile:manage", "service:quote", "service:fulfill"]),
    },
    {
      id: "STUDENT",
      name: "Student / Youth",
      description: "Student applying for jobs, internships, and scholarships",
      permissions: JSON.stringify(["profile:manage", "job:apply"]),
    },
    {
      id: "FARMER",
      name: "Farmer / Agricultural Grower",
      description: "Agricultural grower accessing mandi rates and crop diagnosis",
      permissions: JSON.stringify(["profile:manage", "crop:diagnose"]),
    },
    {
      id: "RIDER",
      name: "Delivery Rider",
      description: "Delivery courier fulfilling on-demand orders in city",
      permissions: JSON.stringify(["profile:manage", "delivery:claim", "delivery:fulfill"]),
    },
    {
      id: "ADMIN",
      name: "City Administrator",
      description: "Local moderator managing shop verifications, rider approvals, and complaints",
      permissions: JSON.stringify([
        "profile:manage",
        "entity:verify_kyc",
        "review:moderate",
        "category:manage",
        "provider:moderate",
        "rider:moderate",
        "order:manage",
        "audit_logs:read",
      ]),
    },
    {
      id: "SUPER_ADMIN",
      name: "Super Administrator",
      description: "Full system-wide administrative control",
      permissions: JSON.stringify(["*"]),
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name, description: role.description, permissions: role.permissions },
      create: role,
    });
  }
  console.log("✅ Roles seeded.");

  // 2. Seed Cities
  const jampur = await prisma.city.upsert({
    where: { slug: "jampur" },
    update: {},
    create: {
      name: "Jampur",
      nameUr: "جام پور",
      slug: "jampur",
      country: "Pakistan",
      province: "Punjab",
      division: "D.G. Khan Division",
      district: "Rajanpur District",
      latitude: 29.6433,
      longitude: 70.595,
      radiusKm: 15.0,
      isActive: true,
    },
  });

  const rajanpur = await prisma.city.upsert({
    where: { slug: "rajanpur" },
    update: {},
    create: {
      name: "Rajanpur",
      nameUr: "راجن پور",
      slug: "rajanpur",
      country: "Pakistan",
      province: "Punjab",
      division: "D.G. Khan Division",
      district: "Rajanpur District",
      latitude: 29.1035,
      longitude: 70.325,
      radiusKm: 18.0,
      isActive: true,
    },
  });

  const dgKhan = await prisma.city.upsert({
    where: { slug: "dg-khan" },
    update: {},
    create: {
      name: "Dera Ghazi Khan",
      nameUr: "ڈیرہ غازی خان",
      slug: "dg-khan",
      country: "Pakistan",
      province: "Punjab",
      division: "D.G. Khan Division",
      district: "D.G. Khan District",
      latitude: 30.0561,
      longitude: 70.6348,
      radiusKm: 25.0,
      isActive: true,
    },
  });
  console.log("✅ Cities seeded.");

  // Seed Areas per city
  const jampurAreas = [
    { name: "Main Bazaar", nameUr: "مین بازار", postalCode: "33000" },
    { name: "College Road", nameUr: "کالج روڈ", postalCode: "33000" },
    { name: "Indus Highway", nameUr: "انڈس ہائی وے", postalCode: "33000" },
    { name: "Kotla Dewan", nameUr: "کوٹلہ دیوان", postalCode: "33000" },
    { name: "Railway Road", nameUr: "ریلوے روڈ", postalCode: "33000" },
    { name: "Dajal Road", nameUr: "داجل روڈ", postalCode: "33000" },
    { name: "Model Town", nameUr: "ماڈل ٹاؤن", postalCode: "33000" },
  ];

  await prisma.area.deleteMany({ where: { cityId: jampur.id } });
  for (const a of jampurAreas) {
    await prisma.area.create({
      data: {
        cityId: jampur.id,
        name: a.name,
        nameUr: a.nameUr,
        postalCode: a.postalCode,
        isActive: true,
      },
    });
  }

  const rajanpurAreas = [
    { name: "Katchery Road", nameUr: "کچہری روڈ", postalCode: "33500" },
    { name: "City Center", nameUr: "سٹی سنٹر", postalCode: "33500" },
    { name: "Kot Mithan Road", nameUr: "کوٹ مٹھن روڈ", postalCode: "33500" },
    { name: "Indus Highway", nameUr: "انڈس ہائی وے", postalCode: "33500" },
  ];

  await prisma.area.deleteMany({ where: { cityId: rajanpur.id } });
  for (const a of rajanpurAreas) {
    await prisma.area.create({
      data: {
        cityId: rajanpur.id,
        name: a.name,
        nameUr: a.nameUr,
        postalCode: a.postalCode,
        isActive: true,
      },
    });
  }

  const dgKhanAreas = [
    { name: "Model Town", nameUr: "ماڈل ٹاؤن", postalCode: "32200" },
    { name: "Block 1 to 10", nameUr: "بلاک 1 تا 10", postalCode: "32200" },
    { name: "College Road", nameUr: "کالج روڈ", postalCode: "32200" },
    { name: "Fort Munro Road", nameUr: "فورٹ منرو روڈ", postalCode: "32200" },
  ];

  await prisma.area.deleteMany({ where: { cityId: dgKhan.id } });
  for (const a of dgKhanAreas) {
    await prisma.area.create({
      data: {
        cityId: dgKhan.id,
        name: a.name,
        nameUr: a.nameUr,
        postalCode: a.postalCode,
        isActive: true,
      },
    });
  }
  console.log("✅ Seeded Areas for Jampur, Rajanpur & D.G. Khan.");

  // 3. Seed Users
  const passwordHashAdmin = await bcrypt.hash("Admin@12345", 10);
  const passwordHashMerchant = await bcrypt.hash("Merchant@12345", 10);
  const passwordHashProvider = await bcrypt.hash("Provider@12345", 10);
  const passwordHashCustomer = await bcrypt.hash("Customer@12345", 10);
  const passwordHashRider = await bcrypt.hash("Rider@12345", 10);

  const adminUser = await prisma.user.upsert({
    where: { phoneNumber: "+923001234000" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923001234000",
      email: "admin@jampurdigital.pk",
      passwordHash: passwordHashAdmin,
      fullName: "Jampur Admin",
      fullNameUr: "جام پور ایڈمن",
      preferredLanguage: "ur",
      isPhoneVerified: true,
      isActive: true,
      roles: {
        create: [{ roleId: "ADMIN" }, { roleId: "SUPER_ADMIN" }],
      },
    },
  });

  const merchantUser = await prisma.user.upsert({
    where: { phoneNumber: "+923001234001" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923001234001",
      email: "merchant@jampurdigital.pk",
      passwordHash: passwordHashMerchant,
      fullName: "Dr. Asim Farooq",
      fullNameUr: "ڈاکٹر عاصم فاروق",
      preferredLanguage: "ur",
      isPhoneVerified: true,
      isActive: true,
      roles: {
        create: [{ roleId: "BUSINESS_OWNER" }, { roleId: "CUSTOMER" }],
      },
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { phoneNumber: "+923001234003" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923001234003",
      email: "customer@jampurdigital.pk",
      passwordHash: passwordHashCustomer,
      fullName: "Muhammad Bilal",
      fullNameUr: "محمد بلال",
      preferredLanguage: "ur",
      isPhoneVerified: true,
      isActive: true,
      roles: {
        create: [{ roleId: "CUSTOMER" }],
      },
    },
  });

  // Providers Users
  const providerTariqUser = await prisma.user.upsert({
    where: { phoneNumber: "+923002222001" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923002222001",
      email: "tariq.electrician@jampurdigital.pk",
      passwordHash: passwordHashProvider,
      fullName: "Ustad Tariq Mahmood",
      fullNameUr: "استاد طارق محمود",
      preferredLanguage: "ur",
      isPhoneVerified: true,
      isActive: true,
      roles: {
        create: [{ roleId: "SERVICE_PROVIDER" }, { roleId: "CUSTOMER" }],
      },
    },
  });

  const providerImranUser = await prisma.user.upsert({
    where: { phoneNumber: "+923002222002" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923002222002",
      email: "imran.ac@jampurdigital.pk",
      passwordHash: passwordHashProvider,
      fullName: "Muhammad Imran AC Tech",
      fullNameUr: "محمد عمران اے سی ٹیکنیشن",
      preferredLanguage: "ur",
      isPhoneVerified: true,
      isActive: true,
      roles: {
        create: [{ roleId: "SERVICE_PROVIDER" }, { roleId: "CUSTOMER" }],
      },
    },
  });

  // Phase 3 Delivery Riders
  const riderKamranUser = await prisma.user.upsert({
    where: { phoneNumber: "+923004444001" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923004444001",
      email: "kamran.rider@jampurdigital.pk",
      passwordHash: passwordHashRider,
      fullName: "Kamran Ali Rider",
      fullNameUr: "کامران علی رائڈر",
      preferredLanguage: "ur",
      isPhoneVerified: true,
      isActive: true,
      roles: {
        create: [{ roleId: "RIDER" }, { roleId: "CUSTOMER" }],
      },
    },
  });

  const riderSajidUser = await prisma.user.upsert({
    where: { phoneNumber: "+923004444002" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923004444002",
      email: "sajid.rider@jampurdigital.pk",
      passwordHash: passwordHashRider,
      fullName: "Sajid Hussain Delivery",
      fullNameUr: "ساجد حسین ڈلیوری",
      preferredLanguage: "ur",
      isPhoneVerified: true,
      isActive: true,
      roles: {
        create: [{ roleId: "RIDER" }],
      },
    },
  });
  console.log("✅ Users seeded (Admin, Merchant, Customer, Providers, Riders).");

  // 4. Seed Business Categories
  const categoriesData = [
    {
      slug: "pharmacies",
      name: "Pharmacies & Health",
      nameUr: "میڈیکل اور ادویات",
      icon: "heart-pulse",
      description: "Verified pharmacies, clinics, and health centers",
    },
    {
      slug: "grocery",
      name: "Grocery & General Stores",
      nameUr: "کریانہ اور جنرل سٹورز",
      icon: "shopping-cart",
      description: "Superstores, wholesale grocery, and daily household items",
    },
    {
      slug: "electronics",
      name: "Electronics & Solar",
      nameUr: "الیکٹرانکس اور سولر",
      icon: "zap",
      description: "Solar panel distributors, inverters, batteries, and appliances",
    },
    {
      slug: "textiles",
      name: "Cloth & Fashion Bazaars",
      nameUr: "کپڑا اور فیشن بازار",
      icon: "shirt",
      description: "Unstitched fabrics, boutique collections, and tailoring",
    },
    {
      slug: "agriculture",
      name: "Agriculture & Fertilizers",
      nameUr: "زرعی ادویات اور کھاد",
      icon: "sprout",
      description: "Seed dealers, DAP/Urea fertilizers, and farm equipment",
    },
    {
      slug: "food",
      name: "Restaurants & Sweets",
      nameUr: "کھانے اور مٹھائی",
      icon: "utensils",
      description: "Traditional sweets, bakeries, fast food, and desi cuisine",
    },
    {
      slug: "automotive",
      name: "Automobile & Workshops",
      nameUr: "آٹو اور موٹرسائیکل ورکشاپ",
      icon: "wrench",
      description: "Auto mechanics, bike spare parts, and oil lubricants",
    },
    {
      slug: "hardware",
      name: "Hardware & Sanitary",
      nameUr: "ہارڈویئر اور سینیٹری",
      icon: "hammer",
      description: "Paints, sanitary fixtures, electrical cables, and tools",
    },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.businessCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameUr: cat.nameUr, icon: cat.icon, description: cat.description },
      create: cat,
    });
    catMap[cat.slug] = createdCat.id;
  }
  console.log("✅ Categories seeded.");

  // 5. Seed Businesses & Products
  const pharmacyBiz = await prisma.business.upsert({
    where: { cityId_slug: { cityId: jampur.id, slug: "al-razi-pharmacy" } },
    update: {},
    create: {
      cityId: jampur.id,
      ownerId: merchantUser.id,
      categoryId: catMap["pharmacies"],
      name: "Al-Razi Pharmacy & Medical Store",
      nameUr: "الرازی فارمیسی اینڈ میڈیکل سٹور",
      slug: "al-razi-pharmacy",
      description: "24/7 authentic medicines, baby formula, surgical items and emergency prescription delivery across Jampur.",
      descriptionUr: "مستند اور معیاری ادویات، بچوں کا دودھ اور سرجیکل آئٹمز۔ 24 گھنٹے دستیاب۔",
      phone: "+923008765432",
      whatsapp: "+923008765432",
      status: "APPROVED",
      isVerified: true,
      isFeatured: true,
      ratingAverage: 4.8,
      reviewCount: 12,
      locations: {
        create: {
          cityId: jampur.id,
          addressLine: "Opposite THQ Hospital, Main Indus Highway",
          addressLineUr: "سامنے ٹی ایچ کیو ہسپتال، انڈس ہائی وے، جام پور",
          area: "Indus Highway",
          landmark: "THQ Hospital",
          latitude: 29.645,
          longitude: 70.598,
        },
      },
      products: {
        create: [
          {
            name: "Paracetamol Panadol 500mg Box (200 Tablets)",
            nameUr: "پیناڈول 500 ایم جی",
            price: 680,
            compareAtPrice: 750,
            unit: "box",
            stockQuantity: 50,
            isAvailable: true,
            isDeliveryAvailable: true,
            discountPercentage: 9.3,
            imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
          },
          {
            name: "Digital Blood Pressure Monitor (Omron M2)",
            nameUr: "ڈیجیٹل بلڈ پریشر مانیٹر",
            price: 6500,
            compareAtPrice: 7200,
            unit: "piece",
            stockQuantity: 15,
            isAvailable: true,
            isDeliveryAvailable: true,
            discountPercentage: 9.7,
            imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&auto=format&fit=crop&q=60",
          },
          {
            name: "Accu-Chek Active Blood Glucose Strips (50 Strips)",
            nameUr: "شوگر ٹیسٹ سٹرپس",
            price: 2400,
            compareAtPrice: 2600,
            unit: "box",
            stockQuantity: 30,
            isAvailable: true,
            isDeliveryAvailable: true,
            discountPercentage: 7.7,
            imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
          },
        ],
      },
    },
  });

  const solarBiz = await prisma.business.upsert({
    where: { cityId_slug: { cityId: jampur.id, slug: "jampur-solar-centre" } },
    update: {},
    create: {
      cityId: jampur.id,
      ownerId: merchantUser.id,
      categoryId: catMap["electronics"],
      name: "Jampur Solar Energy & Inverter Centre",
      nameUr: "جام پور سولر انرجی اینڈ انورٹر سینٹر",
      slug: "jampur-solar-centre",
      description: "Authorized Tier-1 Longi/Jinko Solar Panels, Inverex Hybrid Inverters, Tubular Batteries and complete agricultural solar tube-well setups.",
      phone: "+923007654321",
      whatsapp: "+923007654321",
      status: "APPROVED",
      isVerified: true,
      isFeatured: true,
      ratingAverage: 4.9,
      reviewCount: 8,
      locations: {
        create: {
          cityId: jampur.id,
          addressLine: "Bypass Chowk, Kotla Dewan Road, Jampur",
          area: "Bypass Chowk",
          landmark: "Kotla Dewan Road",
        },
      },
      products: {
        create: [
          {
            name: "Longi Hi-MO 6 Solar Panel 585W Mono Perc (Tier-1)",
            nameUr: "لونگی 585 واٹ سولر پینل",
            price: 26325,
            compareAtPrice: 29000,
            unit: "piece",
            stockQuantity: 120,
            isAvailable: true,
            isDeliveryAvailable: true,
            discountPercentage: 9.2,
            imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=60",
          },
          {
            name: "Inverex Nitrox 6kW On-Grid/Hybrid Solar Inverter",
            nameUr: "انوریکس نائٹروکس 6 کلو واٹ انورٹر",
            price: 285000,
            compareAtPrice: 310000,
            unit: "piece",
            stockQuantity: 8,
            isAvailable: true,
            isDeliveryAvailable: true,
            discountPercentage: 8.0,
            imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60",
          },
          {
            name: "Osaka Tall Tubular Battery 230Ah (TR-2000)",
            nameUr: "اوساکا ٹیوبلر بیٹری 230 اے ایچ",
            price: 68500,
            compareAtPrice: 74000,
            unit: "piece",
            stockQuantity: 20,
            isAvailable: true,
            isDeliveryAvailable: true,
            discountPercentage: 7.4,
            imageUrl: "https://images.unsplash.com/photo-1558441719-8b489c6ef2d1?w=500&auto=format&fit=crop&q=60",
          },
        ],
      },
    },
  });
  console.log("✅ Businesses & Products seeded.");

  // 6. Seed Promotional Offers
  await prisma.offer.create({
    data: {
      businessId: solarBiz.id,
      title: "Ramadan & Summer Solar Mega Deal — 10% OFF Panels",
      titleUr: "سولر پینلز پر 10 فیصد خصوصی رعایت",
      description: "Get instant flat discounts on Longi & Jinko 585W panels with free delivery across Jampur.",
      discountPercentage: 10.0,
      minOrderAmount: 50000,
      isFeatured: true,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days valid
    },
  });

  await prisma.offer.create({
    data: {
      businessId: pharmacyBiz.id,
      title: "Free Medicine Delivery on Orders Above PKR 1,500",
      titleUr: "1500 روپے سے زائد ادویات پر مفت ڈلیوری",
      description: "Authentic prescriptions delivered to your doorstep within 30 minutes.",
      discountPercentage: 5.0,
      minOrderAmount: 1500,
      isFeatured: true,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Promotional Offers seeded.");

  // 7. Seed Multi-Vehicle Fleet & Riders (Bike, Rickshaw, Loader, Car)
  const rdrKamran = await prisma.deliveryRider.upsert({
    where: { userId: riderKamranUser.id },
    update: {
      vehicleCategory: "BIKE",
      vehicleType: "MOTORCYCLE",
      vehicleMakeModel: "Honda CD 70",
      serviceTypes: JSON.stringify(["PASSENGER_RIDE", "PARCEL_DELIVERY"]),
      baseFare: 50.0,
      perKmRate: 20.0,
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
      ridesCompleted: 142,
    },
    create: {
      userId: riderKamranUser.id,
      cityId: jampur.id,
      vehicleCategory: "BIKE",
      vehicleType: "MOTORCYCLE",
      vehicleMakeModel: "Honda CD 70",
      vehicleNumber: "DGK-8821",
      cnicNumber: "32402-4433221-7",
      licenseNumber: "LIC-DGK-9901",
      serviceTypes: JSON.stringify(["PASSENGER_RIDE", "PARCEL_DELIVERY"]),
      baseFare: 50.0,
      perKmRate: 20.0,
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
      deliveriesCompleted: 42,
      ridesCompleted: 142,
      totalEarnings: 8400,
      ratingAverage: 4.9,
    },
  });

  // Seed Auto Rickshaw Driver User & Profile
  const rickshawUser = await prisma.user.upsert({
    where: { phoneNumber: "+923005544332" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923005544332",
      passwordHash: passwordHashRider,
      fullName: "Ghulam Rasool (Auto Rickshaw)",
      fullNameUr: "غلام رسول آٹو رکشہ",
      isPhoneVerified: true,
      roles: { create: [{ roleId: "RIDER" }, { roleId: "CUSTOMER" }] },
    },
  });

  await prisma.deliveryRider.upsert({
    where: { userId: rickshawUser.id },
    update: {},
    create: {
      userId: rickshawUser.id,
      cityId: jampur.id,
      vehicleCategory: "AUTO_RICKSHAW",
      vehicleType: "RICKSHAW",
      vehicleMakeModel: "Sazgar 9-Seater CNG",
      vehicleNumber: "RJP-3319",
      cnicNumber: "32402-7788990-1",
      licenseNumber: "LIC-RJP-4421",
      serviceTypes: JSON.stringify(["PASSENGER_RIDE", "PARCEL_DELIVERY"]),
      baseFare: 100.0,
      perKmRate: 35.0,
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
      ridesCompleted: 218,
      deliveriesCompleted: 15,
      totalEarnings: 24500,
      ratingAverage: 4.8,
    },
  });

  // Seed Loader Rickshaw Driver (Merchant Cargo) User & Profile
  const loaderUser = await prisma.user.upsert({
    where: { phoneNumber: "+923007766554" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923007766554",
      passwordHash: passwordHashRider,
      fullName: "Haji Manzoor (Heavy Loader)",
      fullNameUr: "حاجی منظور ہیوی لوڈر رکشہ",
      isPhoneVerified: true,
      roles: { create: [{ roleId: "RIDER" }, { roleId: "CUSTOMER" }] },
    },
  });

  await prisma.deliveryRider.upsert({
    where: { userId: loaderUser.id },
    update: {},
    create: {
      userId: loaderUser.id,
      cityId: jampur.id,
      vehicleCategory: "LOADER_RICKSHAW",
      vehicleType: "LOADER",
      vehicleMakeModel: "New Asia 200cc Heavy Loader",
      vehicleNumber: "JMP-5544",
      cnicNumber: "32402-3344556-3",
      licenseNumber: "LIC-JMP-8812",
      serviceTypes: JSON.stringify(["MERCHANT_CARGO"]),
      cargoCapacityKg: 800.0,
      baseFare: 300.0,
      perKmRate: 60.0,
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
      cargoTripsCompleted: 95,
      totalEarnings: 48000,
      ratingAverage: 5.0,
    },
  });

  // Seed Car / AC Taxi Driver User & Profile
  const taxiUser = await prisma.user.upsert({
    where: { phoneNumber: "+923008899001" },
    update: {},
    create: {
      cityId: jampur.id,
      phoneNumber: "+923008899001",
      passwordHash: passwordHashRider,
      fullName: "Muhammad Imran (AC Cab)",
      fullNameUr: "محمد عمران اے سی کار ٹیکسی",
      isPhoneVerified: true,
      roles: { create: [{ roleId: "RIDER" }, { roleId: "CUSTOMER" }] },
    },
  });

  await prisma.deliveryRider.upsert({
    where: { userId: taxiUser.id },
    update: {},
    create: {
      userId: taxiUser.id,
      cityId: jampur.id,
      vehicleCategory: "CAR_TAXI",
      vehicleType: "CAR",
      vehicleMakeModel: "Suzuki Alto VXR AC",
      vehicleNumber: "DGK-4421",
      cnicNumber: "32402-9900112-5",
      licenseNumber: "LIC-DGK-1234",
      serviceTypes: JSON.stringify(["PASSENGER_RIDE"]),
      baseFare: 250.0,
      perKmRate: 50.0,
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
      ridesCompleted: 87,
      totalEarnings: 39500,
      ratingAverage: 4.9,
    },
  });

  await prisma.deliveryRider.upsert({
    where: { userId: riderSajidUser.id },
    update: {},
    create: {
      userId: riderSajidUser.id,
      cityId: jampur.id,
      vehicleCategory: "BIKE",
      vehicleType: "MOTORCYCLE",
      vehicleMakeModel: "United 70cc",
      vehicleNumber: "RJP-3344",
      cnicNumber: "32402-1122334-9",
      serviceTypes: JSON.stringify(["PASSENGER_RIDE", "PARCEL_DELIVERY"]),
      status: "PENDING", // Pending admin verification
      isVerified: false,
      isAvailable: false,
    },
  });
  // 7b. Seed Phase 2 Service Providers (Electrician & AC Tech)
  await prisma.serviceProvider.upsert({
    where: { userId: providerTariqUser.id },
    update: {
      categorySlug: "electronics",
      primarySkill: "Electrician & House Wiring",
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
    },
    create: {
      userId: providerTariqUser.id,
      cityId: jampur.id,
      categorySlug: "electronics",
      primarySkill: "Electrician & House Wiring",
      primarySkillUr: "الیکٹریشن اور ہاؤس وائرنگ",
      experienceYears: 8,
      baseVisitFee: 500,
      cnicNumber: "32402-5566778-1",
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
      ratingAverage: 4.9,
      jobsCompleted: 65,
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: providerImranUser.id },
    update: {
      categorySlug: "electronics",
      primarySkill: "AC Repair & Cooling",
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
    },
    create: {
      userId: providerImranUser.id,
      cityId: jampur.id,
      categorySlug: "electronics",
      primarySkill: "AC Repair & Cooling",
      primarySkillUr: "اے سی مرمت اور کولنگ",
      experienceYears: 6,
      baseVisitFee: 700,
      cnicNumber: "32402-8899001-2",
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
      ratingAverage: 4.8,
      jobsCompleted: 48,
    },
  });
  console.log("✅ Seeded Service Providers (Electrician & AC Technician).");

  // 8. Seed Sample Commerce Order
  const panadolProduct = await prisma.product.findFirst({
    where: { businessId: pharmacyBiz.id, name: { contains: "Panadol" } },
  });

  if (panadolProduct) {
    const existingOrder = await prisma.order.findUnique({ where: { orderNumber: "JMP-2026-0001" } });
    if (!existingOrder) {
      const sampleOrder = await prisma.order.create({
        data: {
          orderNumber: "JMP-2026-0001",
          customerId: customerUser.id,
          businessId: pharmacyBiz.id,
          cityId: jampur.id,
          riderId: rdrKamran.id,
          status: "OUT_FOR_DELIVERY",
        deliveryAddress: "House # 8, Street 2, Near Ghalla Mandi, Jampur",
        deliveryArea: "Ghalla Mandi",
        deliveryNotes: "Call when you reach the green gate.",
        deliveryPin: "4821",
        subtotal: 1360,
        deliveryFee: 100,
        discountAmount: 0,
        totalAmount: 1460,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        items: {
          create: [
            {
              productId: panadolProduct.id,
              name: panadolProduct.name,
              nameUr: panadolProduct.nameUr,
              unit: panadolProduct.unit,
              price: panadolProduct.price,
              quantity: 2,
              subtotal: 1360,
            },
          ],
        },
        payment: {
          create: {
            amount: 1460,
            currency: "PKR",
            method: "COD",
            status: "PENDING",
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: customerUser.id,
        title: "Order Out For Delivery",
        titleUr: "آرڈر راستے میں ہے",
        message: `Your order #${sampleOrder.orderNumber} is out for delivery with Kamran Ali Rider. Verification PIN: 4821.`,
        messageUr: `آپ کا آرڈر #${sampleOrder.orderNumber} ڈلیوری کیلئے روانہ ہو چکا ہے۔ تصدیقی پن کوڈ: 4821`,
        type: "ORDER_STATUS",
        link: `/orders/${sampleOrder.id}`,
      },
    });
    }
  }
  // ----------------------------------------------------
  // PHASE 5: SEED MANDI RATES & FARMER PROFILES
  // ----------------------------------------------------
  console.log("🌾 Seeding Phase 5 Mandi Rates & Agriculture Data...");

  const mandiRatesData = [
    {
      cropName: "Cotton (Phutti)",
      cropNameUr: "کپاس (پھٹی)",
      variety: "BT Quality Grade-A",
      mandiLocation: "Jampur Galla Mandi",
      minPrice: 8200,
      maxPrice: 8850,
      modalPrice: 8600,
      unit: "40 kg (1 Maan)",
      trend: "UP",
    },
    {
      cropName: "Wheat (Gandum)",
      cropNameUr: "گندم",
      variety: "Akbar / Dilkash",
      mandiLocation: "Jampur Galla Mandi",
      minPrice: 3800,
      maxPrice: 4150,
      modalPrice: 4000,
      unit: "40 kg (1 Maan)",
      trend: "STABLE",
    },
    {
      cropName: "Sugarcane (Kamad)",
      cropNameUr: "کماد / گنا",
      variety: "CPF-249",
      mandiLocation: "Kot Addu / Jampur Millgate",
      minPrice: 425,
      maxPrice: 450,
      modalPrice: 440,
      unit: "40 kg (1 Maan)",
      trend: "STABLE",
    },
    {
      cropName: "Sesame (White Til)",
      cropNameUr: "سفید تل",
      variety: "TH-6",
      mandiLocation: "Jampur Galla Mandi",
      minPrice: 16500,
      maxPrice: 18200,
      modalPrice: 17500,
      unit: "40 kg (1 Maan)",
      trend: "UP",
    },
    {
      cropName: "Mustard (Sarson / Raya)",
      cropNameUr: "سرسوں / رایا",
      variety: "Super Raya",
      mandiLocation: "Jampur Galla Mandi",
      minPrice: 6200,
      maxPrice: 6800,
      modalPrice: 6500,
      unit: "40 kg (1 Maan)",
      trend: "DOWN",
    },
    {
      cropName: "Paddy Rice (Dhan)",
      cropNameUr: "دھان / چاول",
      variety: "Super Basmati 1509",
      mandiLocation: "D.G. Khan / Jampur Mandi",
      minPrice: 4300,
      maxPrice: 4800,
      modalPrice: 4600,
      unit: "40 kg (1 Maan)",
      trend: "STABLE",
    },
  ];

  await prisma.mandiRate.deleteMany({ where: { cityId: jampur.id } });
  for (const rate of mandiRatesData) {
    await prisma.mandiRate.create({
      data: {
        cityId: jampur.id,
        ...rate,
      },
    });
  }
  console.log(`✅ Seeded ${mandiRatesData.length} Mandi Rates for Jampur.`);

  // Seed Farmer User & Profile
  const farmerPhone = "+923005544332";
  const passwordHashFarmer = await bcrypt.hash("Farmer@12345", 10);
  let farmerUser = await prisma.user.findUnique({ where: { phoneNumber: farmerPhone } });
  if (!farmerUser) {
    farmerUser = await prisma.user.create({
      data: {
        cityId: jampur.id,
        phoneNumber: farmerPhone,
        fullName: "Muhammad Tariq Khan",
        fullNameUr: "محمد طارق خان",
        passwordHash: passwordHashFarmer,
        roles: { create: [{ roleId: "FARMER" }] },
      },
    });
  }

  let farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId: farmerUser.id } });
  if (!farmerProfile) {
    farmerProfile = await prisma.farmerProfile.create({
      data: {
        userId: farmerUser.id,
        cityId: jampur.id,
        farmName: "Tariq Agro Farm Jampur",
        totalAcres: 20.0,
        irrigationType: "SOLAR_TUBEWELL",
        soilType: "CLAY_LOAM",
        villageMouza: "Mouza Kotla Dewan",
        addressLine: "Basti Dewan, Indus Highway, Jampur",
      },
    });

    // Seed Crops
    const cottonCrop = await prisma.crop.create({
      data: {
        farmerId: farmerProfile.id,
        name: "Cotton (Kapas)",
        nameUr: "کپاس",
        variety: "BT Cotton BS-15",
        acresPlanted: 12.0,
        sowingDate: new Date("2026-05-10"),
        expectedHarvestDate: new Date("2026-10-25"),
        stage: "FLOWERING",
        estimatedYieldMaunds: 360,
        notes: "Solar tubewell irrigation on 10-day cycle. Nitrophos applied at sowing.",
      },
    });

    await prisma.crop.create({
      data: {
        farmerId: farmerProfile.id,
        name: "Wheat (Gandum)",
        nameUr: "گندم",
        variety: "Akbar-2019",
        acresPlanted: 8.0,
        sowingDate: new Date("2026-11-15"),
        expectedHarvestDate: new Date("2027-04-15"),
        stage: "SOWING",
        estimatedYieldMaunds: 320,
        notes: "Planned for Rabi season after cotton picking.",
      },
    });

    // Seed Diagnosis
    await prisma.cropDiagnosis.create({
      data: {
        farmerId: farmerProfile.id,
        cropId: cottonCrop.id,
        cropName: "Cotton (Kapas)",
        symptoms: "Leaves curling upwards, yellow mosaic spots and tiny white flying insects under leaf surface.",
        diseaseDetected: "Cotton Whitefly (Safaid Makhi) & Early Leaf Curl Risk",
        diseaseDetectedUr: "کپاس کا سفید مکھی حملہ اور پتہ مروڑ کا خطرہ",
        confidenceScore: 0.92,
        explanation: "Whiteflies suck sap from the lower leaf surface and excrete honeydew which leads to sooty mold and transmits Cotton Leaf Curl Virus (CLCuV).",
        treatmentRecommendations: "1. Spray Pyriproxyfen @ 400ml/acre or Diafenthiuron @ 200g/acre.\n2. Ensure thorough spray coverage on leaf undersides.\n3. Avoid excess nitrogen fertilizer.",
        disclaimer: "⚠️ Advisory Notice: This AI diagnosis is for advisory reference only and not a guaranteed laboratory analysis. Consult your local Jampur Agriculture Extension Officer or certified agronomist before high-volume chemical application.",
        status: "ACTIVE",
      },
    });
  }
  // ----------------------------------------------------
  // PHASE 6: SEED STUDENT ECOSYSTEM & OPPORTUNITIES
  // ----------------------------------------------------
  console.log("🎓 Seeding Phase 6 Student Ecosystem & Opportunities...");

  // 1. Seed Educational Organizations
  const college = await prisma.educationalOrganization.create({
    data: {
      cityId: jampur.id,
      name: "Govt Post Graduate College Jampur",
      nameUr: "گورنمنٹ پوسٹ گریجویٹ کالج جام پور",
      type: "COLLEGE",
      address: "College Road, Jampur",
      phone: "+92604567123",
      website: "https://gpgcjampur.edu.pk",
      description: "Premier government college in Jampur offering Intermediate, BS 4-Year and Masters degrees.",
      isVerified: true,
    },
  });

  const uni = await prisma.educationalOrganization.create({
    data: {
      cityId: dgKhan.id,
      name: "Ghazi University Dera Ghazi Khan",
      nameUr: "غازی یونیورسٹی ڈیرہ غازی خان",
      type: "UNIVERSITY",
      address: "City Campus, D.G. Khan",
      phone: "+92649260124",
      website: "https://gudgk.edu.pk",
      description: "Public sector research university serving D.G. Khan, Jampur, and Rajanpur districts.",
      isVerified: true,
    },
  });

  const tevta = await prisma.educationalOrganization.create({
    data: {
      cityId: jampur.id,
      name: "TEVTA Vocational Training Institute Jampur",
      nameUr: "ٹیوٹا ووکیشنل ٹریننگ انسٹیٹیوٹ جام پور",
      type: "VOCATIONAL_INSTITUTE",
      address: "Indus Highway, Jampur",
      phone: "+92604568900",
      description: "Technical education institute providing IT, Solar Technician, and Electrician certified courses.",
      isVerified: true,
    },
  });

  // 2. Seed Verified Opportunities (Scholarships, Jobs, Internships, Training)
  const oppsData = [
    {
      cityId: jampur.id,
      organizationId: college.id,
      title: "PEEF South Punjab Quota Scholarship 2026",
      titleUr: "پیف جنوبی پنجاب خصوصی کوٹہ وظیفہ",
      type: "SCHOLARSHIP",
      organizationName: "Punjab Educational Endowment Fund (PEEF)",
      description: "Merit and need-based scholarship for intermediate & undergraduate students of District Rajanpur / Jampur.",
      eligibilityCriteria: "Minimum 60% marks in previous exam. Family income under PKR 60,000/month.",
      stipendOrSalary: "Full Tuition + PKR 5,000 / month",
      applicationDeadline: new Date("2026-10-31"),
      source: "Govt of Punjab Higher Education Portal",
      isVerified: true,
      status: "APPROVED",
    },
    {
      cityId: jampur.id,
      organizationId: uni.id,
      title: "HEC Need-Based Undergraduate Scholarship 2026",
      titleUr: "ایچ ای سی نیڈ بیسڈ اسکالرشپ",
      type: "SCHOLARSHIP",
      organizationName: "Higher Education Commission (HEC)",
      description: "Financial assistance for meritorious undergraduate students enrolled in BS programs.",
      eligibilityCriteria: "Enrolled in recognized degree program. Verified financial need.",
      stipendOrSalary: "Full Tuition Fee Waiver + Transport Allowance",
      applicationDeadline: new Date("2026-11-15"),
      source: "HEC Pakistan",
      isVerified: true,
      status: "APPROVED",
    },
    {
      cityId: jampur.id,
      title: "Computer Operator & Accounts Assistant",
      titleUr: "کمپیوٹر آپریٹر اور اکاؤنٹس اسسٹنٹ",
      type: "JOB",
      organizationName: "Al-Razi Pharmacy & Medicos Jampur",
      description: "Full-time position for managing POS inventory, daily billing, and customer records in Jampur.",
      eligibilityCriteria: "Intermediate or BS with proficiency in MS Excel and computer typing.",
      stipendOrSalary: "PKR 30,000 / month",
      location: "Indus Highway, Jampur",
      applicationDeadline: new Date("2026-09-30"),
      source: "Verified Jampur Employer",
      isVerified: true,
      status: "APPROVED",
    },
    {
      cityId: jampur.id,
      title: "Solar Engineering & Inverter Maintenance Intern",
      titleUr: "سولر انجینئرنگ اور انورٹر ٹرینی انٹرن شپ",
      type: "INTERNSHIP",
      organizationName: "Rehman Solar & Electronics Jampur",
      description: "Hands-on 3-month field internship assisting lead technicians in solar tubewell and battery installations.",
      eligibilityCriteria: "DAE Electrical or BS Technology students.",
      stipendOrSalary: "PKR 15,000 / month stipend",
      location: "Railway Road, Jampur",
      applicationDeadline: new Date("2026-09-25"),
      source: "Verified Local Enterprise",
      isVerified: true,
      status: "APPROVED",
    },
    {
      cityId: jampur.id,
      organizationId: tevta.id,
      title: "NAVTTC Prime Minister Youth IT & Freelancing Course",
      titleUr: "وزیراعظم یوتھ آئی ٹی اور فری لانسنگ کورس",
      type: "TRAINING",
      organizationName: "NAVTTC / TEVTA Jampur",
      description: "3-month government subsidized training in Python, Web Development, and Upwork/Fiverr freelancing.",
      eligibilityCriteria: "Age 18-35. Minimum Matriculation passed.",
      stipendOrSalary: "Free Course + Certificate + PKR 3,000 stipend",
      applicationDeadline: new Date("2026-10-15"),
      source: "Government of Pakistan",
      isVerified: true,
      status: "APPROVED",
    },
  ];

  await prisma.opportunity.deleteMany({ where: { cityId: jampur.id } });
  for (const opp of oppsData) {
    await prisma.opportunity.create({ data: opp });
  }
  console.log(`✅ Seeded ${oppsData.length} Verified Student Opportunities.`);

  // 3. Seed Student User & Profile
  const studentPhone = "+923004433221";
  const passwordHashStudent = await bcrypt.hash("Student@12345", 10);
  let studentUser = await prisma.user.findUnique({ where: { phoneNumber: studentPhone } });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        cityId: jampur.id,
        phoneNumber: studentPhone,
        fullName: "Bilal Hassan",
        fullNameUr: "بلال حسن",
        passwordHash: passwordHashStudent,
        roles: { create: [{ roleId: "STUDENT" }] },
      },
    });
  }

  let studentProfile = await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } });
  if (!studentProfile) {
    studentProfile = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        cityId: jampur.id,
        educationLevel: "BACHELORS",
        institutionName: "Govt Post Graduate College Jampur",
        fieldOfStudy: "BS Computer Science",
        skills: JSON.stringify(["Web Development", "Python", "Graphic Design", "MS Office"]),
        interests: JSON.stringify(["Freelancing", "Software Engineering", "Scholarships", "Tech Startups"]),
        graduationYear: 2027,
        bio: "Undergraduate CS student passionate about building digital software solutions for South Punjab.",
        cgpaOrMarks: "3.75 CGPA",
      },
    });

    // Seed Student Marketplace Listings
    await prisma.studentListing.create({
      data: {
        studentId: studentProfile.id,
        cityId: jampur.id,
        title: "KIPS MDCAT Complete Entry Test Preparation Books Set",
        titleUr: "کپس ایم ڈی کیٹ مکمل داخلہ ٹیسٹ تیاری کتب سیٹ",
        category: "BOOKS",
        price: 1800,
        condition: "LIKE_NEW",
        description: "Includes Biology, Chemistry, Physics and English latest syllabus guidebooks with solved MCQs.",
        contactPhone: studentPhone,
        status: "ACTIVE",
      },
    });

    await prisma.studentListing.create({
      data: {
        studentId: studentProfile.id,
        cityId: jampur.id,
        title: "Casio fx-991ES Plus Scientific Calculator (Original)",
        titleUr: "کیسیو سائنٹیفک کیلکولیٹر (اصل)",
        category: "DEVICES",
        price: 2400,
        condition: "GOOD",
        description: "Original Casio calculator with solar backup, perfect for FSc and Engineering students.",
        contactPhone: studentPhone,
        status: "ACTIVE",
      },
    });
  }
  console.log("✅ Seeded Student Profile & Marketplace Listings for Bilal Hassan.");

  // 4. Seed Study Circles & Groups
  const groupsData = [
    {
      cityId: jampur.id,
      name: "MDCAT & Medical Aspirants Circle Jampur",
      nameUr: "ایم ڈی کیٹ داخلہ ٹیسٹ گروپ جام پور",
      topicCategory: "MDCAT",
      description: "Collaborative study group for students preparing for King Edward, Nishtar, and Punjab medical colleges.",
      meetingSchedule: "Daily Online & Saturday at College Library",
      organizerContact: studentPhone,
      memberCount: 24,
      isActive: true,
    },
    {
      cityId: jampur.id,
      name: "Jampur Tech & Digital Freelancing Hub",
      nameUr: "جام پور ٹیک اور ڈیجیٹل فری لانسنگ گروپ",
      topicCategory: "FREELANCING",
      description: "Mentorship circle for local youth learning web development, graphic design, and Upwork client acquisition.",
      meetingSchedule: "Sunday 4:00 PM at TEVTA Lab",
      organizerContact: "+923001234000",
      memberCount: 38,
      isActive: true,
    },
  ];

  await prisma.studentGroup.deleteMany({ where: { cityId: jampur.id } });
  for (const grp of groupsData) {
    await prisma.studentGroup.create({ data: grp });
  }
  // ----------------------------------------------------
  // PHASE 8: SEED MONETIZATION, SUBSCRIPTIONS & PLATFORM SETTINGS
  // ----------------------------------------------------
  console.log("💰 Seeding Phase 8 Monetization, Subscriptions & Ad Campaigns...");

  // 1. Subscription Plans
  const plans = [
    {
      id: "plan-basic",
      name: "BASIC",
      nameUr: "بنیادی (مفت)",
      priceMonthly: 0,
      priceAnnual: 0,
      productLimit: 10,
      offerLimit: 1,
      canUseAiCopilot: false,
      canUseAdvancedAnalytics: false,
      featuredPlacement: false,
      whatsappLeads: true,
      features: JSON.stringify([
        "Up to 10 catalog products",
        "1 active promotional offer",
        "Direct WhatsApp & Phone customer inquiries",
        "Standard search placement",
      ]),
      isActive: true,
    },
    {
      id: "plan-pro",
      name: "PRO",
      nameUr: "پرو (کاروباری)",
      priceMonthly: 999,
      priceAnnual: 9990,
      productLimit: 50,
      offerLimit: 5,
      canUseAiCopilot: true,
      canUseAdvancedAnalytics: true,
      featuredPlacement: true,
      whatsappLeads: true,
      features: JSON.stringify([
        "Up to 50 catalog products",
        "5 active promotional offers",
        "Featured placement in category searches",
        "Detailed customer analytics & call tracking",
        "AI Merchant Copilot for social media posts",
        "Verified merchant badge priority",
      ]),
      isActive: true,
    },
    {
      id: "plan-premium",
      name: "PREMIUM",
      nameUr: "پریمیم (مکمل برانڈ)",
      priceMonthly: 2499,
      priceAnnual: 24990,
      productLimit: 500,
      offerLimit: 25,
      canUseAiCopilot: true,
      canUseAdvancedAnalytics: true,
      featuredPlacement: true,
      whatsappLeads: true,
      features: JSON.stringify([
        "Unlimited catalog products & inventory tracking",
        "Unlimited promotional discount campaigns",
        "Top homepage & search priority placement",
        "Advanced CRM & WhatsApp automated marketing",
        "Sponsored search ad credits included",
        "Dedicated city account manager support",
      ]),
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
  console.log("✅ Seeded 3 Subscription Plans (BASIC, PRO, PREMIUM).");

  // 2. Platform Settings
  await prisma.platformSetting.upsert({
    where: { id: "default" },
    update: {
      marketplaceCommissionPercent: 3.5,
      serviceLeadFeePKR: 50.0,
      featuredAdDailyRatePKR: 150.0,
    },
    create: {
      id: "default",
      marketplaceCommissionPercent: 3.5,
      serviceLeadFeePKR: 50.0,
      featuredAdDailyRatePKR: 150.0,
    },
  });
  console.log("✅ Seeded Platform Monetization Settings (3.5% Commission, 50 PKR Lead Fee).");

  // 3. Attach Pro Subscription & Ad Campaign to Al-Razi Pharmacy
  const alRazi = await prisma.business.findFirst({ where: { slug: "al-razi-pharmacy-jampur" } });
  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { name: "PRO" } });

  if (alRazi && proPlan) {
    await prisma.businessSubscription.deleteMany({ where: { businessId: alRazi.id } });
    await prisma.businessSubscription.create({
      data: {
        businessId: alRazi.id,
        planId: proPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        paymentMethod: "JAZZCASH",
        amountPaid: 999,
        paymentRef: "JC-998822",
      },
    });

    await prisma.adCampaign.deleteMany({ where: { businessId: alRazi.id } });
    await prisma.adCampaign.create({
      data: {
        businessId: alRazi.id,
        cityId: jampur.id,
        type: "FEATURED_LISTING",
        headline: "Al-Razi Pharmacy: 100% Genuine Medicines & 24/7 Home Delivery",
        headlineUr: "الرازی فارمیسی: سو فیصد اصل ادویات اور ہوم ڈلیوری",
        targetCategory: "pharmacy",
        dailyBudget: 150.0,
        impressionsCount: 340,
        clicksCount: 28,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    // Seed Sample Analytics Events
    await prisma.analyticsEvent.createMany({
      data: [
        { businessId: alRazi.id, cityId: jampur.id, type: "PROFILE_VIEW" },
        { businessId: alRazi.id, cityId: jampur.id, type: "SEARCH_APPEARANCE" },
        { businessId: alRazi.id, cityId: jampur.id, type: "WHATSAPP_CLICK" },
        { businessId: alRazi.id, cityId: jampur.id, type: "CALL_CLICK" },
      ],
    });
    console.log("✅ Seeded Pro Subscription & Ad Campaign for Al-Razi Pharmacy.");
  }

  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
