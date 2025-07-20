# Vilki Delivery Partner App

A React Native mobile application for delivery partners to manage orders, track deliveries, and view earnings for the Vilki medical delivery platform.

## Features

### 🔐 Authentication
- Delivery partner login with unique ID
- Secure session management
- Auto-login functionality

### 📦 Order Management
- View available orders from wholesalers
- Accept orders based on proximity
- Real-time order status updates
- Detailed order information and customer details
- Order tracking with pickup and delivery locations

### 🗺️ Live Map & Navigation
- Interactive map showing nearby orders
- Real-time location tracking
- Distance calculation and ETA
- Order markers on map

### 💰 Earnings Dashboard
- Monthly earnings overview
- Payment history
- Performance statistics
- Bonus and deduction tracking

### 👤 Profile Management
- Personal information display
- Vehicle details
- Account status
- App settings

## Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation between screens
- **React Native Paper** - Material Design components
- **React Native Vector Icons** - Icon library
- **AsyncStorage** - Local data persistence
- **React Native Maps** - Map integration (for production)

## Prerequisites

- Node.js (>= 18)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vilki
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run the app**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── OrderContext.tsx # Order state management
├── screens/            # App screens
│   ├── LoginScreen.tsx
│   ├── OrdersScreen.tsx
│   ├── OrderDetailsScreen.tsx
│   ├── MapScreen.tsx
│   ├── EarningsScreen.tsx
│   └── ProfileScreen.tsx
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=your_strapi_backend_url
MAPS_API_KEY=your_google_maps_api_key
```

### Strapi Backend Integration
The app is designed to work with a Strapi backend. Configure the following endpoints:

- `POST /api/auth/local` - Partner authentication
- `GET /api/orders` - Fetch available orders
- `PUT /api/orders/:id` - Update order status
- `GET /api/earnings` - Fetch earnings data

## Usage

### For Delivery Partners

1. **Login**: Enter your unique delivery partner ID
2. **View Orders**: Browse available orders in your area
3. **Accept Orders**: Select orders based on proximity and availability
4. **Track Deliveries**: Update order status as you progress
5. **View Earnings**: Monitor your monthly earnings and performance

### Order Status Flow

1. **Accepted** → Order is available for pickup
2. **Assigned** → Order assigned to delivery partner
3. **Picked Up** → Order collected from pickup location
4. **In Transit** → Order is being delivered
5. **Delivered** → Order successfully delivered

## Development

### Adding New Features

1. Create new components in `src/components/`
2. Add new screens in `src/screens/`
3. Update types in `src/types/index.ts`
4. Add API services in `src/services/`

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace vilki.xcworkspace -scheme vilki -configuration Release
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Email: support@vilki.com
- Documentation: [Link to documentation]
- Issues: [GitHub Issues]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native community
- Strapi for the backend framework
- Material Design for UI inspiration
