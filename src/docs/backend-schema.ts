/**
 * This file is auto-generated from docs/backend.json. Do not edit manually.
 */

export type ThreatScenario = {
    slug: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    introStory: string;
    steps: Array<{
        stepId: string;
        title: string;
        content: string;
        type: 'multiple-choice' | 'audio-challenge';
        assetUrl?: string;
        choices: Array<{
            choiceId: string;
            text: string;
        }>;
        correctChoiceId: string;
        feedback: {
            correct: string;
            incorrect: string;
        };
    }>;
    scoring?: {
        pointsPerCorrect?: number;
    };
};
export type Campaign = {
    title: string;
    description: string;
    duration?: string;
    audience?: string;
    modules: Array<{
        id: string;
        title: string;
        description: string;
    }>;
    activities?: Array<string>;
    kpis?: string;
    status: 'draft' | 'scheduled' | 'active' | 'completed';
    type?: 'training' | 'phishing';
    start_date?: string;
    end_date?: string;
    tenantId: string;
};
export type PartnerRequest = {
    companyName: string;
    industry: string;
    country?: string;
    contactPersonName: string;
    contactPersonTitle?: string;
    email: string;
    phone?: string;
    message?: string;
    status: 'new' | 'contacted' | 'closed' | 'archived';
    priority?: 'low' | 'medium' | 'high';
    requestedAt: string;
    notes?: Array<{
        text: string;
        authorId: string;
        authorName: string;
        createdAt: string;
    }>;
};
export type Tenant = {
    name: string;
    region: string;
    status: 'active' | 'suspended' | 'trial' | 'expired';
    subscription?: {
        tier?: 'basic' | 'pro' | 'enterprise';
        startDate?: string;
        renewalDate?: string;
        maxUsers?: number;
        features?: Array<string>;
    };
    settings?: {
        branding?: {
            logoUrl?: string;
            primaryColor?: string;
            secondaryColor?: string;
        };
        security?: {
            passwordPolicy?: string;
            mfaRequired?: boolean;
            sessionTimeout?: number;
        };
        compliance?: {
            regulations?: Array<string>;
            requireCertificates?: boolean;
        };
    };
    contact?: {
        adminEmail?: string;
        billingEmail?: string;
        phone?: string;
        address?: string;
    };
    stats?: {
        totalUsers?: number;
        activeUsers?: number;
        completionRate?: number;
        avgScore?: number;
    };
    createdAt?: string;
    updatedAt?: string;
};
export type User = {
    email: string;
    displayName: string;
    tenantId: string;
    department?: string;
    jobTitle: string;
    industry: string;
    interests?: Array<string>;
    status: 'active' | 'invited' | 'suspended' | 'archived';
    risk?: 'Low' | 'Medium' | 'High';
    trainingStats?: {
        completedModules?: number;
        totalModules?: number;
        avgScore?: number;
        lastCompleted?: string;
        complianceScore?: number;
    };
    phishingStats?: {
        simulatedReceived?: number;
        clicked?: number;
        reported?: number;
        riskScore?: 'low' | 'medium' | 'high' | 'critical';
    };
    challengeStats?: {
        totalCompleted?: number;
        avgScore?: number;
    };
    preferences?: {
        language?: string;
        notifications?: boolean;
        darkMode?: boolean;
    };
    createdAt?: string;
    lastLogin?: string;
};
export type TrainingModule = {
    title: string;
    description?: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    content?: {
        type?: 'video' | 'slides' | 'interactive' | 'document';
        url?: string;
        slides?: Array<Record<string, any>>;
        transcript?: string;
    };
    quiz?: {
        questions?: Array<{
            question?: string;
            options?: Array<string>;
            correctAnswer?: number;
            explanation?: string;
        }>;
        passingScore?: number;
        attemptsAllowed?: number;
    };
    metadata?: {
        version?: string;
        createdBy?: string;
        lastUpdated?: string;
        tags?: Array<string>;
    };
    availability?: {
        global?: boolean;
        tenantIds?: Array<string>;
        tiers?: Array<string>;
    };
};
export type UserProgressEntry = {
    moduleId: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'expired';
    startedAt?: string;
    completedAt?: string;
    score?: number;
};
export type UserProgress = {
    userId: string;
    tenantId: string;
    completedModules?: Array<{
        moduleId: string;
        status: 'not_started' | 'in_progress' | 'completed' | 'expired';
        startedAt?: string;
        completedAt?: string;
        score?: number;
    }>;
    updatedAt?: string;
};
export type UserChallengeAttemptEntry = {
    challengeType: 'escape-room' | 'vuln-challenge' | 'api-lab' | 'threat-scenario';
    challengeName: string;
    score: number;
    maxScore: number;
    percentage: number;
    completedAt: string;
};
export type UserChallengeAttempt = {
    userId: string;
    tenantId: string;
    attempts?: Array<{
        challengeType: 'escape-room' | 'vuln-challenge' | 'api-lab' | 'threat-scenario';
        challengeName: string;
        score: number;
        maxScore: number;
        percentage: number;
        completedAt: string;
    }>;
    lastAttemptAt?: string;
};
export type Assignment = {
    tenantId: string;
    moduleId: string;
    assignedBy: string;
    assignedTo: {
        type?: 'all' | 'department' | 'group' | 'individual';
        department?: string;
        groupId?: string;
        userIds?: Array<string>;
    };
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'completed' | 'cancelled';
    reminderSettings?: {
        daysBefore?: Array<number>;
        notifications?: boolean;
    };
    createdAt?: string;
};
export type PhishingSimulation = {
    tenantId: string;
    name: string;
    type: 'email' | 'sms' | 'social';
    template?: string;
    targetGroup?: Record<string, any>;
    schedule?: Record<string, any>;
    results?: Record<string, any>;
    status: 'draft' | 'scheduled' | 'sent' | 'completed';
};
export type PhishingTemplate = {
    name: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    email: {
        fromName?: string;
        fromEmail?: string;
        subject?: string;
        htmlBody?: string;
        textBody?: string;
        attachments?: Array<{
            name?: string;
            type?: string;
        }>;
    };
    landingPage?: {
        url?: string;
        design?: string;
        captureCredentials?: boolean;
        redirectTo?: string;
    };
    educationalContent?: {
        debriefMessage?: string;
        trainingModule?: string;
        tips?: Array<string>;
    };
};
export type Report = {
    tenantId: string;
    name: string;
    type: 'compliance' | 'training' | 'phishing' | 'custom';
    period?: Record<string, any>;
    filters?: Record<string, any>;
    data?: Record<string, any>;
    generatedBy: string;
    generatedAt: string;
    downloadUrl?: string;
};
export type Role = {
    name: string;
    tier: number;
    description?: string;
    permissions?: Array<string>;
};
export type UserRole = {
    roles: Array<string>;
};
export type SubscriptionPlan = {
    name: string;
    price: {
        monthly?: number;
        annual?: number;
        currency?: string;
    };
    limits: {
        maxUsers?: number;
        maxAdmins?: number;
        storageGB?: number;
        apiCalls?: number;
    };
    features: {
        training?: {
            customContent?: boolean;
            advancedAnalytics?: boolean;
            apiAccess?: boolean;
        };
        phishing?: {
            simulations?: boolean;
            customTemplates?: boolean;
            advancedReporting?: boolean;
        };
        compliance?: {
            automatedReports?: boolean;
            customCertificates?: boolean;
            auditTrail?: boolean;
        };
        support?: {
            priority?: boolean;
            sso?: boolean;
            customBranding?: boolean;
        };
    };
};
export type ComplianceRule = {
    regulation: string;
    article?: string;
    requirement: string;
    frequency: string;
    requiredModules?: Array<string>;
    evidenceRequired?: Array<string>;
    reporting?: {
        format?: string;
        fields?: Array<string>;
        retentionPeriod?: number;
    };
};
export type RiskScore = {
    userId: string;
    tenantId: string;
    overallScore: number;
    components?: {
        training?: {
            score?: number;
            weight?: number;
            factors?: Array<{
                factor?: string;
                value?: any;
                impact?: 'low' | 'medium' | 'high';
            }>;
        };
        phishing?: {
            score?: number;
            weight?: number;
            factors?: Array<{
                factor?: string;
                value?: any;
                impact?: 'low' | 'medium' | 'high';
            }>;
        };
        behavior?: {
            score?: number;
            weight?: number;
            factors?: Array<{
                factor?: string;
                value?: any;
                impact?: 'low' | 'medium' | 'high';
            }>;
        };
    };
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations?: Array<string>;
    lastUpdated?: string;
};
export type SmsAnalysis = {
    userId: string;
    senderId: string;
    message: string;
    verdict: 'Low Risk' | 'Medium Risk' | 'High Risk';
    riskScore: number;
    explanation: string;
    recommendation: string;
    indicators: Array<string>;
    potentialFraudAmount?: number;
    currency?: string;
    analyzedAt: string;
};
export type AdminImpersonation = {
    targetUserId: string;
    targetUserEmail: string;
    startedAt: string;
};
export type AuditLog = {
    id?: string;
    actorUid: string;
    actorEmail?: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, any>;
    timestamp: string;
};
