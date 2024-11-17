# import tensorflow as tf
# from flask import Flask, request, jsonify
# import numpy as np

# # Load the pre-trained model (make sure the path is correct)
# model = tf.keras.models.load_model('drivingPatternModel-keras.keras')

# # Flask app
# app = Flask(__name__)

# # Function to classify driving pattern
# def classify_driving_pattern(speed_data):
#     if len(speed_data) != 20:
#         raise ValueError("Input data should contain exactly 20 speed values.")
# # print(speed_data.batch_size)
#     # Calculate speed changes (differences between consecutive speeds)
#     speed_changes = np.diff(speed_data)

#     # Normalize speed changes (optional)
#     max_change = np.max(speed_changes)
#     normalized_speed_changes = speed_changes / max_change if max_change != 0 else speed_changes

#     # Prepare the input tensor (reshape for TensorFlow model)
#     input_tensor = np.array([normalized_speed_changes]).reshape(1, 20)

#     # Predict the driving pattern
#     prediction = model.predict(input_tensor)

#     # Get the index of the highest probability
#     class_index = np.argmax(prediction, axis=1)[0]

#     # Return the corresponding pattern
#     patterns = ['Smooth', 'Moderate', 'Aggressive']
#     return patterns[class_index]

# # Route for classification
# @app.route('/api/classify', methods=['POST'])
# def classify():
#     try:
#         # Get the input JSON data (speed array)
#         data = request.get_json()
#         speed_data = data.get('speed_data', [])

#         # Classify the driving pattern
#         pattern = classify_driving_pattern(speed_data)

#         # Return the result as a JSON response
#         return jsonify({"driving_pattern": pattern})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

# # Run the Flask app
# if __name__ == '__main__':
#     app.run(debug=True)




import tensorflow as tf
from flask import Flask, request, jsonify
import numpy as np

# Load the pre-trained model (make sure the path is correct)
model = tf.keras.models.load_model('drivingPatternModel-keras.keras')

# Flask app
app = Flask(__name__)

# Function to classify driving pattern
def classify_driving_pattern(speed_data):
    if len(speed_data) != 20:
        raise ValueError("Input data should contain exactly 20 speed values.")
    
    # Calculate speed changes (differences between consecutive speeds)
    speed_changes = np.diff(speed_data)

    # Ensure that the speed_changes array has 20 values by padding if necessary
    if len(speed_changes) != 19:
        raise ValueError("Speed changes calculation resulted in incorrect number of elements.")

    # Normalize speed changes (optional)
    max_change = np.max(speed_changes)
    normalized_speed_changes = speed_changes / max_change if max_change != 0 else speed_changes

    # Prepare the input tensor (reshape for TensorFlow model)
    input_tensor = np.array([normalized_speed_changes]).reshape(1, 19)  # Keep 19 elements after diff()

    # Predict the driving pattern
    prediction = model.predict(input_tensor)

    # Get the index of the highest probability
    class_index = np.argmax(prediction, axis=1)[0]

    # Return the corresponding pattern
    patterns = ['Smooth', 'Moderate', 'Aggressive']
    return patterns[class_index]

# Route for classification
@app.route('/api/classify', methods=['POST'])
def classify():
    try:
        # Get the input JSON data (speed array)
        data = request.get_json()
        speed_data = data.get('speed_data', [])

        # Classify the driving pattern
        pattern = classify_driving_pattern(speed_data)

        # Return the result as a JSON response
        return jsonify({"driving_pattern": pattern})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True,port=5000)
