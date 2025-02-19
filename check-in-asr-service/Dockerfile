FROM python:3.9.2-slim-buster

# Set the working directory within the container
WORKDIR /app

# Copy the application code into the container
COPY . /app

RUN apt-get update && \
    apt-get install -y \
    build-essential

# # Install the required dependencies
RUN pip install --upgrade pip

# Install the required dependencies
RUN pip install -r /app/requirements.txt  --verbose

# Expose port 3000 of the container for the Flask application
EXPOSE 3000

# Command to run the Flask application
CMD ["python", "/app/app.py"]