import tensorflow as tf
import json
import numpy as np

# Load the training data
with open('trainingData.json', 'r') as f:
    training_data = json.load(f)

# Prepare the data for training
input_data = []
output_data = []

for item in training_data:
    # Calculate speed changes
    speed_changes = []
    for i in range(1, len(item['speed'])):
        speed_changes.append(item['speed'][i] - item['speed'][i - 1])  # Speed change between frames
    input_data.append(speed_changes)
    
    # Convert label to one-hot encoding
    if item['label'] == 'Smooth':
        output_data.append([1, 0, 0])
    elif item['label'] == 'Moderate':
        output_data.append([0, 1, 0])
    elif item['label'] == 'Aggressive':
        output_data.append([0, 0, 1])
    else:
        output_data.append([0, 0, 0])  # Default case

# Convert to numpy arrays
input_data = np.array(input_data)
output_data = np.array(output_data)

# Build the model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(input_data.shape[1],)),
    tf.keras.layers.Dense(3, activation='softmax')  # 3 output classes: Smooth, Moderate, Aggressive
])

# Compile the model
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(input_data, output_data, epochs=10, batch_size=4, validation_split=0.2, callbacks=[tf.keras.callbacks.EarlyStopping(monitor='loss', patience=2)])

# Save the trained model
model.save('drivingPatternModel-keras.keras')
print("Model training complete!")
