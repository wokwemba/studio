
import { type ThreatScenario } from "./types";
import { Headphones, VenetianMask, MessageCircleQuestion } from "lucide-react";

export const threatScenarios: ThreatScenario[] = [
  {
    slug: 'urgent-wire-transfer',
    title: 'The Urgent Wire Transfer',
    description: 'You receive an urgent voice message from your CEO who is traveling. Can you determine if it\'s a legitimate request or a sophisticated deepfake scam?',
    category: 'Social Engineering',
    difficulty: 'hard',
    introStory: 'You\'re finishing up your day in the finance department when your work phone buzzes. It\'s a voice message from your CEO, who is currently at an overseas conference. The connection is a bit spotty, and the request is unusual. You need to decide quickly whether to act on it.',
    scoring: {
      pointsPerCorrect: 100,
    },
    steps: [
      {
        stepId: '1',
        title: 'Listen to the Voice Message',
        content: 'The voice message plays. It sounds like your CEO, but the urgency and slight digital artifacting in the audio make you pause. What is your immediate assessment?',
        type: 'audio-challenge',
        // In a real app, this would be a URL to an MP3 file
        assetUrl: 'placeholder-for-deepfake-audio.mp3',
        icon: Headphones,
        choices: [
          { choiceId: 'a', text: 'This seems like a standard, urgent request from an executive on the move.' },
          { choiceId: 'b', text: 'The unusual request combined with the audio quality raises a red flag for a potential deepfake or voice clone scam.' },
          { choiceId: 'c', text: 'It\'s probably just a bad connection. I should find the wire transfer form.' },
        ],
        correctChoiceId: 'b',
        feedback: {
          correct: 'Excellent intuition. The combination of high-pressure tactics (urgency) and an unusual channel (voice message for a wire transfer) are key indicators of a sophisticated social engineering attack.',
          incorrect: 'Be cautious. While it could be a bad connection, urgent financial requests through unusual channels are a major red flag for CEO fraud and deepfake scams. Always verify through a separate, trusted channel.',
        },
      },
      {
        stepId: '2',
        title: 'Verification Method',
        content: 'Your initial suspicion is that this could be a scam. What is the most secure way to verify the authenticity of this request?',
        type: 'multiple-choice',
        icon: MessageCircleQuestion,
        choices: [
          { choiceId: 'a', text: 'Reply to the CEO\'s email address to confirm the voice message.' },
          { choiceId: 'b', text: 'Call the CEO back on their known, trusted mobile number.' },
          { choiceId: 'c', text: 'Wait for them to contact you again.' },
          { choiceId: 'd', text: 'Forward the voice message to a colleague to get a second opinion.' },
        ],
        correctChoiceId: 'b',
        feedback: {
          correct: 'Perfect. Calling back on a known, trusted number is the best way to verify. This bypasses any compromised email accounts or spoofed numbers the attacker might be using.',
          incorrect: 'Replying to an email isn\'t secure enough, as the attacker may have compromised the CEO\'s email account to make the scam more convincing. The most secure method is to use a separate, trusted communication channel like a known phone number.',
        },
      },
      {
        stepId: '3',
        title: 'Identifying the Threat',
        content: 'After confirming via a phone call that the CEO did NOT make the request, you identify the attack. What is the most accurate name for this type of threat?',
        type: 'multiple-choice',
        icon: VenetianMask,
        choices: [
          { choiceId: 'a', text: 'Standard Phishing' },
          { choiceId: 'b',text: 'AI-Powered Vishing (Voice Phishing) or Deepfake Fraud' },
          { choiceId: 'c', text: 'Smishing' },
        ],
        correctChoiceId: 'b',
        feedback: {
          correct: 'Correct. This attack uses a voice component (Vishing) and likely an AI-generated voice clone (Deepfake) to impersonate an executive, which is a highly targeted form of spear phishing.',
          incorrect: 'While it is a type of social engineering, "Standard Phishing" usually refers to email, and "Smishing" refers to SMS/text messages. The use of a voice clone makes this a Vishing or Deepfake attack.',
        },
      },
    ],
  },
];
