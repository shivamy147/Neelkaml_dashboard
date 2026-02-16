# Create demo user for testing
from controllers.auth_controller import AuthController
from models.auth import UserCreate
from config import get_database
import asyncio

async def create_demo_user():
    """Create a demo user for testing"""
    db = get_database()
    auth_controller = AuthController(db)
    
    demo_user = UserCreate(
        email="demo@nilkamal.com",
        full_name="Demo User",
        password="demo123"
    )
    
    try:
        user = await auth_controller.create_user(demo_user)
        print(f"Demo user created successfully: {user.email}")
    except Exception as e:
        print(f"Demo user might already exist: {e}")

if __name__ == "__main__":
    asyncio.run(create_demo_user())