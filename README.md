# Project Setup

## 1. Install Bun
- macOS / Linux / WSL:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- macOS / Linux (Homebrew):
  ```bash
  brew install oven-sh/bun/bun
  ```
- Windows:
  ```bash
  npm install -g bun
  ```

## 2. Initialize the Package
```bash
bun install
```

## 3. Create .env File
```bash
cp .env.example .env
```
Update the values in `.env` if necessary.

The file [`env.js`](./src/env.js) is the source of truth for what environment
variables are needed.

## 4. Database

This requires docker.

Start the container:
```bash
bun run db:start
```

If this is your first time running the database, upload the schema
```bash
bun run db:push
```

Stop the container:
```bash
bun run db:stop
```

## 5. Run the Server

With the database container started.
```bash
bun run dev
```

Then `http://localhost:3000` is the url for a local instance of the application.
