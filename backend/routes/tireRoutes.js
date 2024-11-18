const express = require("express");
const router = express.Router();
const { User } = require("../db/db"); 
const axios  = require("axios");

// Placeholder for global variables storing real-time driving data
let currentDrivingFeedback =  {
  drivingPattern:null,
  remainingLife1:null,
  remainingLife2:null,
  remainingLife3:null,
  remainingLife4:null,
} //Real-time feedback from AI/ML model
let tireConditionSummary = null;   // Summary of past drive data
let speedArray = []
let degradationGraph1  = [];
let degradationGraph2  = [];
let degradationGraph3  = [];
let degradationGraph4  = [];
let km1
let km2
let km3
let km4

let DrivingPatternArray  = [];


// 1. Route to handle raw data from sensors and process it through AI/ML engine
router.get('/loginUser', async (req, res) => {
  try {
    const { username, carNo } = req.body;
    console.log(req.body);
    console.log(username);

   
    if (!username || !carNo) {
      return res.status(400).send({ message: "Username and car number are required." });
    }

    
    let user = await User.findOne({ username, carNo });
    if (!user) {
      user = new User({
        username,
        carNo,
        averageDrivingPattern: "UNKNOWN", 
        recommendation: "UNKNOWN", 
        tireData: {
          tire1: {
            degradationPercentage: 0,
            remainingLife: 0,
            alreadyRuned: 0,
            degradationGraph: [0], 
          },
          tire2: {
            degradationPercentage: 0,
            remainingLife: 0,
            alreadyRuned: 0,
            degradationGraph: [0], 
          },
          tire3: {
            degradationPercentage: 0,
            remainingLife: 0,
            alreadyRuned: 0,
            degradationGraph: [0], 
          },
          tire4: {
            degradationPercentage: 0,
            remainingLife: 0,
            alreadyRuned: 0,
            degradationGraph: [0],
          },
        },
      });

      await user.save();
      return res.status(201).send({ message: "New user created successfully.", user });
    }

    // If user exists, return their data
    res.status(200).send({ message: "User already exists.", user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error logging in user.", error: error.message });
  }
});



router.put("/rawdata", async (req, res) => {
  try {
    const { username,carNo, tireData,speedData} = req.body; 
    console.log(username,carNo);
    // 1. Update the speedArray and degradation graphs for each tire
    speedArray.push(speedData); // Append speed data to the global array
    degradationGraph1.push(tireData.tire1.degradationPercentage);
    degradationGraph2.push(tireData.tire2.degradationPercentage);
    degradationGraph3.push(tireData.tire3.degradationPercentage);
    degradationGraph4.push(tireData.tire4.degradationPercentage);
    km1 = tireData.tire1.km;
    km2 = tireData.tire2.km;
    km3 = tireData.tire3.km;
    km4 = tireData.tire4.km;
    // console.log(speedArray);
    
   
    if (speedArray.length === 20) {
     
      const drivingPatternResponse = await axios.post("http://127.0.0.1:5000/api/classify", {
        speed_data: speedArray,
      });
      
      const drivingPattern = drivingPatternResponse.data.driving_pattern;
      console.log(drivingPattern);
      DrivingPatternArray.push(drivingPattern);
     
      if (DrivingPatternArray.length > 20) {
      
        DrivingPatternArray.shift();
      }

      currentDrivingFeedback = {
        drivingPattern,
        remainingLife1: null,
        remainingLife2: null,
        remainingLife3: null,
        remainingLife4: null,
      };

      // 4. Call the Tire Life API for each tire and update km1, km2, km3, km4


      const tireLifeResponses = await Promise.all([
        axios.post("http://127.0.0.1:5001/predictTireLife", {
          degradationInPercent: degradationGraph1[degradationGraph1.length - 1],
          NoOfKmalreadyRum: km1,
          drivingPattern: drivingPattern,
        }),
        axios.post("http://127.0.0.1:5001/predictTireLife", {
          degradationInPercent: degradationGraph2[degradationGraph2.length - 1],
          NoOfKmalreadyRum: km2,
          drivingPattern: drivingPattern,
        }),
        axios.post("http://127.0.0.1:5001/predictTireLife", {
          degradationInPercent: degradationGraph3[degradationGraph3.length - 1],
          NoOfKmalreadyRum: km3,
          drivingPattern: drivingPattern,
        }),
        axios.post("http://127.0.0.1:5001/predictTireLife", {
          degradationInPercent: degradationGraph4[degradationGraph4.length - 1],
          NoOfKmalreadyRum: km4,
          drivingPattern: drivingPattern,
        }),
      ]);

     
      currentDrivingFeedback.remainingLife1 = tireLifeResponses[0].data.remaining_km;
      currentDrivingFeedback.remainingLife2 = tireLifeResponses[1].data.remaining_km;
      currentDrivingFeedback.remainingLife3 = tireLifeResponses[2].data.remaining_km;
      currentDrivingFeedback.remainingLife4 = tireLifeResponses[3].data.remaining_km;

     console.log(currentDrivingFeedback);
      // 5 Update the database with the new degradation data and other info for each tire
      await User.updateOne(
        { username: username, carNo: carNo },
        {
          $set: {
            "tireData.tire1.alreadyRunedKM": km1,
            "tireData.tire2.alreadyRunedKM": km2,
            "tireData.tire3.alreadyRunedKM": km3,
            "tireData.tire4.alreadyRunedKM": km4,
      
            "tireData.tire1.remainingKM": tireLifeResponses[0].data.remaining_km,
            "tireData.tire2.remainingKM": tireLifeResponses[1].data.remaining_km,
            "tireData.tire3.remainingKM": tireLifeResponses[2].data.remaining_km,
            "tireData.tire4.remainingKM": tireLifeResponses[3].data.remaining_km,
      
            "tireData.tire1.currentDegradationPercentage": degradationGraph1[degradationGraph1.length - 1],
            "tireData.tire2.currentDegradationPercentage": degradationGraph2[degradationGraph2.length - 1],
            "tireData.tire3.currentDegradationPercentage": degradationGraph3[degradationGraph3.length - 1],
            "tireData.tire4.currentDegradationPercentage": degradationGraph4[degradationGraph4.length - 1],
      
           
            "tireData.tire1.degradationGraph": Array.from(degradationGraph1), 
            "tireData.tire2.degradationGraph": Array.from(degradationGraph2), 
            "tireData.tire3.degradationGraph": Array.from(degradationGraph3), 
            "tireData.tire4.degradationGraph": Array.from(degradationGraph4), 
          },
        }
      );

      // 6. Clear the speedArray and degradation graphs for the next set of data
      speedArray = [];
      degradationGraph1 = [];
      degradationGraph2 = [];
      degradationGraph3 = [];
      degradationGraph4 = [];

      res.status(200).send({ message: "Data processed successfully and saved to database.", currentDrivingFeedback });
    } else {
      res.status(200).send({ message: "Speed data received. Waiting for more data." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error processing raw data", error: error.message });
  }
});


// 2. Route to interact with frontend and provide current driving feedback from AI/ML model

function getDrivingRecommendation(drivingPattern) {
  if (drivingPattern === "Aggressive") {
      return "Please drive moderately and avoid overspeeding and harsh braking.";
  } else if (drivingPattern === "Moderate") {
      return "Good! Try to drive smoothly and avoid rough braking.";
  } else if (drivingPattern === "Smooth") {
      return "You're doing great! Keep up the smooth driving.";
  } else {
      return "No specific feedback available for the current driving pattern.";
  }
}

router.get("/currentFeedback", async (req, res) => {
  try {
   
    const drivingPattern = currentDrivingFeedback.drivingPattern || "No data available";
    
    
    const recommendation = getDrivingRecommendation(drivingPattern);

    const tireData = {
        tire1: {
            remainLife: currentDrivingFeedback.remainingLife1 || "Unknown",
            km: km1 || "Unknown"
        },
        tire2: {
            remainLife: currentDrivingFeedback.remainingLife2 || "Unknown",
            km: km2 || "Unknown"
        },
        tire3: {
            remainLife: currentDrivingFeedback.remainingLife3 || "Unknown",
            km: km3 || "Unknown"
        },
        tire4: {
            remainLife: currentDrivingFeedback.remainingLife4 || "Unknown",
            km: km4 || "Unknown"
        }
    };

    res.json({
        drivingPattern,
        recommendation,
        tireData
    });
} catch (error) {
   
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Internal Server Error" });
}
});


// 3. Route to fetch and send summary data to the frontend
function calculateAverageDrivingPattern(DrivingPatternArray) {
  
  const drivingPatternValues = DrivingPatternArray.map(pattern => {
      if (pattern === "smooth") return 1;
      if (pattern === "moderate") return 2;
      if (pattern === "aggressive") return 3;
      return 0; 
  });

 
  const totalDrivingPatterns = drivingPatternValues.reduce((sum, value) => sum + value, 0);

  const averageDrivingPatternValue = drivingPatternValues.length > 0 ? totalDrivingPatterns / drivingPatternValues.length : 0;

  if (averageDrivingPatternValue < 1.5) {
      return "smooth";
  } else if (averageDrivingPatternValue >= 1.5 && averageDrivingPatternValue < 2.5) {
      return "moderate";
  } else {
      return "aggressive";
  }
}





const updateUserDrivingData = async (username,carNoarNo, degradationGraph1, degradationGraph2, degradationGraph3, degradationGraph4, averageDrivingPattern, recommendation) => {
  const updateData = {
    averageDrivingPattern,
    recommendation,
    tireData: {
      tire1: { degradationGraph: degradationGraph1 },
      tire2: { degradationGraph: degradationGraph2 },
      tire3: { degradationGraph: degradationGraph3 },
      tire4: { degradationGraph: degradationGraph4 }
    }
  };

  try {
    const user = await User.findOne({ userName: username, carNo:carNo });
    if (!user) {
      return { error: "User not found" };
    }

    user.averageDrivingPattern = updateData.averageDrivingPattern;
    user.recommendation = updateData.recommendation;
    user.tireData.tire1.degradationGraph = updateData.tireData.tire1.degradationGraph;
    user.tireData.tire2.degradationGraph = updateData.tireData.tire2.degradationGraph;
    user.tireData.tire3.degradationGraph = updateData.tireData.tire3.degradationGraph;
    user.tireData.tire4.degradationGraph = updateData.tireData.tire4.degradationGraph;

    await user.save();

    return { success: "User driving data updated successfully" };
  } catch (error) {
    console.error("Error updating user data:", error);
    return { error: "Error updating user data" };
  }
};







router.get("/drivingSummary", async (req, res) => {
  try {
     
   
      const averageDrivingPattern = calculateAverageDrivingPattern(DrivingPatternArray);
      let recommendation  = getDrivingRecommendation(averageDrivingPattern);

      updateUserDrivingData("priyam","UP93H0005",degradationGraph1,degradationGraph2,degradationGraph3,degradationGraph4,averageDrivingPattern,recommendation);

      const degradationGraph1 = degradationGraph1;
      const degradationGraph2 = degradationGraph2; 
      const degradationGraph3 = degradationGraph3;
      const degradationGraph4 = degradationGraph4; 
      const responseBody = {
          averageDrivingPattern: averageDrivingPattern,
          degradationGraph1: degradationGraph1,
          degradationGraph2: degradationGraph2,
          degradationGraph3: degradationGraph3,
          degradationGraph4: degradationGraph4
      };


      res.json(responseBody);
  } catch (error) {
      console.error("Error fetching driving summary:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;


