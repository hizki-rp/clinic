export interface PlaceholderImage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
}

export const PlaceHolderImages: PlaceholderImage[] = [
  {
    id: 'onboarding-img',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    description: 'Modern medical facility with healthcare professionals',
    imageHint: 'A modern, clean medical facility showing healthcare professionals in a welcoming environment'
  },
  {
    id: 'dr-alcantara',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    description: 'Dr. John Alcantara - Senior Physician',
    imageHint: 'Professional headshot of a male doctor in medical attire'
  },
  {
    id: 'dr-lee',
    imageUrl: 'https://images.unsplash.com/photo-1594824475317-8b7b0c8b8b8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    description: 'Dr. Sarah Lee - Specialist',
    imageHint: 'Professional headshot of a female doctor in medical attire'
  },
  {
    id: 'dr-williams',
    imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    description: 'Dr. David Williams - General Practitioner',
    imageHint: 'Professional headshot of a male doctor in medical attire'
  }
];