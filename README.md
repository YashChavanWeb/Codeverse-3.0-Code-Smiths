# SmartVegis
Real-Time Market Intelligence Platform for Local Produce Markets

SmartVegis is a real-time market intelligence platform designed to modernize local vegetable and fruit markets. It enables customers and small vendors to track live prices, inventory availability, and nearby markets with low-latency synchronization and multilingual accessibility.

The platform focuses on real-world constraints such as rapid price fluctuations, non-technical vendors, and location-based discovery.

### [DemoVideo - URL](https://youtu.be/zhdM4Fknzcw?si=Y86-54KHT48h6Wgp)
### [Live Website - URL](https://smart-vegis.vercel.app)
---

## Problem Statement

Traditional local markets suffer from:
- No centralized or real-time visibility into prices and stock
- Manual and delayed vendor updates
- Language barriers between vendors and customers
- Poor discoverability of nearby markets
- No way to estimate basket cost before purchase

SmartVegis solves these issues using real-time streaming, geospatial data, and multilingual input support.

---

## Core Capabilities

### 1. Real-Time Price and Inventory Updates
- Live updates using Server-Sent Events (SSE)
- Queue-backed event propagation for consistency
- Zero page refresh across connected clients
- Low-latency synchronization across web and mobile platforms

### 2. Vendor Admin Dashboard
- Dedicated dashboard for vendors to manage:
  - Prices
  - Inventory levels
  - Market availability status
- Designed for fast updates in high-turnover environments
- Voice-assisted input for hands-free inventory updates

### 3. Multilingual Input Support
- Supports multiple Indian languages for vendor and user input
- Enables non-English-speaking vendors to update inventory easily
- Language-agnostic backend processing for consistency

### 4. Location-Based Market Discovery
- Geospatial queries to identify nearby markets
- Interactive maps built with Leaflet and OpenStreetMap
- Distance-aware filtering for relevant results

### 5. Intelligent Search and Cost Estimation
- Search vendors by specific vegetables or fruits
- Live availability indicators per vendor
- Dynamic basket cost estimator before purchase

---

## System Architecture

### Real-Time Data Flow
1. Vendor updates price or inventory via dashboard (text or voice)
2. Update is pushed to an internal event queue
3. Backend processes the update and streams it via SSE
4. All subscribed clients receive updates instantly

### Design Principles
- Event-driven architecture for real-time consistency
- SSE for lightweight, one-way live updates
- Stateless REST APIs for transactional operations
- Clear separation of real-time and CRUD logic

---

## Technology Stack

### Frontend
- React
- Tailwind CSS
- Leaflet
- OpenStreetMap (OSM)

### Backend
- Node.js
- Express.js
- MongoDB
- Server-Sent Events (SSE)

### Infrastructure & Services
- Cloudinary for media storage
- Queue-based event handling
- Speech-to-text integration for voice input

---

## Key Design Decisions

### Why Server-Sent Events (SSE)?
SSE was chosen over polling or WebSockets to:
- Reduce network and server overhead
- Simplify real-time data streaming
- Improve reliability under unstable connections
- Enable easier debugging and observability

---

## Edge Cases Addressed
- Concurrent vendor updates
- Inventory depletion during active sessions
- Client disconnections and SSE reconnections
- Partial or invalid vendor input
- Location fallback when GPS data is unavailable

---

## Use Cases
- Customers checking live prices before visiting markets
- Vendors updating stock in real time using text or voice
- Comparing nearby markets based on availability
- Estimating total basket cost before purchase

---

## Author
- **Krisha P. Chikka**  
- **Yash C. Chavan**
- **Anjali A. Gupta**
- **Sarwadeep Dhaval**
