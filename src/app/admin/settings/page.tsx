'use client';
import { useState, useMemo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, KeyRound, Webhook, Sparkles, Trash2, Loader, User, Shield, Palette, Bell, Users as UsersIcon, CreditCard, Download, Settings } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Tenant as TenantType } from '@/app/admin/tenants/page';
import { cn } from '@/lib/utils';

// ... (Keep all the individual settings components as they were)
function BrandingSettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Branding & Customization</CardTitle>
                <CardDescription>Customize the look and feel of the platform for your users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <img src={tenantData?.settings?.branding?.logoUrl || "https://picsum.photos/seed/logo/40/40"} alt="logo" className="h-10 w-10 rounded-md" data-ai-hint="logo placeholder" />
                    <Input id="logo" type="file" className="max-w-xs" disabled={settingsDisabled} />
                    <Button variant="outline" disabled={settingsDisabled}><Upload className="mr-2 h-4 w-4" /> Upload Logo</Button>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                        <Input id="primaryColor" type="color" defaultValue={tenantData?.settings?.branding?.primaryColor || "#24305E"} className="w-12 h-10 p-1" disabled={settingsDisabled} />
                        <Input defaultValue={tenantData?.settings?.branding?.primaryColor || "#24305E"} className="max-w-xs font-mono" disabled={settingsDisabled} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Custom Welcome Message</Label>
                    <Input id="welcomeMessage" placeholder="Welcome to our security training!" defaultValue={tenantData?.contact?.welcomeMessage} disabled={settingsDisabled} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="supportContact">Custom Support Contact</Label>
                    <Input id="supportContact" placeholder="e.g., security-help@mycompany.com" defaultValue={tenantData?.contact?.adminEmail} disabled={settingsDisabled} />
                </div>
            </CardContent>
        </Card>
    );
}
// ... and so on for all other settings cards: UserAccessSettings, TrainingSettings, SecuritySettings, etc.
function UserAccessSettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
     return (
        <Card>
            <CardHeader>
            <CardTitle>User & Access Management</CardTitle>
            <CardDescription>Control how users are managed and what they can do.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="defaultRole">Default User Role</Label>
                <Select defaultValue={tenantData?.settings?.defaultRole || "user"} disabled={settingsDisabled}>
                <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select a default role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="department_admin">Department Admin</SelectItem>
                    <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Allowed Authentication Methods</Label>
                <div className="flex flex-col space-y-2 pt-2">
                    <div className="flex items-center space-x-2"><Switch id="auth-password" defaultChecked={tenantData?.settings?.authMethods?.password ?? true} disabled={settingsDisabled} /><Label htmlFor="auth-password">Email & Password</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="auth-google" defaultChecked={tenantData?.settings?.authMethods?.google ?? true} disabled={settingsDisabled} /><Label htmlFor="auth-google">Google</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="auth-sso" defaultChecked={tenantData?.settings?.authMethods?.sso ?? false} disabled={settingsDisabled} /><Label htmlFor="auth-sso">Single Sign-On (SSO)</Label></div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Idle Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue={tenantData?.settings?.security?.sessionTimeout || "30"} className="max-w-xs" disabled={settingsDisabled} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label>Allow Self-Registration</Label>
                    <p className="text-xs text-muted-foreground">Allow users to sign up using your company's email domain.</p>
                </div>
                <Switch defaultChecked={tenantData?.settings?.allowSelfRegistration ?? true} disabled={settingsDisabled} />
            </div>
            </CardContent>
        </Card>
     )
}
function TrainingSettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Training & Campaign Settings</CardTitle>
                <CardDescription>Set rules and defaults for training content and campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="campaignDuration">Default Campaign Duration (weeks)</Label>
                <Input id="campaignDuration" type="number" defaultValue={tenantData?.settings?.training?.defaultCampaignDuration || "4"} className="max-w-xs" disabled={settingsDisabled} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="mandatoryModules">Mandatory Training Modules</Label>
                <p className="text-xs text-muted-foreground">Force completion of these modules for all new users.</p>
                <Select disabled={settingsDisabled}>
                    <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="Select modules..." />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Items would be populated from a collection */}
                        <SelectItem value="m1">Phishing 101</SelectItem>
                        <SelectItem value="m2">Password Security</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="passingScore">Quiz Passing Score (%)</Label>
                <Input id="passingScore" type="number" defaultValue={tenantData?.settings?.training?.passingScore || "80"} className="max-w-xs" disabled={settingsDisabled} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="certValidity">Certificate Validity Period (months)</Label>
                <Input id="certValidity" type="number" defaultValue={tenantData?.settings?.training?.certValidity || "12"} className="max-w-xs" disabled={settingsDisabled} />
            </div>
            </CardContent>
        </Card>
    )
}
function SecuritySettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
                <CardDescription>Configure tenant-wide security policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Enforce Multi-Factor Authentication (MFA)</Label>
                        <p className="text-xs text-muted-foreground">Require all users to set up MFA upon their next login.</p>
                    </div>
                    <Switch defaultChecked={tenantData?.settings?.security?.mfaRequired} disabled={settingsDisabled} />
                </div>
                <div className="space-y-2">
                    <Label>Password Policy</Label>
                    <div className="flex items-center gap-4">
                        <Input type="number" defaultValue={tenantData?.settings?.security?.passwordPolicy?.minLength || "8"} className="w-32" placeholder="Min length" disabled={settingsDisabled} />
                        <div className="flex items-center space-x-2"><Switch id="policy-uppercase" defaultChecked={tenantData?.settings?.security?.passwordPolicy?.requireUppercase ?? true} disabled={settingsDisabled} /><Label htmlFor="policy-uppercase">Uppercase</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="policy-number" defaultChecked={tenantData?.settings?.security?.passwordPolicy?.requireNumber ?? true} disabled={settingsDisabled} /><Label htmlFor="policy-number">Number</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="policy-special" defaultChecked={tenantData?.settings?.security?.passwordPolicy?.requireSpecial ?? true} disabled={settingsDisabled} /><Label htmlFor="policy-special">Special Character</Label></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ipWhitelist">IP Whitelisting</Label>
                    <p className="text-xs text-muted-foreground">List IP addresses or CIDR ranges allowed to log in. One per line.</p>
                    <Textarea id="ipWhitelist" placeholder="e.g., 203.0.113.5\n198.51.100.0/24" className="min-h-[100px] font-mono" defaultValue={tenantData?.settings?.security?.ipWhitelist?.join('\n')} disabled={settingsDisabled} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="retentionPolicy">Data Retention Policy (days)</Label>
                    <Input id="retentionPolicy" type="number" defaultValue={tenantData?.settings?.compliance?.retentionPolicy || "365"} className="max-w-xs" disabled={settingsDisabled} />
                </div>
            </CardContent>
        </Card>
    )
}
function NotificationSettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications & Communication</CardTitle>
                <CardDescription>Manage how the platform communicates with your users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="reminderCadence">Overdue Training Reminder Cadence (days before)</Label>
                    <Input id="reminderCadence" placeholder="e.g., 7, 3, 1" defaultValue={tenantData?.settings?.notifications?.reminderCadence?.join(', ') || "7, 3, 1"} className="max-w-xs" disabled={settingsDisabled} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailFooter">Custom Email Footer</Label>
                    <Textarea id="emailFooter" placeholder="e.g., © My Company Inc. All rights reserved." defaultValue={tenantData?.settings?.notifications?.emailFooter} disabled={settingsDisabled} />
                </div>
            </CardContent>
        </Card>
    )
}

function ApiSettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound/>API Access & Webhooks</CardTitle>
                <CardDescription>Manage API keys for programmatic access and configure webhooks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="font-mono text-sm">api-key-....-xxxx</Label>
                        <p className="text-xs text-muted-foreground">Last used: 2 hours ago</p>
                    </div>
                    <Button variant="destructive" size="sm" disabled={settingsDisabled}>Revoke</Button>
                </div>
                <Button variant="outline" disabled={settingsDisabled}>Generate New API Key</Button>
                <Separator />
                <div className="space-y-2">
                    <Label htmlFor="webhookUrl" className="flex items-center gap-2"><Webhook/>Webhook Endpoint URL</Label>
                    <p className="text-xs text-muted-foreground">Send real-time event notifications (e.g., training completion, incident alert) to this URL.</p>
                    <Input id="webhookUrl" placeholder="https://myapp.com/webhook/cyberaegis" defaultValue={tenantData?.settings?.integrations?.webhookUrl} disabled={settingsDisabled} />
                </div>
            </CardContent>
        </Card>
    )
}

function FeatureSettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles/>Feature Management</CardTitle>
                <CardDescription>Enable or disable specific platform features for this tenant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>AI-Powered Tutor</Label>
                        <p className="text-xs text-muted-foreground">Allow users to access the conversational AI tutor for learning.</p>
                    </div>
                    <Switch defaultChecked={tenantData?.settings?.features?.aiTutor ?? true} disabled={settingsDisabled} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Advanced Reporting Beta</Label>
                        <p className="text-xs text-muted-foreground">Enable access to new, experimental reporting dashboards.</p>
                    </div>
                    <Switch defaultChecked={tenantData?.settings?.features?.advancedReporting} disabled={settingsDisabled} />
                </div>
            </CardContent>
        </Card>
    )
}

function DataSettings({ tenantData, settingsDisabled }: { tenantData: any, settingsDisabled: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Data & Reporting</CardTitle>
                <CardDescription>Control how data is handled and reported.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Default Report Generation</Label>
                    <Select defaultValue={tenantData?.settings?.reporting?.schedule || "monthly"} disabled={settingsDisabled}>
                    <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="Select a schedule" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Anonymize User Data in Reports</Label>
                        <p className="text-xs text-muted-foreground">Hide user names in leaderboards and non-admin reports.</p>
                    </div>
                    <Switch defaultChecked={tenantData?.settings?.reporting?.anonymize} disabled={settingsDisabled} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Export Tenant Data</h3>
                            <p className="text-sm text-muted-foreground">Request an export of all user progress and campaign data for this tenant.</p>
                        </div>
                        <Button variant="outline" disabled={settingsDisabled}>Request Export</Button>
                    </div>
            </CardContent>
        </Card>
    )
}

function DeactivationSettings({ settingsDisabled }: { settingsDisabled: boolean }) {
    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><Trash2/>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Deactivate this Tenant</h3>
                        <p className="text-sm text-muted-foreground">This will suspend all users and block access to the platform. This action is reversible.</p>
                    </div>
                    <Button variant="destructive" disabled={settingsDisabled}>Deactivate Tenant</Button>
                </div>
            </CardContent>
        </Card>
    )
}

const settingsNav = [
    { id: 'general', label: 'General', icon: Settings, component: (props: any) => <Card><CardHeader><CardTitle>Platform Settings</CardTitle><CardDescription>Global settings for the entire application.</CardDescription></CardHeader><CardContent><p>Global settings UI will be here.</p></CardContent></Card> },
    { id: 'branding', label: 'Branding', icon: Palette, component: BrandingSettings },
    { id: 'users', label: 'Users & Access', icon: UsersIcon, component: UserAccessSettings },
    { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
    { id: 'api', label: 'API & Webhooks', icon: Webhook, component: ApiSettings },
    { id: 'features', label: 'Feature Flags', icon: Sparkles, component: FeatureSettings },
    { id: 'data', label: 'Data & Reporting', icon: Download, component: DataSettings },
    { id: 'billing', label: 'Billing', icon: CreditCard, component: (props: any) => <Card><CardHeader><CardTitle>Billing & Subscription</CardTitle><CardDescription>Manage your subscription details.</CardDescription></CardHeader><CardContent><p>Billing UI will be here.</p></CardContent></Card>},
    { id: 'deactivation', label: 'Danger Zone', icon: Trash2, component: DeactivationSettings },
]

export default function AdminSettingsPage() {
    const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(undefined);
    const [activeSection, setActiveSection] = useState('general');
    const firestore = useFirestore();

    const tenantsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tenants') : null, [firestore]);
    const { data: tenants, isLoading: tenantsLoading } = useCollection<TenantType>(tenantsQuery);

    const tenantDocRef = useMemoFirebase(() => (firestore && selectedTenantId) ? doc(firestore, 'tenants', selectedTenantId) : null, [firestore, selectedTenantId]);
    const { data: tenantData, isLoading: tenantDataLoading } = useDoc<any>(tenantDocRef);
    
    const settingsDisabled = !selectedTenantId || tenantDataLoading;
    const ActiveComponent = settingsNav.find(nav => nav.id === activeSection)?.component;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Platform & Tenant Settings</CardTitle>
                <CardDescription>Manage global settings or select a tenant to configure their specific settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Label htmlFor="tenant-select">Select a Tenant to Configure</Label>
                <Select onValueChange={(value) => setSelectedTenantId(value)} disabled={tenantsLoading}>
                    <SelectTrigger id="tenant-select" className="max-w-md mt-2">
                        <SelectValue placeholder={tenantsLoading ? "Loading tenants..." : "Select a tenant..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {tenants?.map(tenant => (
                            <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            <nav className="flex flex-col space-y-1">
                {settingsNav.map(nav => (
                    <Button
                        key={nav.id}
                        variant="ghost"
                        className={cn(
                            "justify-start gap-2",
                            activeSection === nav.id && "bg-accent text-accent-foreground",
                            (nav.id !== 'general' && nav.id !== 'billing' && !selectedTenantId) && "text-muted-foreground opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => setActiveSection(nav.id)}
                        disabled={nav.id !== 'general' && nav.id !== 'billing' && !selectedTenantId}
                    >
                       <nav.icon className="h-4 w-4" />
                       {nav.label}
                    </Button>
                ))}
            </nav>
            <div className="space-y-6">
                 {(!selectedTenantId && activeSection !== 'general' && activeSection !== 'billing') ? (
                    <Card>
                        <CardContent className="py-16 text-center text-muted-foreground">
                            Please select a tenant to manage this setting.
                        </CardContent>
                    </Card>
                ) : tenantDataLoading && activeSection !== 'general' && activeSection !== 'billing' ? (
                     <Card>
                        <CardContent className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader className="h-5 w-5 animate-spin" />
                            <span>Loading settings...</span>
                        </CardContent>
                    </Card>
                ) : (
                    ActiveComponent && <ActiveComponent tenantData={tenantData} settingsDisabled={settingsDisabled} />
                )}
                 {activeSection !== 'deactivation' && <div className="flex justify-end pt-4">
                        <Button disabled={settingsDisabled || (activeSection !== 'general' && !selectedTenantId)}>Save Changes for {activeSection}</Button>
                </div>}
            </div>
        </div>
    </div>
  );
}
