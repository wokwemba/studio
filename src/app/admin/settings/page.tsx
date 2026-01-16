
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';


function TenantSettings() {
  return (
    <div className="space-y-6">
      {/* Branding & Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Branding & Customization</CardTitle>
          <CardDescription>Customize the look and feel of the platform for your users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <img src="https://picsum.photos/seed/logo/40/40" alt="logo" className="h-10 w-10 rounded-md" data-ai-hint="logo placeholder" />
            <Input id="logo" type="file" className="max-w-xs" />
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Logo</Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <Input id="primaryColor" type="color" defaultValue="#24305E" className="w-12 h-10 p-1" />
              <Input defaultValue="#24305E" className="max-w-xs font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Custom Welcome Message</Label>
            <Input id="welcomeMessage" placeholder="Welcome to our security training!" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="supportContact">Custom Support Contact</Label>
            <Input id="supportContact" placeholder="e.g., security-help@mycompany.com" />
          </div>
        </CardContent>
      </Card>

      {/* User & Access Management */}
      <Card>
        <CardHeader>
          <CardTitle>User & Access Management</CardTitle>
          <CardDescription>Control how users are managed and what they can do.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="defaultRole">Default User Role</Label>
            <Select defaultValue="user">
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
                  <div className="flex items-center space-x-2"><Switch id="auth-password" defaultChecked /><Label htmlFor="auth-password">Email & Password</Label></div>
                  <div className="flex items-center space-x-2"><Switch id="auth-google" defaultChecked /><Label htmlFor="auth-google">Google</Label></div>
                   <div className="flex items-center space-x-2"><Switch id="auth-sso" /><Label htmlFor="auth-sso">Single Sign-On (SSO)</Label></div>
              </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Idle Session Timeout (minutes)</Label>
            <Input id="sessionTimeout" type="number" defaultValue="30" className="max-w-xs" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                  <Label>Allow Self-Registration</Label>
                  <p className="text-xs text-muted-foreground">Allow users to sign up using your company's email domain.</p>
              </div>
              <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
      
       {/* Training & Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Training & Campaign Settings</CardTitle>
          <CardDescription>Set rules and defaults for training content and campaigns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaignDuration">Default Campaign Duration (weeks)</Label>
            <Input id="campaignDuration" type="number" defaultValue="4" className="max-w-xs" />
          </div>
           <div className="space-y-2">
             <Label htmlFor="mandatoryModules">Mandatory Training Modules</Label>
             <p className="text-xs text-muted-foreground">Force completion of these modules for all new users.</p>
             <Select>
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
            <Input id="passingScore" type="number" defaultValue="80" className="max-w-xs" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certValidity">Certificate Validity Period (months)</Label>
            <Input id="certValidity" type="number" defaultValue="12" className="max-w-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
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
                <Switch />
            </div>
            <div className="space-y-2">
                <Label>Password Policy</Label>
                <div className="flex items-center gap-4">
                    <Input type="number" defaultValue="8" className="w-32" placeholder="Min length" />
                    <div className="flex items-center space-x-2"><Switch id="policy-uppercase" defaultChecked /><Label htmlFor="policy-uppercase">Uppercase</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="policy-number" defaultChecked /><Label htmlFor="policy-number">Number</Label></div>
                     <div className="flex items-center space-x-2"><Switch id="policy-special" defaultChecked /><Label htmlFor="policy-special">Special Character</Label></div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelisting</Label>
                <p className="text-xs text-muted-foreground">List IP addresses or CIDR ranges allowed to log in. One per line.</p>
                <Textarea id="ipWhitelist" placeholder="e.g., 203.0.113.5&#10;198.51.100.0/24" className="min-h-[100px] font-mono" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="retentionPolicy">Data Retention Policy (days)</Label>
                <Input id="retentionPolicy" type="number" defaultValue="365" className="max-w-xs" />
            </div>
        </CardContent>
      </Card>
      
        {/* Notifications */}
      <Card>
          <CardHeader>
            <CardTitle>Notifications & Communication</CardTitle>
            <CardDescription>Manage how the platform communicates with your users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="reminderCadence">Overdue Training Reminder Cadence (days before)</Label>
                  <Input id="reminderCadence" placeholder="e.g., 7, 3, 1" defaultValue="7, 3, 1" className="max-w-xs" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="emailFooter">Custom Email Footer</Label>
                  <Textarea id="emailFooter" placeholder="e.g., © My Company Inc. All rights reserved." />
              </div>
          </CardContent>
      </Card>

      {/* Data & Reporting */}
      <Card>
          <CardHeader>
            <CardTitle>Data & Reporting</CardTitle>
            <CardDescription>Control how data is handled and reported.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Report Generation</Label>
                <Select defaultValue="monthly">
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
                  <Switch />
              </div>
          </CardContent>
      </Card>

       <div className="flex justify-end pt-4">
            <Button>Save All Changes</Button>
       </div>

    </div>
  );
}


export default function AdminSettingsPage() {
  return (
    <Tabs defaultValue="general">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="tenant">Tenant</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure global platform settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>General system settings interface will be here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tenant">
        <TenantSettings />
      </TabsContent>
      <TabsContent value="integrations">
         <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect with third-party services like Slack, Jira, or your SIEM.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Integrations management interface will be here.</p>
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="billing">
         <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>Manage your subscription, view invoices, and update payment methods.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Billing management interface will be here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
