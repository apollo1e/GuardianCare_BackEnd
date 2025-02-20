FROM ubuntu:22.04 AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    curl \
    libcurl4-openssl-dev \
    pkg-config \
    libssl-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

# Build
RUN mkdir build && cd build && cmake .. && make -j$(nproc)

FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/build/asr_service /usr/local/bin/asr_service
COPY models /models

EXPOSE 8080
CMD ["/usr/local/bin/asr_service"]
