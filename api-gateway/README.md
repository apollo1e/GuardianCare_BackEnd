# API Gateway for GuardianCare Backend

## Overview

The API Gateway serves as the single entry point for all client requests to the GuardianCare backend services. It routes requests to the appropriate microservices, handles authentication, and provides a unified API for the Android app.

## Key Features

- **Single Entry Point**: Android app only needs to connect to one endpoint (port 8000 by default)
- **Request Routing**: Routes requests to the appropriate microservices
- **Authentication**: Validates JWT tokens before forwarding requests
- **Rate Limiting**: Prevents abuse by limiting requests
- **API Documentation**: Swagger UI available at `/api-docs`
- **Error Handling**: Standardized error responses
- **Logging**: Comprehensive request logging

## Architecture

```
Android App
    │
    ▼
API Gateway (Port 8000)
    │
    ├─── Auth Service
    │
    ├─── Elderly Management Service
    │
    ├─── Check-in Service
    │
    ├─── ASR Service
    │
    └─── LLM Service
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| API_GATEWAY_PORT | Port for the API Gateway | 8000 |
| AUTH_SERVICE_URL | URL for the Auth Service | http://auth-service:3000 |
| ELDERLY_SERVICE_URL | URL for the Elderly Service | http://elderly-service:3001 |
| CHECK_IN_SERVICE_URL | URL for the Check-in Service | http://check-in-service:5000 |
| ASR_SERVICE_URL | URL for the ASR Service | http://asr-service:5001 |
| LLM_SERVICE_URL | URL for the LLM Service | http://llm-service:5002 |
| JWT_SECRET | Secret for JWT validation | (required) |

## Setup and Running

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Docker

```bash
# Build the Docker image
docker build -t api-gateway .

# Run the container
docker run -p 8000:8000 -e JWT_SECRET=your_secret api-gateway
```

### Docker Compose

The API Gateway is configured to run with other services using Docker Compose. See the root `docker-compose.yml` file.

## API Routes

| Route | Service | Authentication Required |
|-------|---------|-------------------------|
| /api/auth/* | Auth Service | No |
| /api/users/* | Auth Service | Yes |
| /api/elderly/* | Elderly Service | Yes |
| /api/check-in/* | Check-in Service | Yes |
| /api/asr/* | ASR Service | Yes |
| /api/llm/* | LLM Service | Yes |

## Health Check

A health check endpoint is available at `/health` to verify the API Gateway is running.
