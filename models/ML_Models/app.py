import joblib
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the trained model
model = joblib.load('tire_life_predictor_model.pkl')

# Custom mapping for driving patterns
DRIVING_PATTERN_MAPPING = {
    'Smooth': 0,
    'Moderate': 1,
    'Aggressive': 2
}

@app.route('/predictTireLife', methods=['POST'])
def predict_tire_life():
    try:
        # Get data from the request
        data = request.get_json()

        # Extract input data
        tire_degradation = data['degradationInPercent']
        km_run = data['NoOfKmalreadyRum']
        driving_pattern = data['drivingPattern']

        # Validate input data
        if tire_degradation < 0 or tire_degradation > 100:
            return jsonify({'error': 'Invalid tire degradation percentage. Must be between 0 and 100.'}), 400
        if km_run < 0:
            return jsonify({'error': 'Invalid kilometers already run. Must be a positive value.'}), 400
        if driving_pattern not in DRIVING_PATTERN_MAPPING:
            return jsonify({'error': 'Invalid driving pattern. Choose from "smooth", "moderate", or "aggressive".'}), 400

        # Map driving pattern to encoded value
        driving_pattern_encoded = DRIVING_PATTERN_MAPPING[driving_pattern]

        # Prepare input data for the model
        input_data = np.array([[tire_degradation, km_run, driving_pattern_encoded]])

        # Predict remaining kilometers
        remaining_km = model.predict(input_data)[0]

        # Return the prediction
        return jsonify({'remaining_km': remaining_km})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True,port=5001)
