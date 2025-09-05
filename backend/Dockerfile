# Stage 1: Use an official Python runtime as a parent image
# We use a slim version to keep the image size small.
FROM python:3.11-slim

# Stage 2: Set the working directory inside the container
# All subsequent commands will run from this directory.
WORKDIR /app

# Stage 3: Copy the requirements file into the container
# This is done first to leverage Docker's layer caching.
COPY requirements.txt .

# Stage 4: Install the required packages
# The --no-cache-dir option keeps the image smaller.
RUN pip install --no-cache-dir -r requirements.txt

# Stage 5: Copy your application code into the container
# This copies everything from your backend folder into the /app directory in the container.
COPY ./app ./app

# Stage 6: Expose the port the app runs on
# This tells Docker that the container will listen on port 8000.
EXPOSE 8000

# Stage 7: Define the command to run your application
# This is the command that will be executed when the container starts.
# It tells uvicorn to run the 'app' object from the 'main' module in the 'app' directory.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
