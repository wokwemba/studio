
export const PERMISSIONS = [
  // Admin permissions
  'admin:dashboard:read',
  
  // User management
  'admin:users:read',
  'admin:users:create',
  'admin:users:update',
  'admin:users:delete',
  'admin:users:impersonate',

  // Role & Permission Management
  'admin:rbac:read',
  'admin:rbac:update',

  // Tenant management
  'admin:tenants:read',
  'admin:tenants:create',
  'admin:tenants:update',
  
  // Content management
  'admin:content:read',
  'admin:content:create',
  'admin:content:update',
  'admin:content:delete',
  
  // Campaign management
  'admin:campaigns:read',
  'admin:campaigns:create',
  'admin:campaigns:update',
  'admin:campaigns:delete',
  
  // Audit log permissions
  'admin:audit:read',
  'admin:audit:export',

  // User-facing permissions
  'user:training:read',
  'user:simulations:create',
  'user:profile:read',
];
