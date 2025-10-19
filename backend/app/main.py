from fastapi import FastAPI,HTTPException, status, Depends, Body
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
from kronoslabs import KronosLabs
from dotenv import load_dotenv
import os
import json
import sqlite3
from pathlib import Path

# Construct path to .env file relative to the script's location
dotenv_path = Path(__file__).parent.resolve() / '.env'
load_dotenv(dotenv_path=dotenv_path)
api_key = os.getenv("API_KEY")
if api_key is None:
    raise ValueError("API_KEY environment variable not set")

client = KronosLabs(api_key=api_key)

# Define an absolute path to the 'rulesets' directory and database
APP_ROOT = Path(__file__).parent.resolve()
UPLOAD_DIR = APP_ROOT / "rulesets"
os.makedirs(UPLOAD_DIR, exist_ok=True)
DB_PATH = APP_ROOT / "database.db"

def count_files_in_directory(directory: str):
    return len([
        f for f in os.listdir(directory)
        if os.path.isfile(os.path.join(directory, f))
    ])


app = FastAPI()


class User(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    username: str
    email: EmailStr

class Token(BaseModel):
    token: str
    # token_type: str
    id: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hash_password: str) -> bool:
    return pwd_context.verify(plain_password, hash_password)

secret_key = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)

@app.get('/')
def read_root():
    return {"message": "Welcome to the Hackathon FastAPI backend!"}

@app.get('/api/hello')
def hello():
    return {"message": "Hello from FastAPI 🚀"}

@app.post("/register", response_model=Token)
def register(user: User):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = hashed_password(user.password)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, hashed_pass) VALUES (?, ?, ?)",
            (user.username, user.email, hashed_pwd)
        )
        conn.commit()
    except sqlite3.Error as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        conn.close()

    access_token = create_access_token(data={"sub": user.email})
    return {"id": user.username, "token": access_token}

@app.post("/login", response_model=Token)
def login(user_credentials: UserLogin):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (user_credentials.email,))
    user_in_db = cursor.fetchone()
    conn.close()

    if not user_in_db or not verify_password(user_credentials.password, user_in_db["hashed_pass"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user_in_db["email"]})
    return {"token": access_token, "id": user_in_db["username"]}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@app.get("/me", response_model=UserPublic)
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post('/rules')
async def post_ruleset(data: dict):
    userId = data.get("userId")
    model = data.get("model")
    profileName = data.get("profileName")
    ruleset = data.get("ruleset")


    if not all([userId, model, ruleset]):
        raise HTTPException(status_code=400, detail="Missing basic userId, model, or ruleset in request body")

    profileId = count_files_in_directory(str(UPLOAD_DIR))
    filename = f"{userId}_{profileId}.json"
    file_path = UPLOAD_DIR / filename

    try:
        with open(file_path, "w") as f:
            json.dump(ruleset, f, indent=4)
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save ruleset file: {e}")

    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        if not isinstance(profileName, str) or not profileName.strip():
            raise HTTPException(
                status_code=500, 
                detail=f"DIAGNOSTIC FAILURE: The 'profileName' variable is invalid right before the database insert. This should not be possible. Value received: '{profileName}'. Type: {type(profileName)}. Please report this entire message."
            )

        cursor.execute(
            "INSERT INTO model_profiles (userId, profileId, profileName, model) VALUES (?, ?, ?, ?)",
            (userId, profileId, profileName, model)
        )
        conn.commit()
    except sqlite3.Error as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Database error: {e}. Ruleset file was not saved.")
    finally:
        if conn:
            conn.close()

    chat_session_data = create_chat_session({"userId": userId, "profileId": profileId})
    chatlogId = chat_session_data["chatlogId"]

    return {"profileId": profileId, "chatlogId": chatlogId}


@app.get('/rules/{userId}/{profileId}')
def get_ruleset(userId: str, profileId: int):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT model FROM model_profiles WHERE userId = ? AND profileId = ?", (userId, profileId))
        db_result = cursor.fetchone()

        if not db_result:
            raise HTTPException(status_code=404, detail=f"No model found for user {userId} with profileId {profileId}")

        model = db_result[0]

        filename = f"{userId}_{profileId}.json"
        file_path = UPLOAD_DIR / filename

        if not file_path.is_file():
            raise HTTPException(status_code=404, detail=f"Ruleset file not found for user {userId} with profileId {profileId}")

        with open(file_path, "r") as f:
            ruleset = json.load(f)

        return {"model": model, "ruleset": ruleset}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except (IOError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=500, detail=f"Error reading or parsing ruleset file: {e}")
    finally:
        if conn:
            conn.close()

@app.get('/profiles/{userId}')
def get_user_profiles(userId: str):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            "SELECT profileId, profileName FROM model_profiles WHERE userId = ?",
            (userId,)
        )

        profiles = cursor.fetchall()
        return {"profiles": [dict(row) for row in profiles]}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        if conn:
            conn.close()

@app.post('/chats')
def create_chat_session(data: dict):
    userId = data.get("userId")
    profileId = data.get("profileId")

    if not all([userId, profileId is not None]):
        raise HTTPException(status_code=400, detail="Missing userId or profileId in request body")

    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM model_profiles WHERE userId = ? AND profileId = ?", (userId, profileId))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail=f"Model profile not found for user {userId} and profile {profileId}")

        cursor.execute("INSERT INTO chat_logs (userId, profileId) VALUES (?, ?)", (userId, profileId))
        conn.commit()
        
        new_chatlogId = cursor.lastrowid
        return {"chatlogId": new_chatlogId}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        if conn:
            conn.close()

@app.get('/chats/{userId}/{profileId}')
def get_user_chats(userId: str, profileId: int):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            "SELECT chatlogId FROM chat_logs WHERE userId = ? AND profileId = ?",
            (userId, profileId)
        )

        chat_logs = cursor.fetchall()
        return {"chatlogIds": [row["chatlogId"] for row in chat_logs]}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        if conn:
            conn.close()

@app.get('/chats/{userId}/{profileId}/{chatlogId}/messages')
def get_chat_messages(userId: str, profileId: int, chatlogId: int):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            "SELECT chatlogId FROM chat_logs WHERE userId = ? AND profileId = ? AND chatlogId = ?",
            (userId, profileId, chatlogId)
        )
        if cursor.fetchone() is None:
            raise HTTPException(
                status_code=404,
                detail=f"Chat log with ID {chatlogId} not found for user {userId} and profile {profileId}"
            )

        cursor.execute(
            "SELECT messageId, sender, messageContent FROM messages WHERE chatlogId = ? ORDER BY messageId ASC",
            (chatlogId,)
        )

        messages = cursor.fetchall()
        return {"messages": [dict(row) for row in messages]}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        if conn:
            conn.close()

@app.post('/chats/response')
async def get_chat_response(data: dict):
    prompt = data.get("prompt")
    chatlogId = data.get("chatlogId")
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing prompt in request body")

    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT cl.userId, cl.profileId, mp.model 
            FROM chat_logs cl JOIN model_profiles mp ON cl.userId = mp.userId AND cl.profileId = mp.profileId
            WHERE cl.chatlogId = ?
        """, (chatlogId,))
        chat_data = cursor.fetchone()
        if not chat_data:
            raise HTTPException(status_code=404, detail=f"Chat log with ID {chatlogId} not found")

        userId, profileId, model = chat_data["userId"], chat_data["profileId"], chat_data["model"]

        filename = f"{userId}_{profileId}.json"
        file_path = UPLOAD_DIR / filename
        if not file_path.is_file():
            raise HTTPException(status_code=404, detail=f"Ruleset file not found: {filename}")
        with open(file_path, "r") as f:
            ruleset = json.load(f)

        cursor.execute("SELECT sender, messageContent FROM messages WHERE chatlogId = ? ORDER BY messageId ASC", (chatlogId,))
        history = cursor.fetchall()

        messages_for_llm = [{
            "role": "system",
            "content": f"You must strictly follow these rules: {json.dumps(ruleset)}"
        }]
        for message in history:
            role = "assistant" if message["sender"] == "llm" else "user"
            messages_for_llm.append({"role": role, "content": message["messageContent"]})
        messages_for_llm.append({"role": "user", "content": prompt})

        llm_response = client.chat.completions.create(
            model=model,
            messages=messages_for_llm,
            prompt=prompt,
            temperature=0.2,
            is_stream=False
        )
        response_content = llm_response.choices[0].message.content

        cursor.execute("SELECT MAX(messageId) FROM messages WHERE chatlogId = ?", (chatlogId,))
        max_id = cursor.fetchone()[0]
        user_messageId = (max_id + 1) if max_id is not None else 0
        llm_messageId = user_messageId + 1

        cursor.execute(
            "INSERT INTO messages (chatlogId, messageId, sender, messageContent) VALUES (?, ?, ?, ?)",
            (chatlogId, user_messageId, 'user', prompt)
        )
        cursor.execute(
            "INSERT INTO messages (chatlogId, messageId, sender, messageContent) VALUES (?, ?, ?, ?)",
            (chatlogId, llm_messageId, 'llm', response_content)
        )

        conn.commit()

        return {"response": response_content}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except (IOError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=500, detail=f"Error reading or parsing ruleset file: {e}")
    finally:
        if conn:
            conn.close()