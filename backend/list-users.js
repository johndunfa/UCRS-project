// list-users.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({}).select('name email role isActive');
    
    console.log('\n📋 All users in database:');
    console.log('========================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log('------------------------');
    });
    
    console.log(`\nTotal users: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

listUsers();