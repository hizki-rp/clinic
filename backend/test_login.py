#!/usr/bin/env python
"""
Test login functionality
"""
import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_api.settings')
django.setup()

def test_login():
    """Test login with demo credentials"""
    
    base_url = 'http://localhost:8000/api'
    
    test_users = [
        {'username': 'admin', 'password': 'admin123'},
        {'username': 'doctor', 'password': 'doctor123'},
        {'username': 'triage', 'password': 'triage123'},
        {'username': 'reception', 'password': 'reception123'},
        {'username': 'laboratory', 'password': 'laboratory123'},
    ]
    
    print("Testing login endpoints...\n")
    
    for user in test_users:
        print(f"Testing: {user['username']}")
        
        try:
            # Test login
            response = requests.post(
                f"{base_url}/auth/login/",
                json=user,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✓ Login successful")
                print(f"  ✓ Access token: {data['access'][:50]}...")
                print(f"  ✓ User: {data.get('user', {}).get('username', 'N/A')}")
                print(f"  ✓ Role: {data.get('user', {}).get('role', 'N/A')}")
                
                # Test profile endpoint with token
                profile_response = requests.get(
                    f"{base_url}/auth/profile/",
                    headers={
                        'Authorization': f"Bearer {data['access']}",
                        'Content-Type': 'application/json'
                    }
                )
                
                if profile_response.status_code == 200:
                    print(f"  ✓ Profile fetch successful")
                else:
                    print(f"  ✗ Profile fetch failed: {profile_response.status_code}")
            else:
                print(f"  ✗ Login failed: {response.status_code}")
                print(f"  Error: {response.text[:200]}")
        
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
        
        print()

if __name__ == '__main__':
    test_login()
