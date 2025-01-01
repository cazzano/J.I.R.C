from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import jwt
import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Secret key for JWT
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key')

# Predefined credentials from environment variables
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@kala.com')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'password456')

@app.route('/api/login', methods=['POST'])
def login():
    # Get credentials from request
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    # Logging for debugging
    print(f"Login Attempt - Email: {email}")
    print(f"Expected Email: {ADMIN_EMAIL}")
    print(f"Password Provided: {password}")
    print(f"Expected Password: {ADMIN_PASSWORD}")

    # Validate credentials
    if (email == ADMIN_EMAIL and password == ADMIN_PASSWORD):
        # Create JWT token
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'success': True,
            'token': token,
            'message': 'Login Successful'
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid Credentials'
        }), 401

@app.route('/api/validate-token', methods=['POST'])
def validate_token():
    token = request.json.get('token')
    
    try:
        # Decode the token
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return jsonify({
            'valid': True,
            'email': decoded.get('email')
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({
            'valid': False,
            'message': 'Token has expired'
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            'valid': False,
            'message': 'Invalid token'
        }), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)
