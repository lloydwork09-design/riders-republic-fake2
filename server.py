from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import os
from pymongo import MongoClient, DESCENDING
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'extreme_sports_db')

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
scores_collection = db['scores']
stats_collection = db['stats']

class ScoreSubmit(BaseModel):
    player_name: str
    score: int
    vehicle: str
    tricks_landed: int
    max_speed: float

class PlayerStats(BaseModel):
    player_name: str
    vehicle: str
    distance_traveled: float
    air_time: float
    tricks_performed: int

@app.get('/api/health')
async def health():
    return {'status': 'ok', 'message': 'Extreme Sports API Running'}

@app.post('/api/scores')
async def submit_score(score_data: ScoreSubmit):
    score_doc = {
        'player_name': score_data.player_name,
        'score': score_data.score,
        'vehicle': score_data.vehicle,
        'tricks_landed': score_data.tricks_landed,
        'max_speed': score_data.max_speed,
        'created_at': datetime.now(timezone.utc)
    }
    result = scores_collection.insert_one(score_doc)
    return {'success': True, 'id': str(result.inserted_id), 'score': score_data.score}

@app.get('/api/leaderboard')
async def get_leaderboard(limit: int = 10):
    scores = list(scores_collection.find(
        {},
        {'_id': 0}
    ).sort('score', DESCENDING).limit(limit))
    return {'leaderboard': scores}

@app.get('/api/leaderboard/{vehicle}')
async def get_vehicle_leaderboard(vehicle: str, limit: int = 5):
    scores = list(scores_collection.find(
        {'vehicle': vehicle},
        {'_id': 0}
    ).sort('score', DESCENDING).limit(limit))
    return {'leaderboard': scores, 'vehicle': vehicle}

@app.post('/api/stats')
async def submit_stats(stats_data: PlayerStats):
    stats_doc = {
        'player_name': stats_data.player_name,
        'vehicle': stats_data.vehicle,
        'distance_traveled': stats_data.distance_traveled,
        'air_time': stats_data.air_time,
        'tricks_performed': stats_data.tricks_performed,
        'created_at': datetime.now(timezone.utc)
    }
    result = stats_collection.insert_one(stats_doc)
    return {'success': True, 'id': str(result.inserted_id)}

@app.get('/api/stats/{player_name}')
async def get_player_stats(player_name: str):
    stats = list(stats_collection.find(
        {'player_name': player_name},
        {'_id': 0}
    ).sort('created_at', DESCENDING).limit(20))
    return {'stats': stats, 'player': player_name}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001)

