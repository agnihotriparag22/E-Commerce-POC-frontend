# E-Shop-Frontend

A modern e-commerce frontend application built with Next.js.

## Prerequisites

Before running this project, make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

## Getting Started

Follow these steps to get the project running on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/YASH-Prakhar/E-Shop-Frontend.git
cd E-Shop-Frontend
```

### 2. Install pnpm (if not already installed)

This project uses pnpm as the package manager. If you don't have pnpm installed, install it globally:

```bash
npm install -g pnpm
```

Or using other methods:
```bash
# Using Homebrew (macOS)
brew install pnpm

# Using Chocolatey (Windows)
choco install pnpm

# Using curl (Linux/macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Build the Project

```bash
pnpm build
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `pnpm install` - Install project dependencies
- `pnpm build` - Build the application for production
- `npm run dev` - Start the development server
- `npm run start` - Start the production server (after build)
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
E-Shop-Frontend/
├── components/     # React components
├── pages/         # Next.js pages
├── public/        # Static assets
├── styles/        # CSS/styling files
├── utils/         # Utility functions
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
