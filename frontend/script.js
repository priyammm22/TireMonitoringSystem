
async function fetchAndUpdateData() {
    try {
    
        const response = await fetch("http://localhost:3000/tire/currentFeedback");
        const data = await response.json();
        console.log(data);
       
        document.getElementById("pattern-status").textContent = data.drivingPattern;
        document.getElementById("recommendation-text").textContent = data.recommendation;

        // Update tire information
        Object.keys(data.tireData).forEach(tireId => {
            const tireInfo = data.tireData[tireId];
            document.getElementById(`life-${tireId}`).textContent = `${tireInfo.remainLife.toFixed(2)}`;
            document.getElementById(`km-run-${tireId}`).textContent = `${tireInfo.km}`;
        });

        
        const body = document.body;
        body.classList.remove("aggressive", "smooth", "moderate"); /

        if (data.drivingPattern === "Aggressive") {
            body.classList.add("aggressive");
        } else if (data.drivingPattern === "Smooth") {
            body.classList.add("smooth");
        } else if (data.drivingPattern === "Moderate") {
            body.classList.add("moderate");
        }
    } catch (error) {
        console.error("Error fetching data from API:", error);
    }
}


setInterval(fetchAndUpdateData, 10000);


fetchAndUpdateData();
