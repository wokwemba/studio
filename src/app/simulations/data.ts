export type Simulation = {
  id: string;
  type: string;
  inputsNeeded: string;
};

export const simulationData: Simulation[] = [
  {
    id: 'sim-1',
    type: 'Phishing Email Attack',
    inputsNeeded: 'Sample email accounts, consent to simulate inbox delivery, and reporting workflow.',
  },
  {
    id: 'sim-2',
    type: 'Ransomware Infection',
    inputsNeeded: 'Test environment (VM or sandbox), files to encrypt, and recovery plan.',
  },
  {
    id: 'sim-3',
    type: 'DDoS Attack Simulation',
    inputsNeeded: 'Target server/application details, traffic thresholds, and monitoring tools.',
  },
  {
    id: 'sim-4',
    type: 'SQL Injection Test',
    inputsNeeded: 'Web app URL, database schema (test only), and input fields to test.',
  },
  {
    id: 'sim-5',
    type: 'Cross-Site Scripting (XSS)',
    inputsNeeded: 'Web app with user input fields, browser environment, and logging setup.',
  },
  {
    id: 'sim-6',
    type: 'Password Cracking Exercise',
    inputsNeeded: 'Hash samples, password policy, and user consent for testing.',
  },
  {
    id: 'sim-7',
    type: 'Man-in-the-Middle Attack',
    inputsNeeded: 'Network setup, test devices, and encrypted traffic samples.',
  },
  {
    id: 'sim-8',
    type: 'Privilege Escalation Simulation',
    inputsNeeded: 'Test accounts with different roles, system logs, and escalation paths.',
  },
  {
    id: 'sim-9',
    type: 'Malware Dropper Test',
    inputsNeeded: 'Sandbox environment, sample payload, and detection tools.',
  },
  {
    id: 'sim-10',
    type: 'Insider Threat Scenario',
    inputsNeeded: 'User roles, access logs, and simulated malicious insider actions.',
  },
  {
    id: 'sim-11',
    type: 'Zero-Day Exploit Drill',
    inputsNeeded: 'Vulnerable test software, patch management plan, and monitoring setup.',
  },
  {
    id: 'sim-12',
    type: 'Supply Chain Attack',
    inputsNeeded: 'Dependencies list, vendor access points, and mock compromised package.',
  },
  {
    id: 'sim-13',
    type: 'Cloud Misconfiguration Attack',
    inputsNeeded: 'Cloud environment (AWS/Azure/GCP), IAM policies, and test accounts.',
  },
  {
    id: 'sim-14',
    type: 'IoT Device Breach',
    inputsNeeded: 'IoT device setup, firmware version, and network access.',
  },
  {
    id: 'sim-15',
    type: 'Social Engineering Call Simulation',
    inputsNeeded: 'Phone numbers (test only), scripts, and reporting workflow.',
  },
  {
    id: 'sim-16',
    type: 'Data Exfiltration Drill',
    inputsNeeded: 'Sample sensitive data, network monitoring, and detection thresholds.',
  },
  {
    id: 'sim-17',
    type: 'Business Email Compromise (BEC)',
    inputsNeeded: 'Email accounts, domain setup, and approval workflow.',
  },
  {
    id: 'sim-18',
    type: 'Credential Stuffing Attack',
    inputsNeeded: 'Test accounts, password reuse scenarios, and monitoring tools.',
  },
  {
    id: 'sim-19',
    type: 'Mobile App Exploit',
    inputsNeeded: 'Mobile app APK/IPA, test devices, and logging setup.',
  },
  {
    id: 'sim-20',
    type: 'Incident Response Tabletop Exercise',
    inputsNeeded: 'Incident scenario, roles/responsibilities, and communication plan.',
  },
];
