const mongoose = require("mongoose");
// const { number } = require("zod");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("CONNECTION URL/");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};




const tireSchema = new mongoose.Schema({
  degradationPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  remainingLife: {
    type: Number, // Remaining life in kilometers
    required: true,
  },
  alreadyRuned: {
    type: Number, // Kilometers already run
    required: true,
    min: 0,
  },
  degradationGraph: {
    type: [Number], // Array of numbers
    validate: {
      validator: function (v) {
        return v.length <= 20; // Max size of 20
      },
      message: 'Degradation graph can have a maximum of 20 entries.',
    },
    default: [],
  },
});

const userSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  CarNo:{
    type:String,
    required:true
  },
  averageDrivingPattern: {
    type: String, 
    required: true,
   
  },
  recommendation: {
    type: String, // Recommendation text
    required: true,
  },
  tireData: {
    tire1: {
      type: tireSchema,
      required: true,
    },
    tire2: {
      type: tireSchema,
      required: true,
    },
    tire3:{
      type: tireSchema,
      required: true,
    },
    tire4:{
      type: tireSchema,
      required: true,
    }
  },
});

// Define a single-user tire data model
const User = mongoose.model("User", userSchema);

module.exports = { connectDB, User };

