# TalentFlow - A Mini Hiring Platform

TalentFlow is a modern web application designed to streamline the hiring process by managing job listings, candidates, and assessments. Built with React and modern web technologies, it offers a seamless experience for managing your recruitment pipeline.

🌐 **Live Demo**: [talentflow.sahin45.tech](https://talentflow.sahin45.tech)

## Table of Contents

* [Features](#features)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
* [Development](#development)
* [Deployment](#deployment)
* [Application Features](#application-features)
* [Contributing](#contributing)

## Features

### Job Management

* Create and manage job listings
* Track job status and requirements
* Custom fields for job descriptions

### Candidate Management

* Maintain candidate profiles
* Track application status
* Notes and feedback system

### Assessment System

* Create custom assessments for each job
* Multiple question types support
* Real-time assessment preview
* Track candidate responses

### Offline-First Architecture

* Works without internet connection
* Local data persistence
* Sync when online

## Technology Stack

* **Frontend Framework**: React 19
* **Build Tool**: Vite 7
* **State Management**: React Context API
* **Data Storage**: IndexedDB (Dexie.js)
* **UI Components**
  * Custom components
  * React DnD (@hello-pangea/dnd)
  * React Mentions
* **Development Tools**
  * ESLint
  * pnpm package manager
  * Docker support

## Project Structure

```text
talentflow/
├── src/
│   ├── api/               # API and data layer
│   │   ├── controllers/   # Data controllers
│   │   ├── hydrate.js    # Initial data setup
│   │   └── server.js     # API configuration
│   ├── components/        # Reusable UI components
│   ├── context/          # React Context providers
│   ├── db/               # Database configuration
│   ├── hooks/            # Custom React hooks
│   └── pages/            # Page components
├── public/               # Static assets
└── docker/              # Docker configuration
```

### Key Directories

* **api/**: Contains the data layer and controllers
* **components/**: Reusable UI components like forms and modals
* **context/**: Context providers for state management
* **db/**: Database configuration and schemas
* **hooks/**: Custom React hooks for shared logic
* **pages/**: Main page components

## Getting Started

### Installation

1. **Clone the repository**

```bash
git clone "https://github.com/Ruler45/TalentFlow.git"
cd TalentFlow
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Start the development server**

```bash
pnpm dev
```

## Development

### Prerequisites

* Node.js 18 or higher
* pnpm package manager
* Git

### Available Scripts

* `pnpm dev`: Start development server
* `pnpm build`: Build for production
* `pnpm lint`: Run ESLint
* `pnpm preview`: Preview production build

### Using Docker

#### Development Mode

```bash
docker-compose up
```

#### Production Build

```bash
docker build -t talentflow .
docker run -p 80:80 talentflow
```

## Deployment

### Vercel Deployment

The application is deployed on Vercel and accessible at [talentflow.sahin45.tech](https://talentflow.sahin45.tech)

#### Configuration Steps

##### Build Settings

* Build Command: `pnpm build`
* Output Directory: `dist`
* Install Command: `pnpm install`
* Node.js Version: 18.x

##### Environment Setup

* No sensitive environment variables required
* Uses client-side storage with IndexedDB

##### Domain Setup

* Custom domain: talentflow.sahin45.tech
* SSL/TLS: Automatically handled by Vercel

#### Deployment Process

##### Build Application

```bash
pnpm build
```

##### Deploy to Vercel

```bash
vercel
```

##### Deploy to Production

```bash
vercel --prod
```

## Application Features

### Job Management

* Create new job listings with detailed descriptions
* Track application status and progress
* Filter and search job listings

### Candidate Management

* Add and track candidate information
* Review candidate applications
* Add notes and feedback
* Track candidate progress

### Assessment System

* Create custom assessments per job
* Multiple question types:
  * Single choice
  * Multiple choice
  * Text responses
* Real-time assessment preview
* Track and review responses

### Data Persistence

* Offline-first architecture
* Local data storage using IndexedDB
* No backend required

## Contributing

To contribute to TalentFlow:

1. Fork the repository

1. Create a new branch

```bash
git checkout -b feature/AmazingFeature
```

1. Commit your changes

```bash
git commit -m 'Add some AmazingFeature'
```

1. Push to your branch

```bash
git push origin feature/AmazingFeature
```

1. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
