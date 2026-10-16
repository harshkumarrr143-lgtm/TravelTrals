// Comprehensive travel data catalogue: Agra, Mathura, and Vrindavan
export const travelData = {
  cities: [
    {
      id: 'agra',
      name: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India',
      badge: 'Heritage & Wonders',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      description: 'Home to the immortal Taj Mahal, grand Mughal architectural marvels, and rich cultural heritage along the Yamuna.',
      attractionsCount: 4,
      foodSpecialties: ['Agra Petha (Panchi Petha)', 'Bedai & Jalebi', 'Mughlai Biryani', 'Dalmoth']
    },
    {
      id: 'mathura',
      name: 'Mathura',
      state: 'Uttar Pradesh',
      country: 'India',
      badge: 'Sacred Birthplace',
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179833/traveltales_attractions/greva1i1tf8z7cmv1ukb.jpg',
      description: 'The revered birthplace of Lord Krishna, dotted with historic ghats, sacred aartis, and ancient spiritual energy.',
      attractionsCount: 3,
      foodSpecialties: ['Mathura ke Peda', 'Kachori with Dubki Wale Aloo', 'Makhan Mishri', 'Rabri Lassi']
    },
    {
      id: 'vrindavan',
      name: 'Vrindavan',
      state: 'Uttar Pradesh',
      country: 'India',
      badge: 'Bhakti & Temples',
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179831/traveltales_attractions/kpl4ojcxuc3itf8aaeld.jpg',
      description: 'The playful holy land of Radha Krishna with historic temples, divine chanting, and evening musical light fountains.',
      attractionsCount: 4,
      foodSpecialties: ['Pedas of Vrindavan', 'Khurchan', 'Samosa & Hing Kachori', 'Chhappan Bhog']
    }
  ],

  attractions: [
    // ══════════════════════════════════════════════════════════════════
    // AGRA ATTRACTIONS
    // ══════════════════════════════════════════════════════════════════
    {
      id: 'taj-mahal',
      cityId: 'agra',
      cityName: 'Agra',
      name: 'Taj Mahal',
      subtitle: 'The Monument of Eternal Love',
      rating: 4.9,
      reviewsCount: 14820,
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      openingHours: {
        regular: '30 Minutes before Sunrise to 30 Minutes before Sunset',
        closedOn: 'Fridays (Only open for prayer attendees)',
        nightView: 'Open on 5 nights per month around Full Moon (8:30 PM - 12:30 AM)'
      },
      prices: {
        basePrice: 50,
        currency: '₹',
        tiers: [
          { name: 'Indian Citizen', price: 50, desc: 'Entry to monument grounds' },
          { name: 'SAARC & BIMSTEC Citizen', price: 540, desc: 'Entry with SAARC concession' },
          { name: 'Foreign Tourist', price: 1100, desc: 'Includes shoe covers & water bottle' },
          { name: 'Skip-The-Line VIP Entry', price: 1650, desc: 'Direct priority gate entry + Main Mausoleum' }
        ],
        mainMausoleumAddon: 200
      },
      visitorRequirements: [
        'Mandatory valid government-issued Photo ID / Passport at entry',
        'Shoe covers must be worn before stepping onto the high marble terrace',
        'Strictly prohibited: Cigarettes, lighters, eatables, tripods, drones, large bags',
        'Photography allowed in outer gardens; strictly no photography inside the main burial chamber',
        'Dress code: Modest attire recommended; cover shoulders and knees'
      ],
      coordinates: { lat: 27.1751, lng: 78.0421 },
      googleMapsUrl: 'https://maps.google.com/?q=Taj+Mahal+Agra',
      badges: ['UNESCO World Heritage', 'Wonder of the World', 'Sunrise Recommended'],
      category: 'Heritage',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '2.5 - 3 hours',
      bestTime: 'Sunrise (6:00 AM) or Sunset (5:30 PM)'
    },
    {
      id: 'agra-fort',
      cityId: 'agra',
      cityName: 'Agra',
      name: 'Agra Fort',
      subtitle: 'The Walled Imperial Citadel of the Mughals',
      rating: 4.7,
      reviewsCount: 9230,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179836/traveltales_attractions/pieebzkkziyd5tz1fnse.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179836/traveltales_attractions/pieebzkkziyd5tz1fnse.jpg',
        'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      openingHours: {
        regular: 'Sunrise to Sunset (Daily)',
        closedOn: 'None (Open 7 days a week)',
        nightView: 'Sound and Light Show in evening (Hindi & English)'
      },
      prices: {
        basePrice: 50,
        currency: '₹',
        tiers: [
          { name: 'Indian Citizen', price: 50, desc: 'Full fort access' },
          { name: 'Foreign Tourist', price: 650, desc: 'Includes audio guide discount' },
          { name: 'Sound & Light Show Pass', price: 200, desc: 'Evening show at Diwan-i-Am' }
        ]
      },
      visitorRequirements: [
        'Wheelchair access available via Amar Singh Gate ramp',
        'Authorized ASI guides available at the ticketing counter',
        'Drones and large backpacks strictly prohibited',
        'Keep monument tickets handy—combination passes can be used across Agra'
      ],
      coordinates: { lat: 27.1795, lng: 78.0211 },
      googleMapsUrl: 'https://maps.google.com/?q=Agra+Fort',
      badges: ['UNESCO World Heritage', 'Red Sandstone', 'Yamuna View'],
      category: 'Heritage',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '2 hours',
      bestTime: 'Morning 9:00 AM – 11:30 AM'
    },
    {
      id: 'mehtab-bagh',
      cityId: 'agra',
      cityName: 'Agra',
      name: 'Mehtab Bagh',
      subtitle: 'Moonlight Garden with Iconic Taj Riverfront Views',
      rating: 4.6,
      reviewsCount: 4120,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179839/traveltales_attractions/xs8fwi8t7zbiuzqf5fuy.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179839/traveltales_attractions/xs8fwi8t7zbiuzqf5fuy.jpg',
        'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      openingHours: {
        regular: '6:00 AM – 7:00 PM (Sunrise to Sunset)',
        closedOn: 'None',
        nightView: 'Sunset silhouette view across Yamuna'
      },
      prices: {
        basePrice: 25,
        currency: '₹',
        tiers: [
          { name: 'Indian Visitor', price: 25, desc: 'Garden pass' },
          { name: 'Foreign Visitor', price: 300, desc: 'Full garden access' }
        ]
      },
      visitorRequirements: [
        'Great spot for sunset photography without the Taj crowd',
        'Peaceful manicured gardens, ideal for families and relaxing strolls',
        'No loud speakers or eatables inside the garden'
      ],
      coordinates: { lat: 27.1798, lng: 78.0422 },
      googleMapsUrl: 'https://maps.google.com/?q=Mehtab+Bagh+Agra',
      badges: ['Sunset Spot', 'Riverfront Garden', 'Quiet Reflection'],
      category: 'Nature',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '1.5 hours',
      bestTime: 'Sunset (5:00 PM - 6:30 PM)'
    },
    {
      id: 'fatehpur-sikri',
      cityId: 'agra',
      cityName: 'Agra',
      name: 'Fatehpur Sikri',
      subtitle: 'The Majestic Red Sandstone City of Victory',
      rating: 4.8,
      reviewsCount: 8900,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179837/traveltales_attractions/knybhiqtaqia9e6vckky.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179837/traveltales_attractions/knybhiqtaqia9e6vckky.jpg',
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      openingHours: {
        regular: 'Sunrise to Sunset (Daily)',
        closedOn: 'Fridays (Mosque only for prayers)',
        nightView: 'Buland Darwaza lit in soft amber lights'
      },
      prices: {
        basePrice: 50,
        currency: '₹',
        tiers: [
          { name: 'Indian Citizen', price: 50, desc: 'Full palace complex entry' },
          { name: 'Foreign Tourist', price: 610, desc: 'Includes ASI complex access' }
        ]
      },
      visitorRequirements: [
        'Buland Darwaza has steep steps; take the shuttle bus from parking lot',
        'Remove shoes before entering the Salim Chishti dargah',
        'Head coverings recommended at the sacred shrine'
      ],
      coordinates: { lat: 27.0945, lng: 77.6679 },
      googleMapsUrl: 'https://maps.google.com/?q=Fatehpur+Sikri',
      badges: ['UNESCO World Heritage', 'Buland Darwaza', 'Mughal Architecture'],
      category: 'Heritage',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '3 hours',
      bestTime: 'Morning 9:00 AM – 12:00 PM'
    },

    // ══════════════════════════════════════════════════════════════════
    // MATHURA ATTRACTIONS
    // ══════════════════════════════════════════════════════════════════
    {
      id: 'krishna-janmabhoomi',
      cityId: 'mathura',
      cityName: 'Mathura',
      name: 'Shri Krishna Janmabhoomi',
      subtitle: 'The Sacred Birthplace of Lord Krishna',
      rating: 4.8,
      reviewsCount: 16500,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179833/traveltales_attractions/greva1i1tf8z7cmv1ukb.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179833/traveltales_attractions/greva1i1tf8z7cmv1ukb.jpg',
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      openingHours: {
        regular: 'Summer: 5:00 AM – 12:00 PM & 4:00 PM – 9:30 PM | Winter: 5:30 AM – 12:00 PM & 3:00 PM – 8:30 PM',
        closedOn: 'None (Open every day)',
        nightView: 'Aarti at 8:00 PM'
      },
      prices: {
        basePrice: 0,
        currency: '₹',
        tiers: [
          { name: 'General Entry', price: 0, desc: 'Free standard darshan' },
          { name: 'Special Darshan Pass', price: 100, desc: 'Speedy queue for Garbha Griha' },
          { name: 'VIP Prasad Offering & Darshan', price: 250, desc: 'Special seva + box of authentic pedas' }
        ]
      },
      visitorRequirements: [
        'Strict high-level security: No mobile phones, electronic smartwatches, cameras, or leather bags allowed inside',
        'Free cloakroom lockers provided outside the temple premises',
        'Modest traditional dress code expected; shoes must be deposited at safe shoe counters',
        'Metal detector frisking for all visitors'
      ],
      coordinates: { lat: 27.5053, lng: 77.6698 },
      googleMapsUrl: 'https://maps.google.com/?q=Shri+Krishna+Janmasthan+Temple+Complex+Mathura',
      badges: ['Sacred Pilgrimage', 'Historic Prison Cell', 'Free Entry'],
      category: 'Spiritual',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '2 hours',
      bestTime: 'Morning 6:00 AM or Evening Aarti'
    },
    {
      id: 'dwarkadhish-mathura',
      cityId: 'mathura',
      cityName: 'Mathura',
      name: 'Dwarkadhish Temple',
      subtitle: 'Grand Rajasthani Temple on the Yamuna Banks',
      rating: 4.7,
      reviewsCount: 7800,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179835/traveltales_attractions/jk9fb20kqnef6zxvdiue.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179835/traveltales_attractions/jk9fb20kqnef6zxvdiue.jpg',
        'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      openingHours: {
        regular: '6:30 AM – 10:30 AM & 4:00 PM – 7:00 PM',
        closedOn: 'None',
        nightView: 'Yamuna evening lamps view'
      },
      prices: {
        basePrice: 0,
        currency: '₹',
        tiers: [
          { name: 'Free Darshan', price: 0, desc: 'Open darshan hall' },
          { name: 'Temple Trust Donation & Puja', price: 151, desc: 'Special Archana' }
        ]
      },
      visitorRequirements: [
        'Remove footwear before entry',
        'Photography prohibited in sanctum',
        'Short pleasant walk to Vishram Ghat nearby'
      ],
      coordinates: { lat: 27.5042, lng: 77.6844 },
      googleMapsUrl: 'https://maps.google.com/?q=Dwarkadhish+Temple+Mathura',
      badges: ['Yamuna Ghats', 'Rajasthani Architecture', 'Morning Aarti'],
      category: 'Spiritual',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '1 hour',
      bestTime: 'Early morning during Mangala Aarti'
    },
    {
      id: 'vishram-ghat',
      cityId: 'mathura',
      cityName: 'Mathura',
      name: 'Vishram Ghat & Yamuna Aarti',
      subtitle: 'The Sacred Ghat Where Lord Krishna Rested',
      rating: 4.8,
      reviewsCount: 9100,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179836/traveltales_attractions/jzdjlpiwtsx8jwlemxys.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179836/traveltales_attractions/jzdjlpiwtsx8jwlemxys.jpg',
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      openingHours: {
        regular: 'Open 24 hours (Daily)',
        closedOn: 'None',
        nightView: 'Grand Maha Aarti at 7:00 PM every evening with floating oil lamps'
      },
      prices: {
        basePrice: 0,
        currency: '₹',
        tiers: [
          { name: 'Ghat Visit & Aarti', price: 0, desc: 'Free attendance for all' },
          { name: 'Evening Yamuna Boat Ride', price: 150, desc: 'Private wooden boat ride to witness aarti from water' }
        ]
      },
      visitorRequirements: [
        'Take a boat ride during evening sunset for the best aarti view',
        'Be respectful around holy bathing areas',
        'Try local Mathura peda and hot kachori in the bazaar right outside'
      ],
      coordinates: { lat: 27.5028, lng: 77.6872 },
      googleMapsUrl: 'https://maps.google.com/?q=Vishram+Ghat+Mathura',
      badges: ['Maha Aarti', 'Sacred Riverboat', 'Holy Ghat'],
      category: 'Spiritual',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '1.5 hours',
      bestTime: 'Evening 6:30 PM for Yamuna Aarti'
    },

    // ══════════════════════════════════════════════════════════════════
    // VRINDAVAN ATTRACTIONS
    // ══════════════════════════════════════════════════════════════════
    {
      id: 'banke-bihari',
      cityId: 'vrindavan',
      cityName: 'Vrindavan',
      name: 'Banke Bihari Mandir',
      subtitle: 'The Heartbeat of Vrindavan Bhakti',
      rating: 4.9,
      reviewsCount: 22100,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179832/traveltales_attractions/w0ytbvesnkkzkzoyomre.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179832/traveltales_attractions/w0ytbvesnkkzkzoyomre.jpg',
        'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      openingHours: {
        regular: 'Summer: 7:45 AM – 12:00 PM & 5:30 PM – 9:30 PM | Winter: 8:45 AM – 1:00 PM & 4:30 PM – 8:30 PM',
        closedOn: 'None',
        nightView: 'Shayan Aarti (Curtains drawn rhythmically)'
      },
      prices: {
        basePrice: 0,
        currency: '₹',
        tiers: [
          { name: 'Devotee Darshan', price: 0, desc: 'Free universal entry' },
          { name: 'Special Darshan Assistance', price: 200, desc: 'Guided escort during crowded peak darshan hours' },
          { name: 'Chappan Bhog Offering', price: 501, desc: 'Traditional consecrated bhog parcel' }
        ]
      },
      visitorRequirements: [
        'Beware of playful monkeys: Do not wear spectacles, sunglasses, or carry loose bags/food in alleys',
        'Senior citizens are advised to visit during weekday mornings when crowds are lighter',
        'Shoes strictly deposited at designated shoe-stands',
        'No bells in the temple—deity is treated as a playful child with quiet joyous chanting'
      ],
      coordinates: { lat: 27.5815, lng: 77.7001 },
      googleMapsUrl: 'https://maps.google.com/?q=Banke+Bihari+Temple+Vrindavan',
      badges: ['Iconic Pilgrimage', 'Vibrant Energy', 'Holy Prasad'],
      category: 'Spiritual',
      familyFriendly: true,
      seniorFriendly: false,
      durationHours: '2 hours',
      bestTime: 'Weekdays 8:30 AM'
    },
    {
      id: 'prem-mandir',
      cityId: 'vrindavan',
      cityName: 'Vrindavan',
      name: 'Prem Mandir',
      subtitle: 'The Temple of Divine Love in White Italian Marble',
      rating: 4.8,
      reviewsCount: 19400,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179831/traveltales_attractions/kpl4ojcxuc3itf8aaeld.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179831/traveltales_attractions/kpl4ojcxuc3itf8aaeld.jpg',
        'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      openingHours: {
        regular: '5:30 AM – 12:00 PM & 4:30 PM – 8:30 PM',
        closedOn: 'None',
        nightView: 'Spectacular Color LED Illumination & Musical Fountain Show (7:30 PM – 8:00 PM)'
      },
      prices: {
        basePrice: 0,
        currency: '₹',
        tiers: [
          { name: 'General Entry', price: 0, desc: 'Free entry for all pilgrims' },
          { name: 'Fountain Show Reserved Seating', price: 150, desc: 'Front-row garden chair seats' }
        ]
      },
      visitorRequirements: [
        'Extensive landscaped gardens with wheelchair-accessible pathways for senior citizens',
        'Photography allowed in outer gardens; prohibited inside the central sanctum',
        'Ample clean restrooms and canteen serving sattvic pure vegetarian snacks',
        'Footwear deposit counters available at the grand entry gate'
      ],
      coordinates: { lat: 27.5721, lng: 77.6738 },
      googleMapsUrl: 'https://maps.google.com/?q=Prem+Mandir+Vrindavan',
      badges: ['Musical Fountain', 'Italian Carrara Marble', 'Family Favorite'],
      category: 'Spiritual',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '2.5 hours',
      bestTime: 'Evening 6:00 PM to watch magical lights'
    },
    {
      id: 'iskcon-vrindavan',
      cityId: 'vrindavan',
      cityName: 'Vrindavan',
      name: 'ISKCON Vrindavan (Sri Sri Krishna Balaram Mandir)',
      subtitle: 'World-Renowned Center of Hare Krishna Chanting & Global Devotion',
      rating: 4.9,
      reviewsCount: 15300,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179834/traveltales_attractions/ygbvzvssftcm2enp8ync.webp',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179834/traveltales_attractions/ygbvzvssftcm2enp8ync.webp',
        'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      openingHours: {
        regular: '4:30 AM – 1:00 PM & 4:30 PM – 8:30 PM',
        closedOn: 'None',
        nightView: 'Sandhya Aarti with ecstatic Kirtan at 7:00 PM'
      },
      prices: {
        basePrice: 0,
        currency: '₹',
        tiers: [
          { name: 'Universal Entry', price: 0, desc: 'Free entry and prasadam' },
          { name: 'Govinda Restaurant Meal Pass', price: 250, desc: 'Pure sattvic multi-course feast' }
        ]
      },
      visitorRequirements: [
        'Pure sattvic environment: Govinda restaurant and bakery on site',
        'Srila Prabhupada Samadhi Mandir inside the complex',
        'Footwear deposit counters provided near the entrance',
        'Join the continuous 24-hour Hari Naam Kirtan in the temple hall'
      ],
      coordinates: { lat: 27.5714, lng: 77.6798 },
      googleMapsUrl: 'https://maps.google.com/?q=ISKCON+Vrindavan',
      badges: ['24h Kirtan', 'Govinda Restaurant', 'Global Pilgrims'],
      category: 'Spiritual',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '2 hours',
      bestTime: 'Morning 4:30 AM Mangala Aarti or Evening 7:00 PM Aarti'
    },
    {
      id: 'nidhivan',
      cityId: 'vrindavan',
      cityName: 'Vrindavan',
      name: 'Nidhivan',
      subtitle: 'The Mystical Sacred Grove of Divine Raas Leela',
      rating: 4.7,
      reviewsCount: 10400,
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179835/traveltales_attractions/aqevwgbneujth9aguar5.jpg',
      gallery: [
        'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179835/traveltales_attractions/aqevwgbneujth9aguar5.jpg',
        'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      openingHours: {
        regular: 'Summer: 5:00 AM – 12:00 PM & 3:00 PM – 7:30 PM | Winter: 6:00 AM – 12:00 PM & 3:00 PM – 7:00 PM',
        closedOn: 'Strictly closed after evening aarti (nobody allowed overnight)',
        nightView: 'Gates locked firmly at dusk'
      },
      prices: {
        basePrice: 0,
        currency: '₹',
        tiers: [
          { name: 'General Pilgrimage Entry', price: 0, desc: 'Free entry' },
          { name: 'Seva Kunj Guided Walk', price: 100, desc: 'Local Brajwasi guide assistance' }
        ]
      },
      visitorRequirements: [
        'Entwined holy basil (Tulsi) trees throughout the forest',
        'All visitors and monkeys must leave before sunset as per tradition',
        'Do not pluck leaves or twigs from the sacred trees'
      ],
      coordinates: { lat: 27.5855, lng: 77.7011 },
      googleMapsUrl: 'https://maps.google.com/?q=Nidhivan+Vrindavan',
      badges: ['Sacred Grove', 'Raas Leela', 'Ancient Mystery'],
      category: 'Spiritual',
      familyFriendly: true,
      seniorFriendly: true,
      durationHours: '1.5 hours',
      bestTime: 'Afternoon 4:00 PM – 6:00 PM'
    }
  ],

  // Pre-configured Schedule trips exclusively for Agra, Mathura & Vrindavan
  scheduleTrips: [
    {
      id: 'sch-1',
      title: 'Taj Mahal & Agra Fort Sunrise Expedition',
      location: 'Agra, Uttar Pradesh',
      dateRange: '16 Oct - 18 Oct',
      startDate: '2024-10-16',
      endDate: '2024-10-18',
      status: 'Confirmed',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=300&q=80',
      attendees: 3,
      budgetTotal: 750,
      budgetPerPerson: 250,
      highlight: 'Sunrise entry at East Gate & Mughlai cuisine feast',
      conflictAlert: null
    },
    {
      id: 'sch-2',
      title: 'Vrindavan Divine Temples & Evening Aarti',
      location: 'Vrindavan, Uttar Pradesh',
      dateRange: '22 Oct - 25 Oct',
      startDate: '2024-10-22',
      endDate: '2024-10-25',
      status: 'Confirmed',
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179831/traveltales_attractions/kpl4ojcxuc3itf8aaeld.jpg',
      attendees: 4,
      budgetTotal: 600,
      budgetPerPerson: 150,
      highlight: 'Banke Bihari morning darshan & Prem Mandir light fountain show',
      conflictAlert: null
    },
    {
      id: 'sch-3',
      title: 'Mathura Janmabhoomi & Yamuna Aarti',
      location: 'Mathura, Uttar Pradesh',
      dateRange: '02 Nov - 04 Nov',
      startDate: '2024-11-02',
      endDate: '2024-11-04',
      status: 'Planning',
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179833/traveltales_attractions/greva1i1tf8z7cmv1ukb.jpg',
      attendees: 5,
      budgetTotal: 500,
      budgetPerPerson: 100,
      highlight: 'Holy Yamuna boat ride at Vishram Ghat & Dwarkadhish darshan',
      conflictAlert: null
    },
    {
      id: 'sch-4',
      title: 'Complete Braj Heritage & Culture Tour',
      location: 'Agra - Mathura - Vrindavan',
      dateRange: '15 Nov - 19 Nov',
      startDate: '2024-11-15',
      endDate: '2024-11-19',
      status: 'Confirmed',
      image: 'https://res.cloudinary.com/dtbgjhtm/image/upload/v1792179832/traveltales_attractions/w0ytbvesnkkzkzoyomre.jpg',
      attendees: 4,
      budgetTotal: 1200,
      budgetPerPerson: 300,
      highlight: 'All three holy destinations with private AC cab transfer & heritage stays',
      conflictAlert: null
    }
  ]
};
