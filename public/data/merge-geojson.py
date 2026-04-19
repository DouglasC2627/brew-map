"""
Merge individual region GeoJSON files into one regions.geojson.

Usage:
  1. Place all extracted .json files in a folder called `extracted-geojsons/`
  2. Name each file by regionId: et-yirgacheffe.json, ke-nyeri.json, etc.
  3. Run: python merge_regions.py
"""

import json
import os

# Property mapping: regionId → { country, name, altitudeRange }
REGION_META = {
    "et-yirgacheffe": {"country": "Ethiopia", "name": "Yirgacheffe, Gedeo Zone · Ethiopia", "altitudeRange": [1750, 2200]},
    "et-sidamo": {"country": "Ethiopia", "name": "Sidamo, SNNPR · Ethiopia", "altitudeRange": [1550, 2200]},
    "et-guji": {"country": "Ethiopia", "name": "Guji Zone, Oromia · Ethiopia", "altitudeRange": [1800, 2300]},
    "ke-nyeri": {"country": "Kenya", "name": "Nyeri County · Kenya", "altitudeRange": [1200, 2000]},
    "ke-kirinyaga": {"country": "Kenya", "name": "Kirinyaga County · Kenya", "altitudeRange": [1300, 1900]},
    "rw-nyamasheke": {"country": "Rwanda", "name": "Nyamasheke, Western Province · Rwanda", "altitudeRange": [1500, 2000]},
    "tz-kilimanjaro": {"country": "Tanzania", "name": "Kilimanjaro slopes · Tanzania", "altitudeRange": [1200, 1800]},
    "bu-kayanza": {"country": "Burundi", "name": "Kayanza Province · Burundi", "altitudeRange": [1700, 2000]},
    "gt-antigua": {"country": "Guatemala", "name": "Antigua Valley, Sacatepéquez · Guatemala", "altitudeRange": [1500, 1700]},
    "gt-huehue": {"country": "Guatemala", "name": "Huehuetenango · Guatemala", "altitudeRange": [1500, 2000]},
    "cr-tarrazu": {"country": "Costa Rica", "name": "Tarrazú, San José · Costa Rica", "altitudeRange": [1200, 1900]},
    "pa-boquete": {"country": "Panama", "name": "Boquete, Chiriquí · Panama", "altitudeRange": [1200, 1800]},
    "hn-copan": {"country": "Honduras", "name": "Copán · Honduras", "altitudeRange": [1000, 1500]},
    "sv-apaneca": {"country": "El Salvador", "name": "Apaneca-Ilamatepec range · El Salvador", "altitudeRange": [1000, 1800]},
    "ni-jinotega": {"country": "Nicaragua", "name": "Jinotega · Nicaragua", "altitudeRange": [1100, 1700]},
    "mx-chiapas": {"country": "Mexico", "name": "Chiapas Highlands · Mexico", "altitudeRange": [900, 1800]},
    "co-huila": {"country": "Colombia", "name": "Huila · Colombia", "altitudeRange": [1200, 2000]},
    "co-narino": {"country": "Colombia", "name": "Nariño · Colombia", "altitudeRange": [1500, 2300]},
    "co-tolima": {"country": "Colombia", "name": "Tolima · Colombia", "altitudeRange": [1200, 2000]},
    "br-cerrado": {"country": "Brazil", "name": "Cerrado Mineiro, MG · Brazil", "altitudeRange": [800, 1300]},
    "br-sul-minas": {"country": "Brazil", "name": "Sul de Minas, MG · Brazil", "altitudeRange": [700, 1350]},
    "pe-cajamarca": {"country": "Peru", "name": "Cajamarca · Peru", "altitudeRange": [1200, 2050]},
    "bo-caranavi": {"country": "Bolivia", "name": "Caranavi, La Paz · Bolivia", "altitudeRange": [800, 1650]},
    "id-sumatra": {"country": "Indonesia", "name": "Lintong, North Sumatra · Indonesia", "altitudeRange": [1200, 1600]},
    "id-java": {"country": "Indonesia", "name": "Ijen Plateau, East Java · Indonesia", "altitudeRange": [900, 1500]},
    "ye-haraz": {"country": "Yemen", "name": "Haraz Mountains · Yemen", "altitudeRange": [1500, 2500]},
    "in-malabar": {"country": "India", "name": "Malabar Coast, Karnataka · India", "altitudeRange": [600, 1500]},
    "pg-eastern-highlands": {"country": "Papua New Guinea", "name": "Eastern Highlands (Goroka) · Papua New Guinea", "altitudeRange": [1300, 1900]},
    "us-kona": {"country": "United States", "name": "Kona, Big Island · United States", "altitudeRange": [150, 900]},
    "jm-blue-mountain": {"country": "Jamaica", "name": "Blue Mountains · Jamaica", "altitudeRange": [900, 1700]},
}

def merge_regions(input_dir="extracted-geojsons/", output_file="regions.geojson"):
    features = []
    missing = []

    for region_id, meta in REGION_META.items():
        filepath = os.path.join(input_dir, f"{region_id}.json")
        print(filepath)
        if not os.path.exists(filepath):
            missing.append(region_id)
            continue

        with open(filepath) as f:
            data = json.load(f)

        # Get the first feature (or merged feature)
        if data["type"] == "FeatureCollection":
            geom = data["features"][0]["geometry"]
        elif data["type"] == "Feature":
            geom = data["geometry"]
        else:
            geom = data

        feature = {
            "type": "Feature",
            "properties": {
                "regionId": region_id,
                "country": meta["country"],
                "name": meta["name"],
                "altitudeRange": meta["altitudeRange"],
            },
            "geometry": geom,
        }
        features.append(feature)

    if missing:
        print(f"⚠  Missing files for: {', '.join(missing)}")

    result = {
        "type": "FeatureCollection",
        "features": features,
    }

    with open(output_file, "w") as f:
        json.dump(result, f)

    size_kb = os.path.getsize(output_file) / 1024
    print(f"✅ Wrote {output_file}: {len(features)} features, {size_kb:.0f} KB")

    if size_kb > 500:
        print(f"⚠  File is {size_kb:.0f} KB — target is <500 KB. Re-simplify the largest polygons.")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir = os.path.join(script_dir, "extracted-geojsons")
    output_file = os.path.join(script_dir, "regions.geojson")
    merge_regions(input_dir, output_file)