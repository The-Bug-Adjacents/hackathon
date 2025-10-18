from fastapi import FastAPI,HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
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
    access_token: str
    # token_type: str
    id: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hash_password: str) -> bool:
    return pwd_context.verify(plain_password, hash_password)

SECRET_KEY = "key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

users_db = {}
@app.get('/')
def read_root():
    return {"message": "Welcome to the Hackathon FastAPI backend!"}

@app.get('/api/hello')
def hello():
    return {"message": "Hello from FastAPI 🚀"}

@app.post("/register")
def register(user: User):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = hashed_password(user.password)
    users_db[user.email] = {
        "username": user.username,
        "email": user.email,
        "hashed_pass": hashed_pwd
    }
    return {"message": "Registered successfully!", "id": user.username}
@app.post("/login", response_model=Token)
def login(user_credentials: UserLogin):
    user_in_db = users_db.get(user_credentials.email)
    if not user_in_db or not verify_password(user_credentials.password, user_in_db["hashed_pass"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user_in_db["email"]})
    return {"access_token": access_token, "id": user_in_db["username"]}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None or email not in users_db:
            raise HTTPException(status_code=401, detail="Invalid token")
        return users_db[email]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/me", response_model=UserPublic)
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user