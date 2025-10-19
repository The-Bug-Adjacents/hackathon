FastAPI/Backend server start:
Make sure you are in the hackathon directory and run the following commands:

cd /backend/app
python -m venv venv
pip install -r requirements.txt

*Once these processes have finished run the following: *
*If on linux, gitbash, or mac*

source venv/Scripts/activate
python makeDB.py
uvicorn main:app

*If on windows: *

venv/Scripts/activate
python makeDB.py
uvicorn main:app


React/Frontend Server Start:
Make sure you are in the hackathon directory and run the following:

npm install
npm run dev