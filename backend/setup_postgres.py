#!/usr/bin/env python3
"""
PostgreSQL Setup Script for NaviCare Backend
This script sets up PostgreSQL using Docker and initializes the database.
"""

import subprocess
import sys
import time
import requests


def run_command(command, shell=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=shell, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_docker():
    """Check if Docker is available"""
    success, stdout, stderr = run_command("docker --version")
    if success:
        print(f"✅ Docker found: {stdout.strip()}")
        return True
    else:
        print("❌ Docker not found. Please install Docker Desktop.")
        print("Download from: https://www.docker.com/products/docker-desktop")
        return False

def setup_postgres_container():
    """Set up PostgreSQL container"""
    print("\n🐘 Setting up PostgreSQL container...")
    
    # Stop existing container if it exists
    print("Stopping existing container (if any)...")
    run_command("docker stop navicare-postgres")
    run_command("docker rm navicare-postgres")
    
    # Run PostgreSQL container
    postgres_command = [
        "docker", "run", "-d",
        "--name", "navicare-postgres",
        "-e", "POSTGRES_DB=navicare_db",
        "-e", "POSTGRES_USER=navicare_user",
        "-e", "POSTGRES_PASSWORD=navicare_pass",
        "-p", "5432:5432",
        "postgres:15"
    ]
    
    success, stdout, stderr = run_command(postgres_command, shell=False)
    
    if success:
        print("✅ PostgreSQL container started successfully")
        print(f"Container ID: {stdout.strip()}")
        return True
    else:
        print(f"❌ Failed to start PostgreSQL container: {stderr}")
        return False

def wait_for_postgres():
    """Wait for PostgreSQL to be ready"""
    print("\n⏳ Waiting for PostgreSQL to be ready...")
    
    for i in range(30):  # Wait up to 30 seconds
        success, _, _ = run_command(
            "docker exec navicare-postgres pg_isready -U navicare_user -d navicare_db"
        )
        
        if success:
            print("✅ PostgreSQL is ready!")
            return True
        
        print(f"   Attempt {i+1}/30 - PostgreSQL not ready yet...")
        time.sleep(1)
    
    print("❌ PostgreSQL failed to start within 30 seconds")
    return False

def initialize_backend_db():
    """Initialize the backend database via API"""
    print("\n🔧 Initializing backend database...")
    
    try:
        # First check if backend is running
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            
            # Initialize database
            init_response = requests.post('http://localhost:5000/api/init-db', timeout=10)
            if init_response.status_code == 200:
                data = init_response.json()
                print(f"✅ {data['message']}")
                return True
            else:
                print(f"❌ Failed to initialize database: {init_response.text}")
                return False
        else:
            print("❌ Backend is not responding")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure Flask app is running.")
        print("   Run: python backend/app.py")
        return False
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

def show_connection_info():
    """Show database connection information"""
    print("\n📋 Database Connection Information:")
    print("="*50)
    print("Host: localhost")
    print("Port: 5432")
    print("Database: navicare_db")
    print("Username: navicare_user")
    print("Password: navicare_pass")
    print("")
    print("Connection String:")
    print("postgresql://navicare_user:navicare_pass@localhost:5432/navicare_db")
    print("="*50)

def main():
    print("🩺 NaviCare PostgreSQL Setup")
    print("="*40)
    
    # Check prerequisites
    if not check_docker():
        sys.exit(1)
    
    # Set up PostgreSQL
    if not setup_postgres_container():
        sys.exit(1)
    
    # Wait for PostgreSQL to be ready
    if not wait_for_postgres():
        sys.exit(1)
    
    # Show connection info
    show_connection_info()
    
    print("\n🎉 PostgreSQL setup complete!")
    print("\nNext steps:")
    print("1. Install Python dependencies: pip install -r backend/requirements.txt")
    print("2. Start the backend: python backend/app.py")
    print("3. Initialize database: python -c \"import requests; requests.post('http://localhost:5000/api/init-db')\"")
    print("\nTo stop PostgreSQL: docker stop navicare-postgres")
    print("To start PostgreSQL: docker start navicare-postgres")

if __name__ == "__main__":
    main()