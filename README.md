# Connections Manager Backend

A Node.js backend service for managing user connections with SQLite database.

## Features

- User connection management
- Friends of friends discovery
- BFS-based connection search
- RESTful API endpoints

## Database Schema

### Users Table

```sql
users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL UNIQUE
)
```

### Connections Table

```sql
connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id1 INTEGER NOT NULL,
    user_id2 INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id1) REFERENCES users(user_id),
    FOREIGN KEY (user_id2) REFERENCES users(user_id),
    UNIQUE(user_id1, user_id2)
)
```

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will start on port 3000 by default.

## API Endpoints

### Milestone 1: Delete Connection

**DELETE** `/connection`

Deletes a connection between two users.

**Request Body:**

```json
{
  "user_id1": 1,
  "user_id2": 2
}
```

**Response:**

```json
{
  "message": "Connection deleted successfully",
  "deleted_connection": {
    "user_id1": 1,
    "user_id2": 2
  }
}
```

### Milestone 2: Friends of Friends

**GET** `/user/friends/{user_id}/friends_of_friends`

Gets the friends of friends for a specified user, excluding the base user and their direct friends.

**Response:**

```json
{
  "user_id": 1,
  "friends_of_friends": [
    {
      "user_id": 4,
      "user_name": "David"
    },
    {
      "user_id": 5,
      "user_name": "Eve"
    }
  ]
}
```

### Milestone 3: BFS Connection Search

**GET** `/connection/search/{user_id1}/{user_id2}`

Performs a BFS search to find the shortest connection path between two users.

**Response:**

```json
{
  "depth": 2,
  "connection": "found"
}
```

If no connection exists:

```json
{
  "depth": -1,
  "connection": "not_found"
}
```

## Utility endpoints

### Get All Users

**GET** `/users`

### Get All Connections

**GET** `/connections`

### Add New Connection

**POST** `/connection`

**Request Body:**

```json
{
  "user_id1": 1,
  "user_id2": 3
}
```

### Get Direct Friends

**GET** `/user/{user_id}/friends`

## Sample Data

The application comes with sample data:

- Users: Alice (1), Bob (2), Charlie (3), David (4), Eve (5), Frank (6)
- Connections: Alice-Bob, Alice-Charlie, Bob-David, Charlie-Eve, David-Frank, Eve-Frank

## Testing Examples

1. **Delete a connection:**

```bash
curl -X DELETE http://localhost:3000/connection \
  -H "Content-Type: application/json" \
  -d '{"user_id1": 1, "user_id2": 2}'
```

2. **Get friends of friends for Alice (user_id: 1):**

```bash
curl http://localhost:3000/user/friends/1/friends_of_friends
```

3. **Search for connection between Alice (1) and Frank (6):**

```bash
curl http://localhost:3000/connection/search/1/6
```

## Error Handling

The API includes comprehensive error handling for:

- Invalid user IDs
- Missing required parameters
- Database constraints
- Connection not found scenarios
- Internal server errors

## Database

The application uses SQLite with a file-based database (`connections.db`) that is automatically created when the server starts.
