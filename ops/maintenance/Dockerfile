FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir PyMySQL==1.1.2
WORKDIR /app
COPY server.py .
CMD ["python", "server.py"]
