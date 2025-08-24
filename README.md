# Clanker-Dex 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=vercel)](https://dashboard-five-flame-35.vercel.app/)

A modern decentralized exchange (DEX) dashboard built for trading Clanker tokens on Uniswap V4. This application provides a comprehensive trading interface with real-time quotes, portfolio management, and seamless token swapping capabilities.

## 🌐 Live Demo

**[Visit Clanker-Dex →](https://dashboard-five-flame-35.vercel.app/)**

**[📹 Watch Demo Video →](https://drive.google.com/file/d/1E-cH3joFYbpkW3ur6-BasWAFhYbbLSo4/view?usp=drive_link)**

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Development](#development)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [Trading Integration](#-trading-integration)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

- **Real-time Token Trading**: Seamless buying/selling of Clanker tokens via Uniswap V4
- **Dynamic Pool Resolution**: Automatically resolves pool configurations from Clanker API
- **Portfolio Management**: Track your token holdings and performance
- **Trading Modal**: Intuitive interface for executing swaps with slippage control
- **Token Discovery**: Browse and search available Clanker tokens
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Real-time Quotes**: Live price feeds and trading quotes
- **Wallet Integration**: Connect with popular Ethereum wallets via RainbowKit
- **Chat Interface**: Integrated chat functionality for community interaction

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom animations
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with Zod validation

### Blockchain Integration
- **Wallet Connection**: [RainbowKit](https://www.rainbowkit.com/) + [Wagmi](https://wagmi.sh/)
- **DEX Integration**: [Uniswap V4 SDK](https://docs.uniswap.org/sdk/v4/overview)
- **Token SDK**: [Clanker SDK](https://github.com/clanker-dev/clanker-sdk)
- **Ethereum Client**: [Viem](https://viem.sh/)

### Development Tools
- **Package Manager**: [PNPM](https://pnpm.io/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: Tailwind CSS
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **PNPM** (recommended) or npm/yarn
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ansh1902396/Clanker-Dex.git
   cd Clanker-Dex
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

### Environment Setup

Create a `.env.local` file in the root directory:

```env

# Optional Environment Variables
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_CLANKER_API_BASE_URL=https://api.clanker.world
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
dashboard/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── quote/           # Token quote endpoints
│   │   └── tokens/          # Token data endpoints
│   ├── create-token/        # Token creation page
│   ├── liquidity/           # Liquidity management
│   ├── portfolio/           # Portfolio dashboard
│   ├── settings/            # User settings
│   ├── trading-pairs/       # Trading pairs overview
│   └── page.tsx             # Main dashboard
├── components/              # Reusable UI components
│   ├── chat/               # Chat interface components
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── card/          # Data display cards
│   │   ├── chart/         # Chart components
│   │   ├── layout/        # Layout components
│   │   ├── trading-modal.tsx  # Main trading interface
│   │   └── token-list.tsx # Token listing component
│   ├── icons/             # Custom icon components
│   ├── providers/         # Context providers
│   └── ui/                # Base UI components (shadcn/ui)
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
│   ├── use-clanker-quote.ts  # Clanker price quotes
│   ├── use-trading.ts     # Trading logic
│   └── use-wallet.ts      # Wallet connection
├── lib/                   # Utility libraries
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── wagmi.ts           # Wagmi configuration
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🔑 Key Components

### TradingModal (`components/dashboard/trading-modal.tsx`)
The main trading interface component that handles:
- Token selection and swapping
- Amount input with balance validation
- Slippage tolerance settings
- Trade execution with real-time quotes

### TokenList (`components/dashboard/token-list.tsx`)
Displays available tokens with:
- Search and filtering capabilities
- Real-time price data
- Market cap and volume information
- Quick trade actions

### Dashboard Layout (`components/dashboard/layout/`)
Responsive layout system including:
- Sidebar navigation
- Mobile-optimized header
- Notification system
- Wallet connection status

## 🔄 Trading Integration

### SOULB Token Integration
The application includes special handling for SOULB and other Clanker tokens:

- **Dynamic Pool Resolution**: Automatically resolves Uniswap V4 pool configurations
- **WETH Pairing**: Uses WETH for pool operations while displaying ETH in the UI
- **Static Fee Handling**: Properly handles Clanker's static fee mechanism
- **Real-time Quotes**: Live price feeds from Clanker API

### Uniswap V4 Integration
- **Universal Router**: Uses Uniswap's Universal Router for optimal routing
- **Pool Key Resolution**: Dynamic pool key generation based on token configuration
- **Slippage Protection**: Configurable slippage tolerance for trades
- **Gas Optimization**: Efficient gas usage through optimized swap paths

## 📚 API Documentation

### Internal APIs

#### `/api/quote`
Get trading quotes for token pairs
```typescript
GET /api/quote?sellToken=ETH&buyToken=SOULB&sellAmount=0.1
```

#### `/api/tokens`
Retrieve available tokens and their metadata
```typescript
GET /api/tokens?search=SOULB&limit=10
```

### External Integrations

- **Clanker API**: Token data and pool configurations
- **Uniswap V4**: Price quotes and swap execution
- **Ethereum RPC**: Blockchain data and transaction broadcasting

## ⚙️ Configuration

### Wagmi Configuration (`lib/wagmi.ts`)
- Wallet connector setup
- Supported chains configuration
- RPC provider configuration

### Theme Configuration (`components/theme-provider.tsx`)
- Dark/light theme switching
- System theme detection
- Persistent theme preferences

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use consistent naming conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📜 Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Testing
pnpm test         # Run test suite (when available)

# Utilities
pnpm clean        # Clean build artifacts
pnpm type-check   # Run TypeScript type checking
```

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
pnpm build
pnpm start
```

### Environment Variables for Production
Ensure all required environment variables are set in your production environment:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
- `NEXT_PUBLIC_ALCHEMY_API_KEY`

## 🔧 Troubleshooting

### Common Issues

#### Wallet Connection Issues
- Ensure WalletConnect Project ID is correctly configured
- Check that the user's wallet is connected to the correct network

#### Trading Errors
- Verify token addresses are correct
- Check that sufficient balance is available
- Ensure slippage tolerance is appropriate for market conditions

#### Build Issues
- Clear node_modules and reinstall dependencies
- Check TypeScript errors with `pnpm type-check`
- Verify all required environment variables are set

### Debug Tools

The project includes several debug utilities:
- `debug-pool-key.ts` - Debug Uniswap pool configurations
- `check-pool-state.ts` - Verify pool states and liquidity
- `find-actual-soulb-pool.ts` - Locate SOULB token pools

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Uniswap Labs](https://uniswap.org/) for the V4 SDK
- [Clanker Team](https://clanker.world/) for the Clanker SDK
- [Radix UI](https://www.radix-ui.com/) for the component primitives
- [Vercel](https://vercel.com/) for deployment platform

---

**Built with ❤️ by the Clanker-Dex team**

For questions or support, please open an issue on GitHub or reach out to the development team.
