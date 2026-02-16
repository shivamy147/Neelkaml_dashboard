#!/usr/bin/env python3
"""
Test script to validate authentication functions
Run this before deployment to ensure auth is working
"""

import sys
import os

# Add the backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from models.auth import get_password_hash, verify_password
    
    def test_password_hashing():
        """Test password hashing with various scenarios"""
        print("Testing password hashing...")
        
        test_cases = [
            "simple123",
            "complex_password_with_special_chars!@#$%",
            "very_long_password_" * 10,  # This will be over 72 bytes
            "unicode_password_测试密码_🔐",
            "a" * 100  # Very long password
        ]
        
        results = []
        for password in test_cases:
            try:
                print(f"\nTesting password: '{password[:20]}...' (length: {len(password)})")
                
                # Test hashing
                hashed = get_password_hash(password)
                print(f"  Hash created: {len(hashed)} chars")
                
                # Test verification
                verification = verify_password(password, hashed)
                print(f"  Verification: {'✅ PASS' if verification else '❌ FAIL'}")
                
                # Test with wrong password
                wrong_verification = verify_password(password + "wrong", hashed)
                print(f"  Wrong password: {'❌ FAIL (correct)' if not wrong_verification else '✅ PASS (incorrect!)'}")
                
                results.append({
                    'password_length': len(password),
                    'hash_created': bool(hashed),
                    'verification_correct': verification,
                    'wrong_password_rejected': not wrong_verification
                })
                
            except Exception as e:
                print(f"  ❌ ERROR: {e}")
                results.append({
                    'password_length': len(password),
                    'error': str(e)
                })
        
        # Summary
        print("\n" + "="*50)
        print("SUMMARY:")
        all_passed = True
        for i, result in enumerate(results):
            if 'error' in result:
                print(f"Test {i+1}: ❌ ERROR - {result['error']}")
                all_passed = False
            elif all([
                result.get('hash_created'),
                result.get('verification_correct'),
                result.get('wrong_password_rejected')
            ]):
                print(f"Test {i+1}: ✅ PASS")
            else:
                print(f"Test {i+1}: ❌ FAIL")
                all_passed = False
        
        print(f"\nOverall result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
        return all_passed

    if __name__ == "__main__":
        print("🔐 Authentication Test Script")
        print("="*50)
        
        try:
            success = test_password_hashing()
            sys.exit(0 if success else 1)
            
        except ImportError as e:
            print(f"❌ Import Error: {e}")
            print("Make sure you're running this from the backend directory")
            print("and that all dependencies are installed:")
            print("  pip install passlib[bcrypt] python-jose[cryptography]")
            sys.exit(1)
            
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            sys.exit(1)

except ImportError as e:
    print(f"❌ Failed to import auth models: {e}")
    print("Run: pip install passlib[bcrypt] python-jose[cryptography]")
    sys.exit(1)