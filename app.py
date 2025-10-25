import overpy
from flask import Flask, jsonify, render_template

app = Flask(__name__)
api = overpy.Overpass()

@app.route("/")
def index()
    return render_template("index.html")

@app.route("/get_accessible_places")
def get_accessible_places():
    query = """
    [out:json];j
    area["name"="London"]->.searchArea;
    node["amenity"="restaurant"]["wheelchair"="yes"](area.searchArea);
    out body;
    """
    result = api.query(query)
    places = [
        {"name": n.tags.get("name", "Unnamed"), "lat": n.lat, "lon": n.lon}
        for n in result.nodes
    ]
    return jsonify(places)

if __name__ == "__main__":
    app.run(debug=True)
