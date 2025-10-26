from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3
import os
import datetime

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'reports.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL,
            lng REAL,
            type TEXT,
            description TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def get_conn():
    return sqlite3.connect(DB_PATH)

@app.route("/")
def index():
    return render_template("setTarget.html")

@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    lat = data.get('lat')
    lng = data.get('lng')
    hazard_type = data.get('type', 'Unknown')
    description = data.get('description', '')

    timestamp = datetime.datetime.now().isoformat()
    
    print("RECEIVED REPORT:", lat, lng, hazard_type, description)


    if lat is None or lng is None:
        return jsonify({'error': 'lat and lng are required'}), 400

    conn = get_conn()
    c = conn.cursor()
    c.execute(
        'INSERT INTO reports (lat, lng, type, description, timestamp) VALUES (?, ?, ?, ?, ?)',
        (lat, lng, hazard_type, description, timestamp)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Location reported successfully!'})

@app.route('/reports', methods=['GET'])
def get_reports():
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT lat, lng, type, description, timestamp FROM reports')
    rows = c.fetchall()
    conn.close()

    reports = [
        {
            'lat': r[0],
            'lng': r[1],
            'type': r[2],
            'description': r[3],
            'timestamp': r[4]
        }
        for r in rows
    ]
    return jsonify(reports)

if __name__ == '__main__':
    app.run(debug=True)
