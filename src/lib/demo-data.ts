import type {
  PuppyImage,
  PuppyStatus,
  PuppyWithImages,
  SiteSettings,
  Testimonial,
} from "@/types/database";

/**
 * Fallback content shown ONLY when Supabase is not configured (or a request fails for site settings).
 * It mirrors the seed data in supabase/migrations so local development looks like production.
 */

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const dateAgo = (days: number) => daysAgo(days).slice(0, 10);
const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

type Seed = {
  slug: string;
  name: string;
  breed: string;
  gender: "Female" | "Male";
  ageDays: number;
  color: string;
  weight: string;
  location: string;
  description: string;
  temperament: string;
  health: string;
  vaccination: string;
  fee: number;
  status: PuppyStatus;
  adoptedDaysAgo?: number;
  photos: string[];
};

const seeds: Seed[] = [
  {
    slug: "bella-golden-retriever",
    name: "Bella",
    breed: "Golden Retriever",
    gender: "Female",
    ageDays: 75,
    color: "Golden Cream",
    weight: "6.2 kg",
    location: "Lekki, Lagos",
    description:
      "Bella is a gentle, sunny-hearted Golden Retriever who adores children and long afternoon naps in the garden. She is crate-trained and already responds to her name.",
    temperament: "Gentle, affectionate, eager to please",
    health: "Vet checked, dewormed, no known conditions",
    vaccination: "Fully vaccinated (first two rounds)",
    fee: 450000,
    status: "AVAILABLE",
    photos: ["1552053831-71594a27632d", "1583512603805-3cc6b41f3edb"],
  },
  {
    slug: "milo-german-shepherd",
    name: "Milo",
    breed: "German Shepherd",
    gender: "Male",
    ageDays: 90,
    color: "Black & Tan",
    weight: "8.4 kg",
    location: "Ikeja, Lagos",
    description:
      "Milo is confident and highly intelligent, with the makings of a wonderful family guardian. He learns new commands within minutes and loves structured play.",
    temperament: "Loyal, alert, intelligent",
    health: "Vet checked, hips clear, dewormed",
    vaccination: "Fully vaccinated",
    fee: 600000,
    status: "AVAILABLE",
    photos: ["1568572933382-74d440642117", "1589941013453-ec89f33b5e95"],
  },
  {
    slug: "luna-siberian-husky",
    name: "Luna",
    breed: "Siberian Husky",
    gender: "Female",
    ageDays: 60,
    color: "Grey & White",
    weight: "5.8 kg",
    location: "Lekki, Lagos",
    description:
      "Luna is a spirited little explorer with striking blue eyes. She thrives with active families who enjoy morning walks and plenty of enrichment.",
    temperament: "Playful, curious, vocal",
    health: "Vet checked, dewormed",
    vaccination: "First round complete",
    fee: 700000,
    status: "AVAILABLE",
    photos: ["1605568427561-40dd23c2acea", "1591160690555-5debfba289f0"],
  },
  {
    slug: "coco-french-bulldog",
    name: "Coco",
    breed: "French Bulldog",
    gender: "Female",
    ageDays: 45,
    color: "Fawn",
    weight: "3.9 kg",
    location: "Victoria Island, Lagos",
    description:
      "Coco is a pocket-sized charmer who is perfectly happy in apartments. She greets everyone like an old friend and snores adorably.",
    temperament: "Sociable, calm, comic",
    health: "Vet checked, airway clear",
    vaccination: "Fully vaccinated",
    fee: 850000,
    status: "AVAILABLE",
    photos: ["1583337130417-3346a1be7dee", "1517423440428-a5a00ad493e8"],
  },
  {
    slug: "simba-labrador-retriever",
    name: "Simba",
    breed: "Labrador Retriever",
    gender: "Male",
    ageDays: 70,
    color: "Yellow",
    weight: "7.1 kg",
    location: "Ikoyi, Lagos",
    description:
      "Simba is a joyful, water-loving Labrador who has already met his future family for a home visit. Reserved pending final paperwork.",
    temperament: "Friendly, energetic, food-motivated",
    health: "Vet checked, dewormed",
    vaccination: "Fully vaccinated",
    fee: 480000,
    status: "RESERVED",
    photos: ["1591160690555-5debfba289f0"],
  },
  {
    slug: "zeus-doberman",
    name: "Zeus",
    breed: "Doberman Pinscher",
    gender: "Male",
    ageDays: 320,
    color: "Black & Rust",
    weight: "11.5 kg",
    location: "Ikeja, Lagos",
    description:
      "Zeus found his forever home with a wonderful family in Abuja who send us weekly photos of his adventures.",
    temperament: "Devoted, athletic, watchful",
    health: "Vet checked, dewormed",
    vaccination: "Fully vaccinated",
    fee: 650000,
    status: "ADOPTED",
    adoptedDaysAgo: 190,
    photos: ["1558788353-f76d92427f16"],
  },
  {
    slug: "poppy-beagle",
    name: "Poppy",
    breed: "Beagle",
    gender: "Female",
    ageDays: 290,
    color: "Tricolour",
    weight: "6.0 kg",
    location: "Lekki, Lagos",
    description:
      "Poppy now shares a home with two young children and a very patient cat. A perfect happy ending.",
    temperament: "Curious, cheerful, scent-driven",
    health: "Vet checked, dewormed",
    vaccination: "Fully vaccinated",
    fee: 380000,
    status: "ADOPTED",
    adoptedDaysAgo: 150,
    photos: ["1505628346881-b72b27e84530"],
  },
  {
    slug: "ruby-cocker-spaniel",
    name: "Ruby",
    breed: "Cocker Spaniel",
    gender: "Female",
    ageDays: 270,
    color: "Golden",
    weight: "5.5 kg",
    location: "Ikoyi, Lagos",
    description:
      "Ruby was adopted by a retired couple who take her on daily beach walks. She still visits us for grooming.",
    temperament: "Sweet, gentle, sociable",
    health: "Vet checked, ears clear",
    vaccination: "Fully vaccinated",
    fee: 430000,
    status: "ADOPTED",
    adoptedDaysAgo: 120,
    photos: ["1518717758536-85ae29035b6d"],
  },
];

export const demoPuppies: PuppyWithImages[] = seeds.map((seed, index) => {
  const id = `demo-puppy-${index + 1}`;
  const images: PuppyImage[] = seed.photos.map((photoId, order) => ({
    id: `${id}-img-${order}`,
    puppy_id: id,
    image_url: photo(photoId),
    cloudinary_public_id: null,
    storage_path: null,
    is_primary: order === 0,
    sort_order: order,
    created_at: daysAgo(seed.ageDays),
  }));
  return {
    id,
    name: seed.name,
    slug: seed.slug,
    breed: seed.breed,
    gender: seed.gender,
    date_of_birth: dateAgo(seed.ageDays),
    color: seed.color,
    weight: seed.weight,
    location: seed.location,
    description: seed.description,
    temperament: seed.temperament,
    health_information: seed.health,
    vaccination_status: seed.vaccination,
    adoption_fee: seed.fee,
    status: seed.status,
    adoption_date: seed.adoptedDaysAgo === undefined ? null : dateAgo(seed.adoptedDaysAgo),
    created_at: daysAgo(seed.ageDays - 5),
    updated_at: daysAgo(1),
    puppy_images: images,
  };
});

const avatar = (id: string) => photo(id, 300);

export const demoTestimonials: Testimonial[] = [
  {
    id: "demo-t-1",
    customer_name: "Amaka Obi",
    customer_image: avatar("1494790108377-be9c29b29330"),
    puppy_name: "Zeus",
    rating: 5,
    approved: true,
    created_at: daysAgo(160),
    updated_at: daysAgo(160),
    testimonial:
      "From the first visit we could tell these puppies are raised with real love. Zeus settled into our home within two days and the aftercare advice has been invaluable.",
  },
  {
    id: "demo-t-2",
    customer_name: "Tunde Adeyemi",
    customer_image: avatar("1500648767791-00dcc994a43e"),
    puppy_name: "Poppy",
    rating: 5,
    approved: true,
    created_at: daysAgo(140),
    updated_at: daysAgo(140),
    testimonial:
      "Honest, transparent and genuinely caring. All health records were handed over on the day and Poppy has been perfectly healthy since.",
  },
  {
    id: "demo-t-3",
    customer_name: "Chidinma Eze",
    customer_image: avatar("1438761681033-6461ffad8d80"),
    puppy_name: "Ruby",
    rating: 5,
    approved: true,
    created_at: daysAgo(100),
    updated_at: daysAgo(100),
    testimonial:
      "Ruby is the calmest, sweetest companion for my parents. The team even followed up a month later to check on her.",
  },
  {
    id: "demo-t-4",
    customer_name: "Femi Balogun",
    customer_image: avatar("1507003211169-0a1dd7228f2d"),
    puppy_name: "Bruno",
    rating: 5,
    approved: true,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
    testimonial:
      "Bruno arrived confident and well socialised. You can tell the difference between a real adoption home and a reseller.",
  },
];

export const fallbackSettings: SiteSettings = {
  id: "demo-settings",
  site_name: "Golden Paws Adoption Home",
  logo_url: null,
  hero_title: "Find Your Perfect Companion",
  hero_subtitle: "Discover healthy, loving puppies looking for caring forever homes.",
  hero_image: photo("1583511655857-d19b40a7a54e", 1600),
  about_text:
    "We are a family-run adoption home dedicated to raising healthy, well-socialised puppies and matching them with caring families. Every puppy is vet-checked, vaccinated and raised underfoot in our home before joining yours.",
  phone: "+234 801 234 5678",
  whatsapp: "2348012345678",
  email: "hello@goldenpaws.example",
  location: "Lekki, Lagos, Nigeria",
  contact_hours: "Mon - Sat, 9:00am - 6:00pm",
  instagram: null,
  facebook: null,
  tiktok: null,
  youtube: null,
  cloudinary_cloud_name: null,
  cloudinary_upload_preset: null,
  updated_at: daysAgo(1),
};
