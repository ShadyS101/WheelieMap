from flask import Flask, request, jsonify,  render_template
import sqlite3
import os
import datetime

app = Flask(__name__)

# added location for the database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'reports.db')

conn = sqlite3.connect('reports.db')
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

@app.route("/")
def index():
    return render_template("setTarget.html")

@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    lat = data['lat']
    lng = data['lng']
    hazard_type = data.get('type', 'Unknown')
    description = data.get('description', '')
    timestamp = datetime.datetime.now().isoformat()

    conn = sqlite3.connect('reports.db')
    c = conn.cursor()
    c.execute('INSERT INTO reports (lat, lng, type, description, timestamp) VALUES (?, ?, ?, ?, ?)',
        (lat, lng, hazard_type, description, timestamp))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Location reported successfully!'})

@app.route('/report', methods=['POST'])
def get_report():
    conn = sqlite3.connect('reports.db')
    c = conn.cursor()
    c.execute('SELECT lat, lng, type, description FROM reports')
    rows = c.fetchall()
    conn.close()

    reports = [{'lat': r[0], 'lng': r[1], 'type': r[2], 'description': r[3]} for r in rows]
    return jsonify(reports)

if __name__ == '__main__':
    app.run(debug=True)
