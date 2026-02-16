from fastapi import APIRouter, HTTPException, status, Depends, Request
from datetime import timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.auth import UserCreate, UserLogin, AuthResponse, Token, UserResponse
from controllers.auth_controller import AuthController, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Controller instance (will be set from main server)
controller = None

security = HTTPBearer()

def set_controller(auth_controller: AuthController):
    global controller
    controller = auth_controller

async def get_current_user_dependency(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current user"""
    if not controller:
        raise HTTPException(status_code=500, detail="Auth controller not initialized")
    return await controller.get_current_user(credentials)

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Register a new user"""
    try:
        user = await controller.create_user(user_data)
        return AuthResponse(
            success=True,
            message="User created successfully",
            data=user
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/signin", response_model=AuthResponse)
async def signin(user_credentials: UserLogin):
    """Sign in user and return access token"""
    try:
        user = await controller.authenticate_user(
            user_credentials.email, 
            user_credentials.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = controller.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
        token = Token(access_token=access_token, token_type="bearer")
        
        return AuthResponse(
            success=True,
            message="Login successful",
            user=user_response,
            token=token
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=AuthResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user_dependency)):
    """Get current user information"""
    return AuthResponse(
        success=True,
        message="User information retrieved",
        user=current_user
    )

@router.post("/logout", response_model=AuthResponse)
async def logout():
    """Logout user (client-side token removal)"""
    return AuthResponse(
        success=True,
        message="Logged out successfully"
    )

@router.post("/debug/test-auth")
async def debug_auth(user_credentials: UserLogin):
    """Debug endpoint to test authentication - REMOVE IN PRODUCTION"""
    try:
        from models.auth import get_password_hash, verify_password
        
        # Check if user exists
        user_doc = await controller.collection.find_one({"email": user_credentials.email.lower().strip()})
        
        if not user_doc:
            return {"error": "User not found", "email": user_credentials.email.lower().strip()}
        
        # Test password hashing
        test_hash = get_password_hash(user_credentials.password)
        stored_hash = user_doc.get("hashed_password", "")
        
        # Test verification
        verification_result = verify_password(user_credentials.password, stored_hash)
        
        return {
            "user_found": True,
            "email": user_doc.get("email"),
            "stored_hash_length": len(stored_hash),
            "stored_hash_starts": stored_hash[:20] + "..." if len(stored_hash) > 20 else stored_hash,
            "test_hash_length": len(test_hash),
            "test_hash_starts": test_hash[:20] + "..." if len(test_hash) > 20 else test_hash,
            "password_verification": verification_result,
            "password_length": len(user_credentials.password),
            "password_utf8_length": len(user_credentials.password.encode('utf-8'))
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/debug/rehash-password")
async def debug_rehash_password(data: dict):
    """Debug endpoint to rehash a user's password - REMOVE IN PRODUCTION"""
    try:
        email = data.get("email", "").lower().strip()
        new_password = data.get("password", "")
        
        if not email or not new_password:
            return {"error": "Email and password required"}
        
        from models.auth import get_password_hash
        
        # Find user
        user_doc = await controller.collection.find_one({"email": email})
        if not user_doc:
            return {"error": "User not found"}
        
        # Generate new hash
        new_hash = get_password_hash(new_password)
        
        # Update user
        await controller.collection.update_one(
            {"email": email},
            {"$set": {"hashed_password": new_hash}}
        )
        
        return {
            "success": True,
            "message": f"Password updated for {email}",
            "new_hash_length": len(new_hash),
            "test_password": new_password
        }
    except Exception as e:
        return {"error": str(e)}