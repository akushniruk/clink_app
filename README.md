# Clink

- **Instant**: Scan QR code → Enter amount → Done (3 seconds)
- **Familiar**: Feels like any other app - no crypto knowledge needed
- **Universal**: Works everywhere - no special hardware required

### Key Features

- **QR Code Payments**: Instant peer-to-peer transactions
- **Web2 Experience**: Login with email/Google - no blockchain complexity
- **PWA Technology**: Native app feel without app store friction
- **Multi-Language**: English, Ukrainian, and French support
- **Real-Time Updates**: Live balance and transaction history

## How It Works

### For Customers

1. **Download & Login**: Email or Google signup (30 seconds)
2. **Get Free Drink**: Complete onboarding story for welcome bonus
3. **Top Up**: Add funds via cashier or direct transfer
4. **Pay Instantly**: Scan QR codes at any participating venue
5. **Track Everything**: Real-time balance and transaction history

### For Venues

1. **Quick Setup**: Generate QR codes for staff members
2. **Instant Payments**: Customers scan and pay directly
3. **No Hardware**: Works with any smartphone or tablet

### Clink uses blockchain technology under the hood but CUSTOMERS **_NEVER SEE IT_**:

- "Create Account" instead of "Connect Wallet"
- "Account ID" instead of "Wallet Address"
- "Confirm Payment" instead of "Sign Transaction"
- Zero crypto terminology - just familiar app experiences

## Current Status

**Live in Production**: Currently deployed and processing real transactions\
**Multi-Language Ready**: English, Ukrainian, and French support\
**Mobile Optimized**: <50KB core bundle, loads in under 2 seconds on 3G\

## 🛠️ Development Setup

### Quick Start

```bash
# Clone the repository
git clone https://github.com/layer-3/clink.git
cd clink

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements
│   ├── user/           # User-specific components
│   ├── web3/           # Web3 integration
│   └── onboarding/     # Onboarding flow
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization
├── services/           # API and external services
├── utils/              # Utility functions
└── store/              # State management
```

## 🔗 Links

- **Production**: [clink.app](https://clink.app)
