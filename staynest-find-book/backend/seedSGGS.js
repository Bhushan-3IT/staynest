const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Property = require('./models/Property');
const sampleProperties = require('./sampleData/sggsProperties.json');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const seedSGGS = async () => {
  try {
    // First, check if landlord exists
    let landlord = await User.findOne({ email: 'landlord@sggs.in' });
    
    if (!landlord) {
      // Create a default landlord for SGGS
      landlord = await User.create({
        name: 'SGGS Verified Landlord',
        email: 'landlord@sggs.in',
        password: 'Landlord@123',
        phone: '9876543210',
        role: 'landlord',
        isVerified: true,
        collegeName: 'SGGS Nanded',
        totalProperties: 0,
        rating: 4.5,
      });
      console.log('✅ Created SGGS Landlord');
    }

    // Add properties
    let addedCount = 0;
    for (const property of sampleProperties) {
      const existing = await Property.findOne({ 
        name: property.name,
        address: property.address 
      });
      
      if (!existing) {
        await Property.create({
          ...property,
          landlordId: landlord._id,
        });
        addedCount++;
      }
    }
    
    console.log(`✅ Added ${addedCount} SGGS properties`);
    console.log('✅ SGGS Nanded data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedSGGS();