from flask import Flask, request, jsonify,  render_template
import sqlite3
import os

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
    lng REAL
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

    conn = sqlite3.connect('reports.db')
    c = conn.cursor()
    c.execute('INSERT INTO reports (lat, lng) VALUES (?, ?)', (lat, lng))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Location reported successfully!'})

@app.route('/report', methods=['POST'])
def get_report():
    conn = sqlite3.connect('reports.db')
    c = conn.cursor()
    c.execute('SELECT lat, lng FROM reports')
    rows = c.fetchall()
    conn.close()

    reports = [{'lat': row[0], 'lng': row[1]} for row in rows]
    return jsonify(reports)

if __name__ == '__main__':
    app.run(debug=True)
