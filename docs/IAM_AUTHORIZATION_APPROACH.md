# IAM Authorization Approach for Public Portfolio Access

## Problem Solved

Previously, the portfolio used API Key authorization for public access, which caused:
- **401 Unauthorized errors** after 30 days when API keys expired
- **Manual key rotation** required every 30-365 days
- **Not designed for production** public access (AWS docs state API keys are for development)

## Solution: IAM with Identity Pool

### Why IAM is Correct

Based on AWS AppSync documentation:

1. **Designed for Public Access**: IAM supports unauthenticated users through Cognito Identity Pools
2. **No Expiration Issues**: Temporary credentials auto-refresh behind the scenes
3. **Production Ready**: Follows AWS security best practices
4. **Cost Effective**: No API key limits or throttling concerns

### Implementation

#### 1. Data Schema Changes
```typescript
// amplify/data/resource.ts
.authorization((allow) => [
  allow.guest().to(['read']),                    // Public read access
  allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])  // Admin full access
])

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',  // Changed from 'apiKey'
  },
});
```

#### 2. Client Code Changes
```typescript
// Public components (non-admin)
const authMode = isAuthenticated ? 'userPool' : 'identityPool';  // Changed from 'apiKey'

const { data } = await client.models.Projects.list({
  authMode,
  // ... other options
});
```

#### 3. Admin Components (No Changes)
```typescript
// Admin components continue using userPool
const { data } = await client.models.Projects.list({
  authMode: 'userPool',
  // ... other options
});
```

### How It Works

1. **Public Users**: 
   - Get temporary AWS credentials via Cognito Identity Pool
   - Credentials automatically refresh
   - Access portfolio data with `allow.guest()` permissions

2. **Admin Users**:
   - Authenticate via Cognito User Pool
   - Get elevated permissions via `allow.group('ADMINS')`
   - Can create, update, delete content

### Benefits

- ✅ **No more 401 errors** from expired API keys
- ✅ **Zero maintenance** - no manual key rotation
- ✅ **AWS best practices** - proper authorization model
- ✅ **Scalable** - handles any traffic volume
- ✅ **Secure** - fine-grained permissions per resource

### Deployment

After making these changes:

1. Deploy to Amplify: `git push origin main`
2. Amplify will automatically:
   - Create/update Cognito Identity Pool
   - Configure IAM roles for guest access
   - Update AppSync authorization

### Verification

Test public access:
```bash
# Should work without authentication
curl -X POST https://your-appsync-endpoint/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { listProjects { items { title } } }"}'
```

### Key Learnings

- **API Keys** = Development/testing only (30-365 day expiration)
- **IAM Identity Pool** = Production public access (auto-refreshing credentials)
- **Cognito User Pool** = Authenticated user operations

This approach eliminates the "30-day problem" and provides a robust, scalable solution for public portfolio access.
