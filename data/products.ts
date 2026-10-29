export type Product = {
  id: string
  title: string
  category: string
  tagline: string
  price: number
  image: string
  rating: number
  reviews: number
}

export const demoProducts: Product[] = [
  {
    id: '1',
    title: 'Electric Scooter X1',
    category: 'Mobility',
    tagline: 'City-ready performance with long range.',
    price: 349.99,
    image:
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 214,
  },
  {
    id: '2',
    title: 'Portable Power Bank',
    category: 'Power',
    tagline: 'Fast charging for your devices on the go.',
    price: 49.99,
    image:
      'https://images.unsplash.com/photo-1580894908361-1b3d37f84d53?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviews: 89,
  },
  {
    id: '3',
    title: 'Noise-Canceling Headphones',
    category: 'Audio',
    tagline: 'Premium sound and comfort for every journey.',
    price: 129.99,
    image:
      'https://images.unsplash.com/photo-1518449460371-1d33bf46b84f?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviews: 152,
  },
  {
    id: '4',
    title: 'Smart Home Hub',
    category: 'Smart Home',
    tagline: 'Control lighting, security, and comfort with one device.',
    price: 179.99,
    image:
      'https://images.unsplash.com/photo-1580894908361-1b3d37f84d53?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    reviews: 63,
  },
]
