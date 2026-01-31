# Direct Checkout Test Suite

This directory contains comprehensive tests for the "Mua ngay" (Buy Now) direct checkout feature.

## Overview

The direct checkout flow allows users to purchase a single product without adding it to their cart. This bypasses the traditional cart workflow and creates orders directly from a product variant.

## Test Files

### Frontend Tests

1. **`direct-checkout.test.ts`** - Unit and integration tests
   - ProductCard "Mua ngay" button logic
   - Checkout page direct mode detection
   - API call validation
   - Order placement logic
   - Edge cases and validation

2. **`e2e-direct-checkout.test.ts`** - End-to-end tests
   - Complete purchase journey
   - API endpoint validation
   - Query parameter handling
   - Error scenarios
   - Performance tests

### Backend Tests

3. **`../../../backend/src/orders/__tests__/direct-order.service.spec.ts`**
   - OrdersService.createDirectOrder()
   - Variant lookup (UUID vs slug)
   - Stock validation
   - Price calculation
   - Order status logic

## Running Tests

### Frontend Tests

```bash
# Run all tests
cd shopin-frontend
npm test

# Run specific test file
npm test direct-checkout.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Backend Tests

```bash
# Run all tests
cd shopin-backend
npm test

# Run specific test suite
npm test -- direct-order.service.spec

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Test Coverage

### Frontend Coverage Goals
- [ ] ProductCard component: >80%
- [ ] NewCheckoutClient component: >75%
- [ ] API functions (createDirectOrder): 100%
- [ ] Query param parsing: 100%

### Backend Coverage Goals
- [ ] OrdersService.createDirectOrder: >85%
- [ ] ProductsService.findVariant: >90%
- [ ] DTO validation: 100%

## Manual Testing

### Test URL
```
http://localhost:3001/checkout?direct=true&variantId=68c05a1e-ed24-431e-a70d-ef14fb16dc4b&qty=1
```

### Test Scenarios

#### Happy Path
1. Browse to homepage
2. Click "Mua ngay" on any product
3. Verify redirect to checkout with query params
4. Verify product details display correctly
5. Select address and payment method
6. Place order
7. Verify success page and order confirmation

#### Error Cases
1. **No variant available**
   - Product without variants
   - Expected: Error toast "Sản phẩm chưa có phiên bản để mua"

2. **Variant not found**
   - Invalid variant ID in URL
   - Expected: Error toast "Không tìm thấy sản phẩm"

3. **Not authenticated**
   - Click "Mua ngay" without login
   - Expected: Redirect to `/?login=true`

4. **Out of stock**
   - Variant with qty = 0
   - Expected: Backend returns 400 "Only 0 items available in stock"

5. **No address**
   - Try to place order without address
   - Expected: Error toast "Vui lòng chọn địa chỉ nhận hàng"

## API Endpoints Tested

### GET /api/products/variants/:variantId
- Accepts both UUID and slug
- Returns variant with full product details
- Returns 404 if not found

### POST /api/orders/direct
- Creates order from single variant
- Validates stock availability
- Calculates shipping fee (free if >= 500k VND)
- Sets status: 'confirmed' for COD, 'pending' for card
- Returns complete order with items

## Test Data Requirements

### Database Setup
Ensure test database has:
- At least 1 active product with variants
- At least 1 test user account
- At least 1 delivery address for test user
- Variants with various stock levels (0, low, high)

### Environment Variables
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Test-specific (optional)
TEST_AUTH_TOKEN=your_test_jwt_token
TEST_VARIANT_ID=68c05a1e-ed24-431e-a70d-ef14fb16dc4b
TEST_USER_ID=test-user-123
```

## Debugging Failed Tests

### Frontend Test Failures

1. **"Variant not found" error**
   - Check if variant exists in database
   - Verify variant slug matches database
   - Check backend logs for actual error

2. **API call failures**
   - Verify backend is running
   - Check API_BASE_URL is correct
   - Review network tab in browser dev tools

3. **Component render errors**
   - Clear Next.js cache: `rm -rf .next`
   - Restart dev server
   - Check React version compatibility

### Backend Test Failures

1. **Supabase connection errors**
   - Verify .env variables
   - Check Supabase service is online
   - Test connection with Supabase client

2. **DTO validation errors**
   - Check class-validator version
   - Verify DTO decorators are correct
   - Enable NestJS validation pipes

3. **Mock data issues**
   - Review mock setup in beforeEach
   - Ensure mocks match actual response structure
   - Check for async/await issues

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Direct Checkout Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run frontend tests
        run: cd shopin-frontend && npm test
      
      - name: Run backend tests
        run: cd shopin-backend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Performance Benchmarks

### Target Response Times
- GET /products/variants/:id: < 200ms
- POST /orders/direct: < 500ms
- Frontend page load: < 1s
- Full checkout flow: < 3s

## Common Issues & Solutions

### Issue: "Property 'slug' does not exist on type 'ProductVariant'"
**Solution:** Update `src/types/database.ts` to include `slug` field

### Issue: Backend returns 404 for valid variant UUID
**Solution:** 
1. Check if variant exists: `SELECT * FROM product_variants WHERE id = '...'`
2. Verify is_active = true (or remove filter)
3. Check database schema has 'slug' column

### Issue: ProductCard passes product ID instead of variant ID
**Solution:** Ensure `variantSlug={product.default_variant?.slug || product.default_variant?.id}`

## Additional Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

## Contributing

When adding new features to direct checkout:
1. Write tests first (TDD)
2. Ensure >80% coverage for new code
3. Run full test suite before committing
4. Update this README with new test scenarios
5. Document any new test data requirements
