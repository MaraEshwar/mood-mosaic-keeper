from __future__ import annotations

import argparse
from datetime import date, datetime

from flask import Flask, jsonify, render_template_string, request

from .db import fetch_attendance


app = Flask(__name__)


TEMPLATE = """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Attendance Dashboard</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 24px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background: #f2f2f2; }
    </style>
  </head>
  <body>
    <h1>Live Attendance Logs</h1>
    <div>
      <label>Start: <input type="date" id="start"></label>
      <label>End: <input type="date" id="end"></label>
      <button onclick="load()">Load</button>
    </div>
    <table id="logs">
      <thead><tr><th>ID</th><th>Name</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
      <tbody></tbody>
    </table>
    <script>
      async function load(){
        const s = document.getElementById('start').value
        const e = document.getElementById('end').value
        const params = new URLSearchParams({start:s, end:e})
        const res = await fetch('/api/logs?'+params.toString())
        const data = await res.json()
        const tbody = document.querySelector('#logs tbody')
        tbody.innerHTML = ''
        for (const row of data){
          const tr = document.createElement('tr')
          for (const k of ['ID','Name','Date','Time','Status']){
            const td = document.createElement('td')
            td.textContent = row[k]
            tr.appendChild(td)
          }
          tbody.appendChild(tr)
        }
      }
      load()
    </script>
  </body>
  </html>
"""


@app.get("/")
def index():
    return render_template_string(TEMPLATE)


@app.get("/api/logs")
def api_logs():
    s = request.args.get("start")
    e = request.args.get("end")
    start = datetime.strptime(s, "%Y-%m-%d").date() if s else None
    end = datetime.strptime(e, "%Y-%m-%d").date() if e else None
    rows = fetch_attendance(start, end)
    data = [
        {"ID": r[0], "Name": r[1], "Date": r[2], "Time": r[3], "Status": r[4]}
        for r in rows
    ]
    return jsonify(data)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5000)
    args = parser.parse_args()
    app.run(host=args.host, port=args.port, debug=True)


if __name__ == "__main__":
    main()
