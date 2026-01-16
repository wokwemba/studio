
export type FormField = {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file' | 'date' | 'checkbox-group';
    placeholder?: string;
    options?: string[]; // for select dropdown or checkbox-group
  };
  
  export type Simulation = {
    id: string;
    type: string;
    description: string; // A brief description of what the simulation does
    fields: FormField[];
  };

  export const trainingTopics = [
    "Networks and Web Security",
    "Advanced Digital Forensics",
    "Distributed Ledger Technologies",
    "Internet of Things (IoT)",
    "Cloud Computing and Security",
    "Systems and Database Security",
    "Malware Analysis",
    "Risk and Incident Response Management",
    "Information Systems Security and Audit",
    "AI and Cybersecurity",
    "Social Factors in Cybersecurity",
    "Phishing Awareness",
    "Password Security",
    "Two-Factor Authentication (2FA)",
    "Social Engineering",
    "Malware and Ransomware",
    "Secure Browsing Habits",
    "Data Privacy and GDPR",
    "Physical Security",
    "Mobile Device Security",
    "Wi-Fi Security",
    "Cloud Security Basics",
    "Incident Response",
    "Secure Software Development Lifecycle (SSDLC)",
    "SQL Injection",
    "Cross-Site Scripting (XSS)",
    "Network Security Fundamentals",
    "Firewalls and Proxies",
    "Encryption and Cryptography",
    "Business Email Compromise (BEC)",
    "Insider Threats",
    "Acceptable Use Policy",
    "Data Classification",
    "Vendor Risk Management",
    "PCI DSS Compliance",
    "HIPAA Security Rule",
    "Identity and Access Management (IAM)",
    "Threat Modeling",
    "Vulnerability Management",
    "Security Information and Event Management (SIEM)",
    "Digital Forensics Basics",
    "IoT Security",
    "API Security",
    "Container Security (Docker, Kubernetes)",
    "Serverless Security",
    "DevSecOps Principles",
    "Clean Desk Policy",
    "Information Governance",
    "E-commerce Security",
    "Web Application Firewalls (WAF)",
    "Denial-of-Service (DoS/DDoS) Attacks",
    "Man-in-the-Middle (MitM) Attacks",
    "Zero-Day Vulnerabilities",
    "Security Awareness Culture",
    "Penetration Testing Basics",
    "Code Review Best Practices",
    "Secure Configuration Management",
    "Log Management and Analysis",
    "Disaster Recovery and Business Continuity",
    "Social Media Security",
    "Cybersecurity Frameworks (NIST, ISO 27001)",
    "Data Loss Prevention (DLP)",
    "Endpoint Detection and Response (EDR)",
    "Supply Chain Security",
    "Digital Certificates and PKI",
    "Bluetooth Security",
    "Email Security and Spoofing",
    "Secure Coding for Web",
    "Secure Coding for Mobile",
    "File-less Malware",
    "Credential Stuffing",
    "Spear Phishing",
    "Whaling Attacks",
    "Vishing and Smishing",
    "Baiting and Quid Pro Quo",
    "Tailgating",
    "Dumpster Diving (Physical and Digital)",
    "GDPR for Marketing Teams",
    "GDPR for HR Teams",
    "GDPR for Developers",
    "Kenya Data Protection Act (DPA)",
    "Compliance with Kenya's ODPC",
    "Kenya's Computer Misuse and Cybercrimes Act (CMCA)",
    "Data Subject Rights in Kenya",
    "Incident Reporting in Kenya (KE-CIRT/CC)",
    "Cross-Border Data Transfers under Kenyan Law",
    "Understanding CVEs",
    "OWASP Top 10",
    "Threat Intelligence",
    "Intrusion Detection/Prevention Systems (IDS/IPS)",
    "Cyber Hygiene",
    "DNS Security",
    "Tor and the Dark Web",
    "Cryptojacking",
    "AI in Cybersecurity",
    "Machine Learning for Threat Detection",
    "Blockchain Security",
    "Smart Contract Security",
    "Operational Technology (OT) Security",
    "SCADA and ICS Security",
    "Cloud Access Security Broker (CASB)",
    "Zero Trust Architecture",
    "Deception Technology",
    "User and Entity Behavior Analytics (UEBA)",
    "Brand Protection",
    "Domain Squatting",
    "Account Takeover Prevention",
    "Security by Design",
    "Privacy by Design",
    "Security Metrics and KPIs",
    "Legal and Regulatory Compliance in Cybersecurity",
    "Ethical Hacking",
    "Digital Footprint Management",
    "Child Online Safety",
    "Remote Work Security",
    "Navigating the Dark Web: Risks and Realities",
    "Dark Web Marketplaces and Illicit Economies",
    "Investigative Techniques for the Dark Web",
    "Understanding Tor and Anonymity Networks",
    "Ethical Hacking: The White Hat Perspective",
    "Understanding Black Hat Motivations and Tactics",
    "The Grey Area: Grey Hat Hacking and Bug Bounties",
    "Introduction to Cyber Threat Intelligence (CTI)",
    "The CTI Lifecycle: Planning, Collection, Analysis, Dissemination",
    "Strategic, Tactical, and Operational Threat Intelligence",
    "Using Threat Intelligence Platforms (TIPs)",
    "Open-Source Intelligence (OSINT) for Threat Hunters",
    "Advanced Data Protection and Privacy Enhancing Technologies",
    "Data Sovereignty and Cross-Border Data Flows",
    "Implementing a Data Loss Prevention (DLP) Program",
    "Data Classification and Handling Best Practices",
    "Proactive Threat Hunting Methodologies",
    "Hypothesis-Driven Threat Hunting",
    "Threat Hunting with the MITRE ATT&CK Framework",
    "Endpoint and Network Threat Hunting Techniques",
    "Building and Operating a Modern Security Operations Center (SOC)",
    "SOC Analyst Tier 1: Triage and Investigation",
    "SOC Analyst Tier 2: Deep Dive Analysis and Forensics",
    "SIEM Engineering and Architecture",
    "Writing Effective SIEM Detection Rules",
    "Log Source Management for Comprehensive Visibility",
    "The Human Element: Psychology of Social Engineering",
    "Building a Strong Security Culture",
    "Insider Threat Program Development",
    "Security Awareness Program Management",
    "Cybersecurity Governance, Risk, and Compliance (GRC) Fundamentals",
    "GRC Framework Implementation (NIST, ISO)",
    "Enterprise Risk Management for Cybersecurity",
    "Developing and Managing Security Policies",
    "Secure Cloud Architecture (AWS, Azure, GCP)",
    "Enterprise Security Architecture and Design",
    "Zero Trust Network Architecture Implementation",
    "Secure Network Design and Segmentation"
  ];
  
  export const simulationData: Simulation[] = [
    {
      id: 'sim-1',
      type: 'Phishing Email Attack',
      description: 'Simulates a phishing campaign to test user awareness and reporting.',
      fields: [
        { name: 'orgName', label: 'Organization Name', type: 'text', placeholder: 'e.g., Acme Corporation' },
        { name: 'targetGroup', label: 'Target Group', type: 'select', options: ['All Employees', 'IT Staff', 'Executives', 'Finance'] },
        { name: 'numAccounts', label: 'Number of Test Accounts', type: 'text', placeholder: 'e.g., 50' },
        { name: 'emailDomains', label: 'Email Domain(s) to Target', type: 'text', placeholder: 'e.g., acme.com' },
        { name: 'reportingContact', label: 'Reporting Workflow Contact', type: 'text', placeholder: 'security@example.com' },
        { name: 'consent', label: 'I confirm this is a controlled test in a consented environment.', type: 'checkbox' },
      ],
    },
    {
      id: 'sim-2',
      type: 'Ransomware Infection',
      description: 'Tests endpoint protection and recovery plans against a simulated ransomware infection.',
      fields: [
        { name: 'environmentType', label: 'Test Environment', type: 'select', options: ['Virtual Machine', 'Sandbox', 'Isolated Server'] },
        { name: 'filesToEncrypt', label: 'Files to Encrypt (Description)', type: 'textarea', placeholder: 'Describe the types of files or directories to be targeted.' },
        { name: 'recoveryPlan', label: 'Recovery Plan Document', type: 'file' },
        { name: 'monitoringTools', label: 'Monitoring Tools in Place', type: 'text', placeholder: 'e.g., EDR, SIEM, Backups' },
        { name: 'irContact', label: 'Incident Response Contact', type: 'text', placeholder: 'ir-team@example.com' },
        { name: 'consent', label: 'I confirm this is a controlled test in a non-production environment.', type: 'checkbox' },
      ],
    },
    {
      id: 'sim-3',
      type: 'DDoS Attack Simulation',
      description: 'Simulates a Distributed Denial-of-Service attack to test infrastructure resilience.',
      fields: [
        { name: 'targetUrl', label: 'Target Server/Application URL/IP', type: 'text', placeholder: 'e.g., 192.168.1.100 or app.example.com' },
        { name: 'trafficThreshold', label: 'Traffic Threshold (Gbps or RPS)', type: 'text', placeholder: 'e.g., 10 Gbps' },
        { name: 'monitoringTools', label: 'Monitoring Tools', type: 'text', placeholder: 'e.g., Cloudflare, Akamai' },
        { name: 'mitigationPlan', label: 'Mitigation Plan Overview', type: 'textarea', placeholder: 'Describe the steps to be taken during the simulation.' },
        { name: 'consent', label: 'I confirm this is a planned and authorized test.', type: 'checkbox' },
      ],
    },
    {
      id: 'sim-4',
      type: 'SQL Injection Test',
      description: 'Attempts to exploit SQL vulnerabilities in a target web application.',
      fields: [
        { name: 'webAppUrl', label: 'Web Application URL', type: 'text', placeholder: 'https://test-app.example.com' },
        { name: 'dbSchema', label: 'Database Schema (Test Only)', type: 'file' },
        { name: 'inputFields', label: 'Input Fields to Test', type: 'textarea', placeholder: 'e.g., login form, search bar, contact form' },
        { name: 'loggingSetup', label: 'Logging Setup Details', type: 'text', placeholder: 'e.g., ELK Stack, Splunk' },
        { name: 'consent', label: 'I confirm this test is against a non-production environment.', type: 'checkbox' },
      ],
    },
    {
      id: 'sim-5',
      type: 'Cross-Site Scripting (XSS)',
      description: 'Tests if a web application is vulnerable to Cross-Site Scripting attacks.',
      fields: [
        { name: 'webAppUrl', label: 'Web Application URL', type: 'text', placeholder: 'https://test-app.example.com' },
        { name: 'inputFields', label: 'User Input Fields to Test', type: 'textarea', placeholder: 'e.g., comment sections, user profiles' },
        { name: 'browser', label: 'Target Browser Environment', type: 'text', placeholder: 'e.g., Chrome, Firefox (latest)' },
        { name: 'loggingSetup', label: 'Logging Setup Details', type: 'text', placeholder: 'e.g., ELK Stack, Splunk' },
        { name: 'consent', label: 'I confirm this test is against a non-production environment.', type: 'checkbox' },
      ],
    },
    {
        id: 'sim-6',
        type: 'Password Cracking Exercise',
        description: 'Assesses the strength of user passwords by attempting to crack provided hashes.',
        fields: [
            { name: 'hashSamples', label: 'Password Hash Samples', type: 'file' },
            { name: 'passwordPolicy', label: 'Password Policy Description', type: 'textarea', placeholder: 'e.g., 8 chars minimum, 1 uppercase, 1 number...' },
            { name: 'consent', label: 'I confirm I have consent to test these user accounts.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-7',
        type: 'Man-in-the-Middle Attack',
        description: 'Simulates an MitM attack to test network security and certificate validation.',
        fields: [
            { name: 'networkSetup', label: 'Network Setup Description', type: 'textarea', placeholder: 'Describe the test network segment (e.g., specific Wi-Fi SSID).' },
            { name: 'testDevices', label: 'Test Devices', type: 'text', placeholder: 'e.g., 1 laptop, 2 mobile phones' },
            { name: 'trafficSamples', label: 'Encrypted Traffic Samples', type: 'file' },
            { name: 'monitoringTools', label: 'Monitoring Tools', type: 'text', placeholder: 'e.g., Wireshark, IDS' },
            { name: 'consent', label: 'I confirm this test will be on a controlled network.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-8',
        type: 'Privilege Escalation Simulation',
        description: 'Tests for vulnerabilities that would allow a user to gain elevated permissions.',
        fields: [
            { name: 'testAccounts', label: 'Test Accounts with Roles', type: 'textarea', placeholder: 'e.g., user1 (guest), user2 (editor)' },
            { name: 'systemLogs', label: 'System Logs (for analysis)', type: 'file' },
            { name: 'escalationPaths', label: 'Potential Escalation Paths to Test', type: 'textarea', placeholder: 'Describe any known or suspected paths.' },
            { name: 'consent', label: 'I confirm this is a non-production environment.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-9',
        type: 'Malware Dropper Test',
        description: 'Tests security controls by simulating a malware dropper in a sandbox.',
        fields: [
            { name: 'sandboxType', label: 'Sandbox Environment Type', type: 'select', options: ['Cuckoo', 'Any.run', 'Internal VM'] },
            { name: 'samplePayload', label: 'Sample Payload', type: 'file' },
            { name: 'detectionTools', label: 'Detection Tools to Test', type: 'text', placeholder: 'e.g., EDR, Antivirus' },
            { name: 'consent', label: 'I confirm the payload is inert or for testing only.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-10',
        type: 'Insider Threat Scenario',
        description: 'Simulates malicious actions from an insider to test monitoring and alerting.',
        fields: [
            { name: 'userRoles', label: 'User Roles to Simulate', type: 'textarea', placeholder: 'e.g., Disgruntled employee in Finance' },
            { name: 'accessLogs', label: 'Access Logs (for analysis)', type: 'file' },
            { name: 'simulatedActions', label: 'Simulated Malicious Actions', type: 'textarea', placeholder: 'e.g., Accessing sensitive files, attempting data exfiltration.' },
            { name: 'irContact', label: 'Incident Response Contact', type: 'text', placeholder: 'ir-team@example.com' },
            { name: 'consent', label: 'I confirm this is a planned exercise with full authorization.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-11',
        type: 'Zero-Day Exploit Drill',
        description: 'Tests the organization\'s response to a simulated zero-day vulnerability.',
        fields: [
            { name: 'vulnerableSoftware', label: 'Vulnerable Test Software Version', type: 'text', placeholder: 'e.g., Apache Struts 2.3.x' },
            { name: 'patchPlan', label: 'Patch Management Plan', type: 'file' },
            { name: 'monitoringSetup', label: 'Monitoring Setup Details', type: 'textarea', placeholder: 'Describe how the system is monitored for exploits.' },
            { name: 'consent', label: 'I confirm this is a simulated drill.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-12',
        type: 'Supply Chain Attack',
        description: 'Simulates an attack originating from a compromised third-party dependency.',
        fields: [
            { name: 'dependenciesList', label: 'List of Dependencies to Analyze', type: 'textarea', placeholder: 'e.g., npm, pip, or Maven packages' },
            { name: 'vendorAccess', label: 'Vendor Access Points', type: 'text', placeholder: 'e.g., Third-party support accounts' },
            { name: 'mockPackage', label: 'Mock Compromised Package', type: 'file' },
            { name: 'consent', label: 'I confirm this is a controlled test.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-13',
        type: 'Cloud Misconfiguration Attack',
        description: 'Scans for and attempts to exploit common cloud security misconfigurations.',
        fields: [
            { name: 'cloudProvider', label: 'Cloud Provider', type: 'select', options: ['AWS', 'Azure', 'GCP'] },
            { name: 'iamPolicies', label: 'IAM Policies for Review', type: 'file' },
            { name: 'testAccounts', label: 'Test Accounts for Cloud Environment', type: 'textarea', placeholder: 'Provide credentials for test IAM users.' },
            { name: 'consent', label: 'I confirm this test is on a sanctioned cloud account.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-14',
        type: 'IoT Device Breach',
        description: 'Tests the security of an IoT device on the network.',
        fields: [
            { name: 'deviceType', label: 'IoT Device Type', type: 'text', placeholder: 'e.g., Smart Camera, Temperature Sensor' },
            { name: 'firmwareVersion', label: 'Firmware Version', type: 'text', placeholder: 'e.g., 1.2.3' },
            { name: 'networkAccess', label: 'Network Access Details', type: 'textarea', placeholder: 'How is the device connected? (Wi-Fi, Ethernet, etc.)' },
            { name: 'consent', label: 'I own the device and network being tested.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-15',
        type: 'Social Engineering Call Simulation',
        description: 'Conducts simulated vishing (voice phishing) calls to test employee resilience.',
        fields: [
            { name: 'phoneNumbers', label: 'Target Phone Numbers (Test Only)', type: 'textarea', placeholder: 'List of internal numbers to call.' },
            { name: 'scripts', label: 'Call Scripts/Scenarios', type: 'textarea', placeholder: 'e.g., "IT support asking for password reset."' },
            { name: 'reportingWorkflow', label: 'Reporting Workflow Contact', type: 'text', placeholder: 'security@example.com' },
            { name: 'consent', label: 'I confirm all targets have consented to this exercise.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-16',
        type: 'Data Exfiltration Drill',
        description: 'Tests Data Loss Prevention (DLP) tools by simulating data exfiltration.',
        fields: [
            { name: 'sampleData', label: 'Sample Sensitive Data', type: 'file' },
            { name: 'monitoringSetup', label: 'Network Monitoring Setup', type: 'textarea', placeholder: 'Describe the DLP tools and egress points to monitor.' },
            { name: 'detectionThresholds', label: 'Detection Thresholds', type: 'text', placeholder: 'e.g., "Alert on >10MB transfer to external IP."' },
            { name: 'consent', label: 'I confirm this is a controlled drill with mock data.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-17',
        type: 'Business Email Compromise (BEC)',
        description: 'Simulates a BEC attack, such as a fraudulent wire transfer request.',
        fields: [
            { name: 'emailAccounts', label: 'Target Email Accounts', type: 'textarea', placeholder: 'e.g., Finance department lead.' },
            { name: 'domainSetup', label: 'Domain Setup for Spoofing', type: 'text', placeholder: 'e.g., acme-corp.com (similar to acme.com)' },
            { name: 'approvalWorkflow', label: 'Approval Workflow to Test', type: 'textarea', placeholder: 'Describe the payment approval process.' },
            { name: 'irContact', label: 'Incident Response Contact', type: 'text', placeholder: 'ir-team@example.com' },
            { name: 'consent', label: 'I confirm this is an authorized test with stakeholder approval.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-18',
        type: 'Credential Stuffing Attack',
        description: 'Tests login endpoints with commonly breached credentials to check for password reuse.',
        fields: [
            { name: 'testAccounts', label: 'Login Endpoint and Test Accounts', type: 'textarea', placeholder: 'URL: /login, Accounts: test1@example.com, test2@example.com' },
            { name: 'passwordReuseScenarios', label: 'Password Reuse Scenarios', type: 'textarea', placeholder: 'e.g., Use top 100 common passwords, passwords from recent public breaches.' },
            { name: 'monitoringTools', label: 'Monitoring Tools in Place', type: 'text', placeholder: 'e.g., WAF, rate limiting' },
            { name: 'consent', label: 'I confirm testing is on a non-production environment.', type: 'checkbox' },
        ]
    },
    {
        id: 'sim-19',
        type: 'Mobile App Exploit',
        description: 'Tests a mobile application for common vulnerabilities.',
        fields: [
            { name: 'mobileApp', label: 'Mobile App APK/IPA', type: 'file' },
            { name: 'testDevices', label: 'Test Devices and OS Versions', type: 'text', placeholder: 'e.g., Pixel 6 (Android 13), iPhone 14 (iOS 16)' },
            { name: 'loggingSetup', label: 'Logging Setup Details', type: 'textarea', placeholder: 'Where to send logs from the mobile app during testing.' },
            { name: 'consent', label: 'I have authorization to test this application.', type: 'checkbox' },
        ]
    },
  ];
  
  





    

    



