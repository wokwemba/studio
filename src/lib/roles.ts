// This file contains static IDs for roles that are expected to exist in the Firestore database.
// In a real production environment, these roles would be seeded into the 'roles' collection.

export const ROLES = {
  SUPER_ADMIN: 'L1A4b6Y2y1l9p3R0c2V1',
  ADMIN: 'S2V1b2l1R1dsa2FqZGZtYWxza2Rq',
  TENANT_ADMIN: 'T3N4bW50QWRtaW5VaiBva21hbA',
  PARTNER_ADMIN: 'P4N0bmVyQWRtaW5Vc2VyS2V5Tm93',
  DEVELOPER: 'D5VlbG9wZXJVc2VyUm9sZUZvclU',
  CLIENT: 'C5JpZW50VXNlclJvbGVGb3JVc2Vy',
  USER: 'b3VpYWtqZHNmbGtqYWVybGtqYWxp',
  ANONYMOUS: 'A5b255bW91c1VzZXJSb2xlS2V5',
};

// For display and selection in the UI
export const ALL_ROLES = [
    { id: ROLES.SUPER_ADMIN, name: 'SuperAdmin' },
    { id: ROLES.ADMIN, name: 'Admin' },
    { id: ROLES.TENANT_ADMIN, name: 'Tenant Admin' },
    { id: ROLES.PARTNER_ADMIN, name: 'Partner Admin' },
    { id: ROLES.DEVELOPER, name: 'Developer' },
    { id: ROLES.CLIENT, name: 'Client' },
    { id: ROLES.USER, name: 'User' },
    { id: ROLES.ANONYMOUS, name: 'Anonymous' },
];
