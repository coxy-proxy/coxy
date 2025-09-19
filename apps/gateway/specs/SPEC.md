# API Gateway Product Specification

## 1. Persona
You are a senior backend developer with extensive experience in Node.js, Fastify framework, microservices architecture, and API gateway patterns. You have deep knowledge of proxy configurations, environment-based deployments, and production-ready server implementations.

## 2. Task Statement
Implement a high-performance API gateway service using Node.js and Fastify that routes traffic between a Next.js frontend application and a Nest.js backend API with configurable endpoints and ports.

## 3. Context
This API gateway serves as the single entry point for a full-stack application consisting of:
- **Frontend**: Next.js application serving the user interface
- **Backend**: Nest.js API server handling business logic and data operations
- **Gateway**: Fastify-based proxy service managing traffic routing and serving as a unified endpoint

The gateway will be deployed in a microservices environment where different services run on separate ports, and configuration flexibility is essential for different deployment environments (development, staging, production).

## 4. Constraints
- **Framework**: Must use Node.js with Fastify 5+ framework only
- **Proxy Plugin**: Must use `@fastify/http-proxy` plugin for all proxy functionality
- **Routing Rules**:
  - All requests to `/api/*` must proxy to the Nest.js backend
  - All other requests (`/`) must proxy to the Next.js frontend
  - Preserve original request paths, query parameters, headers, and body
- **Configuration**: All ports must be configurable via `.env` file
- **Environment Variables**:
  - `GATEWAY_PORT`: Port for the API gateway (default: 3000)
  - `BACKEND_HOST`: Backend API host (default: localhost)
  - `BACKEND_PORT`: Backend API port (default: 3020)
  - `FRONTEND_HOST`: Frontend host (default: localhost)  
  - `FRONTEND_PORT`: Frontend port (default: 3010)
- **Error Handling**: Implement proper error handling for upstream service failures
- **Performance**: Optimize for high throughput and low latency
- **Dependencies**: Use `@fastify/http-proxy` for proxy functionality; minimize other external dependencies

## 5. Stepwise Instructions
1. **Project Setup**:
   - Initialize Node.js project with proper package.json
   - Install Fastify and required proxy/http-client dependencies
   - Configure TypeScript if applicable
   
2. **Environment Configuration**:
   - Create `.env` file structure with all configurable ports and hosts
   - Implement environment variable loading with sensible defaults
   
3. **Fastify Server Setup**:
   - Initialize Fastify 5+ instance with appropriate configuration
   - Register `@fastify/http-proxy` plugin
   - Configure request logging and error handling
   
4. **Proxy Route Implementation**:
   - Configure `@fastify/http-proxy` for `/api/*` routes to proxy to Nest.js backend
   - Configure `@fastify/http-proxy` for catch-all routes to proxy to Next.js frontend
   - Ensure proper HTTP method support (GET, POST, PUT, DELETE, PATCH)
   - Use plugin's built-in upstream URL rewriting capabilities
   
5. **Request/Response Handling**:
   - Forward all headers, query parameters, and request body
   - Handle response streaming for large payloads
   - Preserve HTTP status codes and response headers
   
6. **Error Handling & Health Checks**:
   - Implement upstream service health monitoring
   - Add graceful error responses for service unavailability
   - Include proper logging for debugging
   
7. **Server Startup**:
   - Implement server startup with configured port
   - Add graceful shutdown handling

## 6. Output Specification
Provide the complete implementation including:

1. **package.json** with all required dependencies (including fastify@^5.0.0 and @fastify/http-proxy)
2. **Complete server.js (or index.js)** file with:
   - Environment configuration loading
   - Fastify 5+ server setup and configuration
   - `@fastify/http-proxy` plugin registration and configuration
   - Route handlers for both API and frontend proxying using the proxy plugin
   - Error handling middleware
   - Server startup code with proper logging
3. **.env.example** file showing all configurable environment variables
4. **README.md** with:
   - Setup instructions
   - Environment variable documentation
   - Usage examples
   - Development and production deployment notes

**Code Requirements**:
- Use modern JavaScript (ES6+) or TypeScript
- Use Fastify 5+ features and best practices
- Leverage `@fastify/http-proxy` plugin capabilities for efficient proxying
- Include comprehensive inline comments
- Follow Node.js best practices for production deployments
- Implement proper async/await patterns
- Use structured logging where appropriate

## 7. Examples

### Expected Route Behavior:
```javascript
// API routes - proxy to backend
GET  /api/users        -> http://localhost:3020/api/users
POST /api/auth/login   -> http://localhost:3020/api/auth/login

// Frontend routes - proxy to frontend
GET  /                 -> http://localhost:3010/
GET  /dashboard        -> http://localhost:3010/dashboard
GET  /about           -> http://localhost:3010/about
```

### Environment Configuration Example:
```bash
GATEWAY_PORT=3000
BACKEND_HOST=localhost
BACKEND_PORT=3020
FRONTEND_HOST=localhost
FRONTEND_PORT=3010
```

### Expected Server Startup Output:
```
[INFO] Loading environment configuration...
[INFO] Backend API: http://localhost:3020
[INFO] Frontend App: http://localhost:3010
[INFO] API Gateway listening on port 3000
[INFO] Routes configured:
  - /api/* -> Backend API
  - /* -> Frontend App
```

---

## Success Criteria
- Gateway successfully proxies requests to appropriate upstream services
- All HTTP methods and content types are supported
- Environment-based configuration works across different deployment scenarios
- Proper error handling when upstream services are unavailable
- Production-ready performance and logging capabilities
