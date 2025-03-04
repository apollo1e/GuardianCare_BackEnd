# GuardianCare Backend

GuardianCare is a comprehensive elderly care management system that integrates various services to provide efficient care management, health monitoring, and communication features.

## System Architecture

The backend consists of several microservices:
- **API Gateway (Envoy)**: Routes requests to appropriate services and handles authentication
- **Auth Service**: Manages user authentication and authorization
- **Elderly Management Service**: Handles elderly profiles and caretaker assignments
- **Check-in Service**: Manages elderly check-in status and history
- **ASR Service**: Provides automatic speech recognition capabilities
- **LLM Service**: Offers language model processing for chat and analysis

Each service has its own documentation in its respective directory:
- [Auth Service Documentation](services/auth-service/README.md)
- [Elderly Management Service Documentation](services/elderly-management-service/README.md)
- [Check-in Service Documentation](services/check-in-service/README.md)
- [ASR Service Documentation](services/asr-service/README.md)
- [LLM Service Documentation](services/llm-service/README.md)

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- MongoDB
- Python 3.8+ (for ASR and Check-in services)
- C++ compiler (for LLM service)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd GuardianCare_BackEnd
   ```

2. Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env
   ```

3. Configure the following environment variables in `.env`:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h

   # Service Ports
   API_GATEWAY_PORT=8000
   AUTH_SERVICE_PORT=3000
   ELDERLY_SERVICE_PORT=3001
   CHECK_IN_SERVICE_PORT=5000
   ASR_SERVICE_PORT=5001
   LLM_SERVICE_PORT=5002
   ```

## Running the Services

1. Start all services using Docker Compose:
   ```bash
   docker-compose up
   ```

2. The API will be available at `http://localhost:8000`
3. Monitor Envoy's admin interface at `http://localhost:9901`

## API Testing Guide

### Authentication Endpoints

1. Register a new user:
   ```http
   POST http://localhost:8000/api/auth/register
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User",
     "user_type": "caretaker",
     "phone": "1234567890"
   }
   ```

2. Login to get JWT token:
   ```http
   POST http://localhost:8000/api/auth/login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

### User Management

1. Get user profile:
   ```http
   GET http://localhost:8000/api/users/profile
   Authorization: Bearer <your_jwt_token>
   ```

2. Update user profile:
   ```http
   PUT http://localhost:8000/api/users/profile
   Authorization: Bearer <your_jwt_token>
   Content-Type: application/json

   {
     "name": "Updated Name",
     "phone": "9876543210"
   }
   ```

### Elderly Management

1. Register new elderly:
   ```http
   POST http://localhost:8000/api/elderly/register
   Authorization: Bearer <your_jwt_token>
   Content-Type: application/json

   {
     "name": "Elder Name",
     "age": 75,
     "gender": "female",
     "room_number": "A101",
     "emergency_contact": "1234567890"
   }
   ```

2. Get elderly list:
   ```http
   GET http://localhost:8000/api/elderly/list
   Authorization: Bearer <your_jwt_token>
   ```

3. Assign caretaker:
   ```http
   POST http://localhost:8000/api/elderly/assign
   Authorization: Bearer <your_jwt_token>
   Content-Type: application/json

   {
     "elderlyId": "elderly_object_id",
     "caretakerId": "caretaker_object_id"
   }
   ```

4. Remove caretaker:
   ```http
   POST http://localhost:8000/api/elderly/remove-caretaker
   Authorization: Bearer <your_jwt_token>
   Content-Type: application/json

   {
     "elderlyId": "elderly_object_id"
   }
   ```

### Check-in Service

1. Get check-in status:
   ```http
   GET http://localhost:8000/api/check-in/status
   Authorization: Bearer <your_jwt_token>
   ```

2. Record check-in:
   ```http
   POST http://localhost:8000/api/check-in/record
   Authorization: Bearer <your_jwt_token>
   Content-Type: application/json

   {
     "elderly_id": "elderly_object_id",
     "status": "checked_in",
     "location": "dining_room",
     "timestamp": "2024-03-04T12:00:00Z"
   }
   ```

### ASR Service

1. Transcribe audio:
   ```http
   POST http://localhost:8000/api/asr/transcribe
   Authorization: Bearer <your_jwt_token>
   Content-Type: multipart/form-data

   file: <audio_file>
   language: "en" (optional)
   ```

### LLM Service

1. Chat with LLM:
   ```http
   POST http://localhost:8000/api/llm/chat
   Authorization: Bearer <your_jwt_token>
   Content-Type: application/json

   {
     "message": "Your question or prompt here",
     "context": "Optional context about the elderly person"
   }
   ```

2. Analyze text:
   ```http
   POST http://localhost:8000/api/llm/analyze
   Authorization: Bearer <your_jwt_token>
   Content-Type: application/json

   {
     "text": "Text to analyze",
     "type": "sentiment|emergency|health"
   }
   ```

## Postman Collection

A Postman collection is provided for testing all endpoints. To use it:

1. Import `GuardianCare Envoy.postman_collection.json` into Postman
2. Create an environment and set the following variables:
   - `baseUrl`: http://localhost:8000
   - `auth_token`: (Set this after successful login)
3. Use the collection to test all endpoints

## Development

Each service can be developed independently. Refer to individual service READMEs for specific development instructions:
- [Auth Service Development](services/auth-service/README.md)
- [Elderly Management Service Development](services/elderly-management-service/README.md)
- [Check-in Service Development](services/check-in-service/README.md)
- [ASR Service Development](services/asr-service/README.md)
- [LLM Service Development](services/llm-service/README.md)

## Monitoring and Debugging

1. Service Logs:
   ```bash
   # View all service logs
   docker-compose logs

   # View specific service logs
   docker-compose logs auth-service
   docker-compose logs elderly-service
   ```

2. Envoy Admin Interface:
   - Access http://localhost:9901 for:
    - Runtime statistics
    - Configuration dump
    - Cluster health
    - Route table

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]
