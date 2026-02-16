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