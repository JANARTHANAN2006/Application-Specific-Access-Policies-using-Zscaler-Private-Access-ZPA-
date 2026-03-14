# Application-Specific Access Policies using Zscaler Private Access (ZPA)

## Project Overview

This project implements an interactive web-based simulator and management dashboard for **Application-Specific Access Policies** using **Zscaler Private Access (ZPA)**. It demonstrates core Zero Trust Network Access (ZTNA) principles, ZPA architecture, and granular policy management — all through a modern, responsive single-page application.

---

## Objectives

1. **Understand ZPA Architecture** — Visualize the flow between Client Connector, ZPA Cloud (Service Edge), and App Connector.
2. **Demonstrate Application Segmentation** — Show how ZPA segments access at the application level, not the network level.
3. **Policy Management (CRUD)** — Create, read, update, and delete application-specific access policies with granular rules.
4. **User & Group Management** — Manage user identities, roles, and group-based access assignments.
5. **Policy Evaluation Simulation** — Test access scenarios using ZPA's "top-down, first-match" evaluation logic.
6. **Real-Time Monitoring** — Simulate live access logs and event monitoring.

---

## Key Concepts

### What is Zscaler Private Access (ZPA)?

ZPA is a cloud-native **Zero Trust Network Access (ZTNA)** solution that provides secure, application-specific access to private applications — without exposing the network. Unlike traditional VPNs, ZPA:

- **Never exposes the network** — users connect only to authorized applications
- **Uses inside-out connectivity** — App Connectors make outbound-only connections
- **Applies least-privilege access** — policies are defined per-user, per-application
- **Prevents lateral movement** — microsegmentation at the application level

### ZPA Architecture Components

| Component | Description |
|-----------|-------------|
| **Client Connector** | Software on user devices that authenticates the user and establishes encrypted microtunnels |
| **App Connector** | Lightweight VM deployed near private apps; makes outbound connections to ZPA Cloud |
| **ZPA Service Edge** | Cloud broker that stitches tunnels from Client Connector and App Connector |
| **Identity Provider (IdP)** | Authenticates users via SAML/SCIM integration |

### Policy Types in ZPA

| Policy Type | Purpose |
|------------|---------|
| **Access Policy** | Determines which users can access specific application segments |
| **Timeout Policy** | Defines re-authentication timeframes based on app security levels |
| **Client Forwarding Policy** | Dictates how client traffic is routed |
| **AppProtection Policy** | Inline inspection of application flows for threat detection |
| **Isolation Policy** | Routes browser-based access through web isolation |

### Policy Evaluation Rules

- **Top-down, first-match**: Rules are evaluated in order; the first matching rule is applied
- **Implicit deny**: If no rules match, access is blocked by default
- **OR between segments**: Multiple app segments within a rule use implicit OR
- **AND between criteria**: Different criteria types (user, group, posture) use AND logic

---

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic page structure |
| CSS3 | Dark theme design system with glassmorphism, gradients, animations |
| JavaScript (ES6+) | Interactive logic, CRUD, policy simulator, live monitoring |
| Google Fonts (Inter) | Modern typography |

---

## Features

### 1. Dashboard
- Real-time stats: Active Policies, Application Segments, Connected Users, Threat Events
- Quick-access overview with animated counters

### 2. ZPA Architecture Visualization
- Interactive diagram showing the zero-trust connection flow
- Client Connector → ZPA Cloud → App Connector path visualization

### 3. Access Policy Management
- Full CRUD operations for access policies
- Search and filter functionality
- Priority-based ordering (top-down evaluation)
- Policy rules with user/group and application segment assignments
- Toggle policies active/inactive

### 4. Application Segments
- Card-based layout showing all segmented applications
- Status indicators (Online/Offline/Maintenance)
- Protocol, port, and domain information
- Health monitoring displays

### 5. User & Group Management
- User table with role badges (Admin, User, Contractor, Guest)
- Group assignments and access level management
- Device posture status indicators

### 6. Real-Time Monitoring
- Live-updating access log feed
- Color-coded events (Allow, Deny, Warning)
- Timestamp and policy-match information

### 7. Policy Evaluation Simulator
- Interactive "test access" tool
- Select a user and target application
- See which policy matches and whether access is allowed/denied
- Demonstrates the top-down, first-match evaluation model

---

## How to Run

1. Open `index.html` in any modern web browser (Chrome, Firefox, Edge)
2. Navigate using the tab bar at the top
3. Interact with all panels — add policies, manage users, run simulations

---

## Project Structure

```
├── nmproject.md    # This documentation file
├── index.html      # Main application page
├── styles.css      # Design system & styling
└── app.js          # Application logic & interactivity
```

---

## References

- [Zscaler Private Access Documentation](https://help.zscaler.com/zpa)
- [ZTNA Architecture Overview — Zscaler](https://www.zscaler.com/technology/zero-trust-network-access)
- [ZPA Access Policy Configuration](https://help.zscaler.com/zpa/about-access-policy)
