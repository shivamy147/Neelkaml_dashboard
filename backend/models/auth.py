from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Union
from datetime import datetime
import uuid
import hashlib
import bcrypt

# Direct bcrypt usage to avoid passlib version issues

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    hashed_password: str
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 100:  # Reasonable upper limit
            raise ValueError('Password is too long')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AuthResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Union[UserResponse, Token]] = None
    user: Optional[UserResponse] = None
    token: Optional[Token] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using direct bcrypt"""
    try:
        # Handle encoding and bcrypt 72-byte limit
        password_bytes = plain_password.encode('utf-8')
        
        # If password is too long for bcrypt, pre-hash it (same as during hashing)
        if len(password_bytes) > 72:
            password_bytes = hashlib.sha256(password_bytes).digest()
            
        hashed_bytes = hashed_password.encode('utf-8')
        
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using direct bcrypt"""
    try:
        # Handle encoding and bcrypt 72-byte limit
        password_bytes = password.encode('utf-8')
        
        # If password is too long for bcrypt, pre-hash it
        if len(password_bytes) > 72:
            password_bytes = hashlib.sha256(password_bytes).digest()
            print(f"Long password detected, using SHA256 pre-hash")
            
        # Generate salt and hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise ValueError(f"Password hashing failed: {e}")