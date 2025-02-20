# LLM Service

docker build -t llm-service -f Dockerfile .

docker run -p 8080:8080 \
  -v "$(pwd)/models:/models" \
  llm-service \
  -m /models/Mistral-7B-Instruct-v0.3.Q8_0.gguf \
  -c 512 \
  --host 0.0.0.0 \
  --port 8080

## Threading code in server

```
if (params.n_threads_http < 1) {
    // +2 threads for monitoring endpoints
    params.n_threads_http = std::max(params.n_parallel + 2, (int32_t) std::thread::hardware_concurrency() - 1);
}
log_data["n_threads_http"] = std::to_string(params.n_threads_http);
svr->new_task_queue        = [&params] {
    return new httplib::ThreadPool(params.n_threads_http);
};
```

## References
