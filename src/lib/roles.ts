
// This file contains static IDs for roles that are expected to exist in the Firestore database.
// This structure is based on an enterprise-grade, tiered RBAC model.

// Tier 0 – Identity & Security (Highest Privilege)
export const ROLE_DOMAIN_ADMIN = 'DOMAIN_ADMIN';
export const ROLE_SECURITY_ADMIN = 'SECURITY_ADMIN';
export const ROLE_AUDITOR = 'AUDITOR';

// Tier 1 - Engineering & Support
export const ROLE_DEVOPS_ENGINEER = 'DEVOPS_ENGINEER';
export const ROLE_APPLICATION_DEVELOPER = 'APPLICATION_DEVELOPER';
export const ROLE_SUPPORT_ADMIN = 'SUPPORT_ADMIN';

// Tier 2 – Tenant & Partner Management
export const ROLE_TENANT_ADMIN = 'TENANT_ADMIN';
export const ROLE_PARTNER_ADMIN = 'PARTNER_ADMIN';

// Tier 3 – Business & End Users
export const ROLE_CLIENT_USER = 'CLIENT_USER';
export const ROLE_READ_ONLY_USER = 'READ_ONLY_USER';
export const ROLE_ANONYMOUS = 'ANONYMOUS';


// For display and selection in the UI
export const ALL_ROLES = [
  // Tier 0
  { id: ROLE_DOMAIN_ADMIN, name: 'Domain Administrator', tier: 0, description: 'Full super admin, can list/update all users.' },
  { id: ROLE_SECURITY_ADMIN, name: 'Security Administrator', tier: 0, description: 'Security-focused super admin.' },
  
  // Tier 1
  { id: ROLE_DEVOPS_ENGINEER, name: 'DevOps Engineer', tier: 1, description: 'Access to deploy/manage services.' },
  { id: ROLE_APPLICATION_DEVELOPER, name: 'Application Developer', tier: 1, description: 'Access to code, dev environment.' },
  { id: ROLE_SUPPORT_ADMIN, name: 'Support Administrator', tier: 1, description: 'Handles support tickets.' },
  
  // Tier 2
  { id: ROLE_TENANT_ADMIN, name: 'Tenant Administrator', tier: 2, description: 'Can manage users in their tenant.' },
  { id: ROLE_PARTNER_ADMIN, name: 'Partner Administrator', tier: 2, description: 'Manages partner clients.' },

  // Tier 3
  { id: ROLE_CLIENT_USER, name: 'Client User', tier: 3, description: 'Standard user.' },
  { id: ROLE_READ_ONLY_USER, name: 'Read-Only User', tier: 3, description: 'Limited read-only access.' },
  { id: ROLE_ANONYMOUS, name: 'Anonymous', tier: 3, description: 'Minimal system access.' },

  // Read-Only Roles
  { id: ROLE_AUDITOR, name: 'Auditor', tier: 4, description: 'Read-only access to audit logs.' },
];
