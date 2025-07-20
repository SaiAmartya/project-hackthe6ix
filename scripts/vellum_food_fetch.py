import pymongo
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

def fetch_shelter_data():
    try:
        uri = os.getenv("MONGO_CONNECTION_STRING")
        client = MongoClient(uri)
        database = client["Info"]
        collection = database["FoodInfo"]
        results = list(collection.find({}, {"_id": 0}))
        client.close()
    except Exception as e:
        raise Exception(
            "The following error occurred: ", e)

    return {"food": results}

print(fetch_shelter_data())