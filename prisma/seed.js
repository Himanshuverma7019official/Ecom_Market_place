const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const products = [
    {
      title: 'Electric Scooter X1',
      description: 'Fast and lightweight for city commuting.',
      price: 349.99,
      sku: 'SCOOTER-001',
      image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80',
      category: 'Mobility',
      inventory: 35,
    },
    {
      title: 'Portable Power Bank',
      description: 'High-capacity USB-C power bank for travel.',
      price: 49.99,
      sku: 'CHARGER-001',
      image: 'https://images.unsplash.com/photo-1580894908361-1b3d37f84d53?auto=format&fit=crop&w=800&q=80',
      category: 'Power',
      inventory: 80,
    },
    {
      title: 'Noise-Canceling Headphones',
      description: 'Premium sound with long battery life.',
      price: 129.99,
      sku: 'HEADPHONE-001',
      image: 'https://images.unsplash.com/photo-1518449460371-1d33bf46b84f?auto=format&fit=crop&w=800&q=80',
      category: 'Audio',
      inventory: 50,
    },
    {
      title: 'Smart Home Hub',
      description: 'Smart control for lighting and security.',
      price: 179.99,
      sku: 'HUB-001',
      image: 'https://images.unsplash.com/photo-1580894908361-1b3d37f84d53?auto=format&fit=crop&w=800&q=80',
      category: 'Smart Home',
      inventory: 28,
    },
    {
      title: 'Wireless Charging Pad',
      description: 'Fast Qi-certified charger for phones and earbuds.',
      price: 29.99,
      sku: 'CHARGER-002',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      category: 'Power',
      inventory: 120,
    },
    {
      title: 'Smart Fitness Tracker',
      description: 'Track workouts, heart rate, and sleep health.',
      price: 59.99,
      sku: 'FITNESS-001',
      image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80',
      category: 'Wearables',
      inventory: 65,
    },
    {
      title: 'Solar Lantern Pro',
      description: 'Portable solar lantern with adjustable brightness.',
      price: 39.99,
      sku: 'SOLAR-001',
      image: 'https://images.unsplash.com/photo-1523709651819-0fb0b1d19c78?auto=format&fit=crop&w=800&q=80',
      category: 'Outdoors',
      inventory: 45,
    },
    {
      title: 'Home Security Camera',
      description: '1080p wireless camera with night vision.',
      price: 89.99,
      sku: 'CAMERA-001',
      image: 'https://images.unsplash.com/photo-1514626585111-1cdf8fa2f0f4?auto=format&fit=crop&w=800&q=80',
      category: 'Security',
      inventory: 40,
    },
    {
      title: 'Electric Toothbrush X2',
      description: 'Rechargeable toothbrush with multiple cleaning modes.',
      price: 59.99,
      sku: 'TOOTHBRUSH-001',
      image: 'https://images.unsplash.com/photo-1582719478250-100145976837?auto=format&fit=crop&w=800&q=80',
      category: 'Health',
      inventory: 70,
    },
    {
      title: 'Smart LED Light Strip',
      description: 'Color-changing strip for ambiance and smart control.',
      price: 34.99,
      sku: 'LIGHT-001',
      image: 'https://images.unsplash.com/photo-1530639831964-211a62d2f9dd?auto=format&fit=crop&w=800&q=80',
      category: 'Lighting',
      inventory: 90,
    },
    {
      title: 'Wireless Gaming Mouse',
      description: 'Ergonomic RGB mouse with fast response.',
      price: 49.99,
      sku: 'MOUSE-001',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8f?auto=format&fit=crop&w=800&q=80',
      category: 'Gaming',
      inventory: 65,
    },
    {
      title: 'Portable Bluetooth Keyboard',
      description: 'Lightweight keyboard with rechargeable battery.',
      price: 39.99,
      sku: 'KEYBOARD-001',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      category: 'Accessories',
      inventory: 80,
    },
    {
      title: 'Noise-Canceling Earbuds',
      description: 'True wireless earbuds with active noise cancellation.',
      price: 59.99,
      sku: 'EARBUDS-001',
      image: 'https://images.unsplash.com/photo-1562599938-6a0b1d6ec3f8?auto=format&fit=crop&w=800&q=80',
      category: 'Audio',
      inventory: 120,
    },
    {
      title: 'Smart Thermostat',
      description: 'Energy-saving thermostat with remote control.',
      price: 129.99,
      sku: 'THERMO-001',
      image: 'https://images.unsplash.com/photo-1543128639-4cb7e5d91620?auto=format&fit=crop&w=800&q=80',
      category: 'Smart Home',
      inventory: 54,
    },
    {
      title: 'Mini Projector',
      description: 'Portable projector for movies and presentations.',
      price: 159.99,
      sku: 'PROJECTOR-001',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      category: 'Home Entertainment',
      inventory: 30,
    },
    {
      title: 'Electric Kettle',
      description: 'Quick boil kettle with auto shutoff.',
      price: 29.99,
      sku: 'KETTLE-001',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      category: 'Kitchen',
      inventory: 75,
    },
    {
      title: 'Smart Doorbell',
      description: 'Video doorbell with motion alerts.',
      price: 99.99,
      sku: 'DOORBELL-001',
      image: 'https://images.unsplash.com/photo-1525183848246-6d31f0e5da5a?auto=format&fit=crop&w=800&q=80',
      category: 'Security',
      inventory: 48,
    },
    {
      title: 'Wireless Charging Stand',
      description: 'Vertical charger for phones and earbuds.',
      price: 24.99,
      sku: 'CHARGER-003',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8f?auto=format&fit=crop&w=800&q=80',
      category: 'Power',
      inventory: 110,
    },
    {
      title: 'Digital Photo Frame',
      description: 'Display your favorite memories in HD.',
      price: 69.99,
      sku: 'FRAME-001',
      image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
      category: 'Home',
      inventory: 38,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }

  const adminEmail = 'admin@estock.com'
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      passwordHash: 'demo-admin-hash',
    },
  })

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
