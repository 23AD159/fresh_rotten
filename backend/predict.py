import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

# Load the model once when this script is imported
model = load_model("model/fresh_vs_rotten_model.h5")

# Make sure these match the labels from your training dataset
class_labels = sorted(os.listdir(
    r"C:\Users\Yamuna Shri.T\Downloads\fresh-rotten-classifier\fresh-rotten-classifier\backend\dataset\train"))

def predict(img_path):
    img = image.load_img(img_path, target_size=(128, 128))
    img_tensor = image.img_to_array(img) / 255.0
    img_tensor = np.expand_dims(img_tensor, axis=0)

    prediction = model.predict(img_tensor)
    class_index = np.argmax(prediction[0])
    confidence = float(np.max(prediction[0]))

    return class_labels[class_index], confidence
