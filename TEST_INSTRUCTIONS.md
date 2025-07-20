# Vilki Delivery Partner App - Test Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Metro bundler:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Test User IDs

Use any of these test user IDs to login:

| User ID | Name | Location |
|---------|------|----------|
| `DP001` | Rahul Kumar | Connaught Place |
| `DP002` | Priya Sharma | Lajpat Nagar |
| `DP003` | Amit Patel | Dwarka |
| `DP004` | Sneha Gupta | Gurgaon |
| `DP005` | Vikram Singh | Noida |

## Testing Flow

### 1. Login
- Open the app
- Click "Show Test Users" button
- Select any test user ID (e.g., `DP001`)
- Click "Sign In"

### 2. Orders Screen
- View available orders
- Pull to refresh for new orders
- Click "View Details" to see order information
- Click "Accept Order" to assign order to yourself

### 3. Order Details
- View complete order information
- See pickup and delivery addresses
- View order items and total amount
- Update order status (Pick Up → In Transit → Delivered)
- Call customer directly

### 4. Map Screen
- View mock map with nearby orders
- See today's delivery statistics
- View nearby orders list

### 5. Earnings Screen
- View current month earnings
- See payment history
- Check performance statistics

### 6. Profile Screen
- View personal information
- See vehicle details
- Check account status
- Logout functionality

## Features to Test

### ✅ Authentication
- [ ] Login with valid test user ID
- [ ] Login with invalid ID (should show error)
- [ ] Auto-login after app restart
- [ ] Logout functionality

### ✅ Orders Management
- [ ] View available orders
- [ ] Accept orders
- [ ] View order details
- [ ] Update order status
- [ ] Call customer functionality

### ✅ Navigation
- [ ] Bottom tab navigation
- [ ] Stack navigation to order details
- [ ] Back navigation

### ✅ UI/UX
- [ ] Loading states
- [ ] Error handling
- [ ] Pull to refresh
- [ ] Responsive design

### ✅ Data Persistence
- [ ] User session persistence
- [ ] Order data management

## Mock Data

The app uses mock data for:
- User profiles
- Available orders
- Earnings data
- Location data

## Troubleshooting

### Common Issues

1. **Metro bundler not starting:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build issues:**
   ```bash
   cd ios
   pod install
   cd ..
   npm run ios
   ```

3. **Android build issues:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

4. **Dependencies issues:**
   ```bash
   rm -rf node_modules
   npm install
   ```

### Console Logs

Check the console for:
- Login success/failure messages
- Available test user IDs
- Order status updates

## Next Steps

Once testing is complete, you can:

1. **Connect to Strapi Backend:**
   - Update `src/services/api.ts` with your Strapi URL
   - Replace mock data with real API calls

2. **Add Real Maps:**
   - Configure Google Maps API key
   - Replace mock map with real map component

3. **Add Push Notifications:**
   - Configure FCM for order notifications
   - Add real-time order updates

4. **Add Location Services:**
   - Implement real GPS tracking
   - Add geofencing for order proximity

## Support

For any issues during testing:
- Check console logs for error messages
- Verify all dependencies are installed
- Ensure Metro bundler is running
- Try clearing cache and restarting 