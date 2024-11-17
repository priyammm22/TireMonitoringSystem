import json
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

# Load the historical training data from a JSON file
with open('trainData.json', 'r') as f:
    data = json.load(f)

# Convert the data into a pandas DataFrame for easier processing
import pandas as pd
data_df = pd.DataFrame(data)

# Encode the 'drivingPattern' column
encoder = LabelEncoder()
data_df['drivingPatternEncoded'] = encoder.fit_transform(data_df['drivingPattern'])

# Prepare the features (X) and the target variable (y)
X = data_df[['degradationInPercent', 'NoOfKmalreadyRun', 'drivingPatternEncoded']]
y = data_df['remainingKm']  # This is the target variable: remaining tire life in kilometers

# Split the data into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the model (RandomForestRegressor in this case)
model = RandomForestRegressor(n_estimators=100, random_state=42)

# Train the model
model.fit(X_train, y_train)

# Predict on the test set
y_pred = model.predict(X_test)

# Evaluate the model's performance (Mean Absolute Error)
mae = mean_absolute_error(y_test, y_pred)
print(f'Mean Absolute Error (MAE): {mae}')

# Save the trained model
joblib.dump(model, 'tire_life_predictor_model.pkl')  # Save the model

print("Model training complete. Model saved.")
