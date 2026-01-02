from fastapi import FastAPI
import numpy as np
from pydantic import BaseModel
from sklearn.linear_model import LinearRegression

# Create FastAPI app instance
app = FastAPI()

# A simple model for prediction
# In real use cases, you'd load a trained model here
# For demonstration, we'll train a simple model on some dummy data

class PredictionInput(BaseModel):
    feature1: float
    feature2: float

# Dummy data for training a simple linear regression model
X = np.array([[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]])
y = np.array([3, 5, 7, 9, 11])

# Train a simple Linear Regression model (just for illustration)
model = LinearRegression()
model.fit(X, y)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI/ML FastAPI project!"}

@app.post("/predict/")
async def predict(input_data: PredictionInput):
    features = np.array([[input_data.feature1, input_data.feature2]])
    prediction = model.predict(features)
    return {"prediction": prediction[0]}
