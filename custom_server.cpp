#include "httplib.h"
#include "json.hpp"

using json = nlohmann::json;

// Configuration for the custom endpoint
struct CustomEndpointConfig {
    std::string url = "http://localhost:3000"; // Default URL
    std::string endpoint = "/api/chat/results";  // Default endpoint path
    std::string auth_token = "";                 // Optional auth token
};

// Function to send results to custom endpoint
bool send_to_custom_endpoint(const CustomEndpointConfig& config, const json& result) {
    httplib::Client client(config.url);
    
    // Set up headers
    httplib::Headers headers = {
        {"Content-Type", "application/json"}
    };
    
    if (!config.auth_token.empty()) {
        headers.emplace("Authorization", "Bearer " + config.auth_token);
    }

    // Send POST request
    auto res = client.Post(config.endpoint, headers, result.dump(), "application/json");
    
    return res && res->status == 200;
}

// Example usage in server response handler:
/*

// In your server's completion handler:
void handle_completion(const httplib::Request& req, httplib::Response& res) {
    // Your existing completion logic here
    json result = process_completion();
    
    // Instead of sending back to client, send to custom endpoint
    CustomEndpointConfig config;
    config.url = "http://your-api.com";
    config.endpoint = "/api/results";
    config.auth_token = "your-auth-token";
    
    bool sent = send_to_custom_endpoint(config, result);
    
    // Optionally send minimal response back to original client
    if (sent) {
        res.set_content("{\"status\":\"processing\"}", "application/json");
    } else {
        res.status = 500;
        res.set_content("{\"error\":\"Failed to forward request\"}", "application/json");
    }
}

*/
