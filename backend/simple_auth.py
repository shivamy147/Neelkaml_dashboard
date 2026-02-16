"""
Simple bcrypt authentication without passlib
Use this as fallback if passlib has version conflicts
"""
import bcrypt
import hashlib

def simple_hash_password(password: str) -> str:
    """Simple password hashing using bcrypt directly"""
    try:
        # Handle encoding and bcrypt 72-byte limit
        password_bytes = password.encode('utf-8')
        
        # If password is too long for bcrypt, pre-hash it
        if len(password_bytes) > 72:
            password_bytes = hashlib.sha256(password_bytes).digest()
            
        # Generate salt and hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        return hashed.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Password hashing failed: {e}")

def simple_verify_password(password: str, hashed_password: str) -> bool:
    """Simple password verification using bcrypt directly"""
    try:
        # Handle encoding and bcrypt 72-byte limit
        password_bytes = password.encode('utf-8')
        
        # If password is too long for bcrypt, pre-hash it (same as during hashing)
        if len(password_bytes) > 72:
            password_bytes = hashlib.sha256(password_bytes).digest()
            
        hashed_bytes = hashed_password.encode('utf-8')
        
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

# Test function
if __name__ == "__main__":
    print("Testing simple bcrypt authentication...")
    
    test_passwords = [
        "simple123",
        "test_password_with_special!@#",
        "very_long_password_" * 10,  # Over 72 bytes
        "短密码",  # Unicode
    ]
    
    for password in test_passwords:
        try:
            print(f"\nTesting: {password[:20]}... (len: {len(password)})")
            
            # Hash the password
            hashed = simple_hash_password(password)
            print(f"  ✅ Hashed successfully")
            
            # Verify correct password
            verify_correct = simple_verify_password(password, hashed)
            print(f"  ✅ Correct verification: {verify_correct}")
            
            # Verify wrong password
            verify_wrong = simple_verify_password(password + "wrong", hashed)
            print(f"  ✅ Wrong password rejected: {not verify_wrong}")
            
            if verify_correct and not verify_wrong:
                print(f"  🎉 SUCCESS for this password")
            else:
                print(f"  ❌ FAILED for this password")
                
        except Exception as e:
            print(f"  ❌ ERROR: {e}")