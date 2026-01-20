
// This file contains static IDs for roles that are expected to exist in the Firestore database.
// This structure is based on an enterprise-grade, tiered RBAC model.

// Tier 0 – Identity & Security (Highest Privilege)
export const ROLE_DOMAIN_ADMIN = 'DOMAIN_ADMIN';
export const ROLE_SECURITY_ADMIN = 'SECURITY_ADMIN';
export const ROLE_AUDITOR = 'AUDITOR';

// Tier 1 – Platform & Engineering
export const ROLE_PLATFORM_ADMIN = 'PLATFORM_ADMIN';
export const ROLE_DEVOPS_ENGINEER = 'DEVOPS_ENGINEER';
export const ROLE_APPLICATION_DEVELOPER = 'APPLICATION_DEVELOPER';

// Tier 2 – Tenant & Partner Management
export const ROLE_TENANT_ADMIN = 'TENANT_ADMIN';
export const ROLE_PARTNER_ADMIN = 'PARTNER_ADMIN';
export const ROLE_SUPPORT_ADMIN = 'SUPPORT_ADMIN';

// Tier 3 – Business & End Users
export const ROLE_CLIENT_USER = 'CLIENT_USER';
export const ROLE_READ_ONLY_USER = 'READ_ONLY_USER';
export const ROLE_ANONYMOUS = 'ANONYMOUS';


// For display and selection in the UI
export const ALL_ROLES = [
  // Tier 0
  { id: ROLE_DOMAIN_ADMIN, name: 'Domain Administrator', tier: 0, description: 'Full identity, security, and system control.' },
  { id: ROLE_SECURITY_ADMIN, name: 'Security Administrator', tier: 0, description: 'IAM, RBAC, security rules, auditing.' },
  { id: ROLE_AUDITOR, name: 'Auditor', tier: 0, description: 'Read-only access to logs, configs, and compliance.' },
  // Tier 1
  { id: ROLE_PLATFORM_ADMIN, name: 'Platform Administrator', tier: 1, description: 'Platform configuration, environments.' },
  { id: ROLE_DEVOPS_ENGINEER, name: 'DevOps Engineer', tier: 1, description: 'CI/CD, deployments, infra pipelines.' },
  { id: ROLE_APPLICATION_DEVELOPER, name: 'Application Developer', tier: 1, description: 'App-level configuration & debugging.' },
  // Tier 2
  { id: ROLE_TENANT_ADMIN, name: 'Tenant Administrator', tier: 2, description: 'Tenant-wide admin.' },
  { id: ROLE_PARTNER_ADMIN, name: 'Partner Administrator', tier: 2, description: 'Partner onboarding & management.' },
  { id: ROLE_SUPPORT_ADMIN, name: 'Support Administrator', tier: 2, description: 'Customer support & troubleshooting.' },
  // Tier 3
  { id: ROLE_CLIENT_USER, name: 'Client User', tier: 3, description: 'Standard end user.' },
  { id: ROLE_READ_ONLY_USER, name: 'Read-Only User', tier: 3, description: 'Reports & dashboards only.' },
  { id: ROLE_ANONYMOUS, name: 'Anonymous', tier: 3, description: 'Unauthenticated / guest access.' },
];

  