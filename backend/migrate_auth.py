"""
Database migration script for password hash compatibility
Run this to update existing user passwords for deployment compatibility
"""
from motor.motor_asyncio import AsyncIOMotorClient
from models.auth import get_password_hash
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate_passwords():
    """Migrate existing user passwords to be deployment-compatible"""
    
    # MongoDB connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "neelkamal_dashboard")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db.users
    
    try:
        print("Starting password migration...")
        
        # Get all users
        users = await collection.find({}).to_list(None)
        print(f"Found {len(users)} users to check")
        
        for user in users:
            email = user.get("email")
            hashed_password = user.get("hashed_password")
            
            if not email or not hashed_password:
                continue
                
            print(f"Checking user: {email}")
            
            # Check if password hash looks like old format that might cause issues
            if len(hashed_password) < 60 or not hashed_password.startswith('$2b$'):
                print(f"  - Password hash format looks problematic for {email}")
                # You'll need to manually set new passwords for these users
                # Or implement a password reset function
            else:
                print(f"  - Password hash looks good for {email}")
        
        print("Password migration check complete!")
        
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        client.close()

async def test_auth(email: str, test_password: str = "testpass123"):
    """Test authentication for a specific user"""
    
    # MongoDB connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017") 
    DATABASE_NAME = os.getenv("DATABASE_NAME", "neelkamal_dashboard")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db.users
    
    try:
        # Find user
        user = await collection.find_one({"email": email.lower().strip()})
        if not user:
            print(f"User not found: {email}")
            return
            
        print(f"Found user: {email}")
        print(f"Hash length: {len(user['hashed_password'])}")
        print(f"Hash starts with: {user['hashed_password'][:10]}...")
        
        # Test new hash
        new_hash = get_password_hash(test_password)
        print(f"New hash length: {len(new_hash)}")
        print(f"New hash starts with: {new_hash[:10]}...")
        
        # Update user with new hash
        await collection.update_one(
            {"email": email.lower().strip()},
            {"$set": {"hashed_password": new_hash}}
        )
        print(f"Updated password hash for {email}")
        print(f"Test password: {test_password}")
        
    except Exception as e:
        print(f"Test auth error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "test":
            email = sys.argv[2] if len(sys.argv) > 2 else "test@example.com"
            password = sys.argv[3] if len(sys.argv) > 3 else "testpass123"
            asyncio.run(test_auth(email, password))
        elif sys.argv[1] == "migrate":
            asyncio.run(migrate_passwords())
    else:
        print("Usage:")
        print("  python migrate_auth.py migrate    # Check all users")
        print("  python migrate_auth.py test email@example.com newpassword123   # Update specific user")