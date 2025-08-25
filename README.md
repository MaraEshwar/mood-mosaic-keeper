## Face Recognition Attendance + Analytics

This project implements a Face Recognition Attendance system with weekly analytics and optional dashboard.

### Features
- Face registration via webcam or from a dataset folder
- Face detection and recognition using OpenCV + `face_recognition`
- Attendance tracking into SQLite with one entry per day per person
- Analytics and weekly PDF/Excel reports using Pandas + Matplotlib/Seaborn
- Optional Flask dashboard (basic stub included)

### Requirements
- Python 3.10+
- OS packages (Linux): `cmake`, `build-essential`, `libopenblas-dev`, `liblapack-dev`
- For dlib/face_recognition, you may need: `sudo apt-get install -y cmake libboost-all-dev`

### Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

If you have trouble installing `dlib`/`face_recognition`, consult their documentation. Prebuilt wheels are available for many platforms.

### Project Structure
```
face_attendance/
  __init__.py
  config.py
  db.py
  encodings_store.py
  face_utils.py
  register.py
  attendance.py
  analytics.py
  reporting.py
  emailer.py
  dashboard.py (optional)
data/
  dataset/            # optional local image dataset
  reports/            # generated weekly reports
  attendance.db       # SQLite database (auto-created)
```

### Dataset Structure
Each person has a folder with multiple images. Folder naming convention: `<ID>_<Name>`
```
data/dataset/
  1001_Alice/
    img1.jpg
    img2.jpg
  1002_Bob/
    img1.jpg
    img2.jpg
```

### Usage

Initialize the database (first run only happens automatically on first command):
```bash
python -m face_attendance.register --help
```

Register faces via webcam:
```bash
python -m face_attendance.register webcam --id 1001 --name "Alice" --num 10
```

Register faces from a dataset folder:
```bash
python -m face_attendance.register dataset --root data/dataset
```

Run live attendance tracking:
```bash
python -m face_attendance.attendance --tolerance 0.5 --camera 0
```

Generate weekly reports (PDF + Excel):
```bash
python -m face_attendance.reporting weekly --start 2025-01-06 --end 2025-01-12
```

Seed sample data (people + attendance) and generate a sample weekly report:
```bash
python -m face_attendance.seed --start 2025-01-06 --end 2025-01-12 --report
```

### Notes
- One entry per person per day is enforced at the DB level.
- Encodings are stored in SQLite as binary blobs.
- Reports are saved under `data/reports/`.

### Optional: Dashboard
Run a simple dashboard (basic):
```bash
python -m face_attendance.dashboard --host 0.0.0.0 --port 5000
```

### License
MIT
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c19464fd-8d12-45ba-91c0-284d4c349271

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c19464fd-8d12-45ba-91c0-284d4c349271) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c19464fd-8d12-45ba-91c0-284d4c349271) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
