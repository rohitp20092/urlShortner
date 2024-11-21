# URL Shortener Service

## Overview

A robust URL shortening service built with TypeScript and Node.js that implements WebSocket for real-time communication and includes a reliable message delivery system.

## Features

- ✨ URL shortening with unique 10-character codes
- 🔄 Real-time delivery via WebSocket
- ✅ Acknowledgment-based delivery system
- 🔁 Automatic retry mechanism
- 💾 Asynchronous storage operations
- 🌐 RESTful endpoints

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **WebSocket**: ws
- **Storage**: In-memory with async operations

## Getting Started


### Installation

**Install dependencies**
```bash
npm install 
```

**Start development server**
```bash
npm run dev
```

## Testing Guide

### Complete Flow Test

### Connect to WebSocket

For running the webSocket server run this cmds on another terminal:
- npm install -g wscat
- wscat ws://localhost:8080

Put the client id <clientId> in the postman header which is generated when we run the server:
 - wscat ws://localhost:8080

### Receive Client ID
```json
← {
    "type": "CLIENT_ID",
    "clientId": "abc123xyz"
}
```
#### In postman side

```http
POST  http://localhost:3000/url

put this things on the postman header:

- Content-Type: application/json
- X-Client-Id: <your-websocket-client-id>

put this things on the postman body/raw/json

{
    "url": "https://classcalc.com"
}
```

#### Response in postman side
```json
{
    "message": "URL shortening in progress"
}
```

### Receive Shortened URL
```json
← {
    "type": "SHORTENED_URL",
    "messageId": "msg123",
    "data": {
        "shortenedURL": "http://localhost:3000/abcd123xyz"
    }
}
```


### Send Acknowledgment
```json
→ {
    "type": "ACK",
    "messageId": "yitj0a"
}
```

### For Retrieve Original URL

```
http://localhost:3000/YOUR_SHORT_CODE
http://localhost:3000/rt0e977E7D   this url will be recived in the terminal wscat terminal
```

#### Response in postman side
```json
{
    "url": "https://classcalc.com"
}
```