from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from models.auth import User, UserCreate, UserLogin, UserResponse, verify_password, get_password_hash
import os

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

class AuthController:
    def __init__(self, db):
        self.db = db
        self.collection = db.users
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user with improved error handling"""
        try:
            # Validate user data
            try:
                # This will trigger pydantic validation
                validated_data = user_data.model_validate(user_data.model_dump())
            except ValueError as ve:
                # Handle validation errors specifically
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Validation error: {str(ve)}"
                )
            
            # Check if user already exists
            existing_user = await self.collection.find_one({"email": user_data.email.lower().strip()})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Create new user with improved password handling
            try:
                hashed_password = get_password_hash(user_data.password)
            except Exception as hash_error:
                print(f"Password hashing error: {hash_error}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password processing error. Please try a shorter password."
                )
            
            user_dict = {
                "email": user_data.email.lower().strip(),
                "full_name": user_data.full_name.strip(),
                "hashed_password": hashed_password,
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = await self.collection.insert_one(user_dict)
            
            if result.inserted_id:
                created_user = await self.collection.find_one({"_id": result.inserted_id})
                created_user["id"] = str(created_user.pop("_id"))
                return UserResponse(**created_user)
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        except HTTPException:
            raise
        except Exception as e:
            print(f"Unexpected error creating user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during user creation"
            )
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password - improved for deployment"""
        try:
            # Normalize email for lookup
            normalized_email = email.lower().strip()
            user_doc = await self.collection.find_one({"email": normalized_email})
            if not user_doc:
                print(f"User not found for email: {normalized_email}")
                return None
            
            user_doc["id"] = str(user_doc.pop("_id"))
            user = User(**user_doc)
            
            # Enhanced password verification with logging for debugging
            try:
                password_match = verify_password(password, user.hashed_password)
                if not password_match:
                    print(f"Password verification failed for user: {normalized_email}")
                    return None
                
                print(f"Successfully authenticated user: {normalized_email}")
                return user
            except Exception as verify_error:
                print(f"Password verification error for {normalized_email}: {verify_error}")
                return None
            
        except Exception as e:
            print(f"Authentication error for {email}: {e}")
            return None
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
        """Get current authenticated user from JWT token"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            token = credentials.credentials
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
        
        user_doc = await self.collection.find_one({"email": email})
        if user_doc is None:
            raise credentials_exception
        
        user_doc["id"] = str(user_doc.pop("_id"))
        return UserResponse(**user_doc)