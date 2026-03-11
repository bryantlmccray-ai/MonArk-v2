import React from 'react';
import { Shield, ArrowLeft, FileText, Lock, Globe, Users, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function DataProcessing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-foreground/80 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Data Processing Agreement</h1>
          </div>
          <p className="text-foreground/80 font-medium">
            Last updated: March 11, 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">1. Introduction & Scope</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>
                This Data Processing Agreement ("DPA") forms part of the Terms of Service between MonArk ("we," "us," or "the Company") and the user ("you," "Data Subject") and governs the processing of personal data in connection with your use of the MonArk dating platform.
              </p>
              <p>
                This DPA is designed to ensure compliance with applicable data protection laws, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The General Data Protection Regulation (GDPR) — EU/EEA</li>
                <li>The California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA)</li>
                <li>Washington's My Health My Data Act</li>
                <li>Other applicable state, federal, and international privacy laws</li>
              </ul>
            </div>
          </section>

          {/* Definitions */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">2. Definitions</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p><strong className="text-foreground">"Personal Data"</strong> means any information relating to an identified or identifiable natural person, including but not limited to name, email address, photos, location data, dating preferences, and behavioral data.</p>
                <p><strong className="text-foreground">"Sensitive Personal Data"</strong> means data revealing racial or ethnic origin, sexual orientation, gender identity, health data, or other categories given special protection under applicable law.</p>
                <p><strong className="text-foreground">"Processing"</strong> means any operation performed on personal data, including collection, recording, storage, retrieval, use, disclosure, or deletion.</p>
                <p><strong className="text-foreground">"Data Controller"</strong> means MonArk, which determines the purposes and means of processing personal data.</p>
                <p><strong className="text-foreground">"Sub-processor"</strong> means any third-party service provider engaged by MonArk to process personal data on its behalf.</p>
              </div>
            </div>
          </section>

          {/* Data We Collect */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <Server className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">3. Categories of Data Processed</h2>
            </div>
            <div className="space-y-4 text-foreground/80 text-sm font-medium leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-foreground font-semibold mb-2">Account & Identity Data</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Full name and display name</li>
                    <li>• Email address</li>
                    <li>• Date of birth / age verification</li>
                    <li>• Phone number (optional)</li>
                    <li>• Profile photos</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-foreground font-semibold mb-2">Dating & Preference Data</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Gender identity and pronouns</li>
                    <li>• Sexual orientation preferences</li>
                    <li>• Relationship goals and intent</li>
                    <li>• Dating style quiz responses</li>
                    <li>• Interests and lifestyle choices</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-foreground font-semibold mb-2">Behavioral & Interaction Data</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Match interactions and responses</li>
                    <li>• Conversation metadata</li>
                    <li>• Date journal entries and reflections</li>
                    <li>• RIF (Relationship Intelligence) scores</li>
                    <li>• App usage analytics</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-foreground font-semibold mb-2">Location & Technical Data</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• City and neighborhood (with consent)</li>
                    <li>• Device type and browser info</li>
                    <li>• IP address (anonymized)</li>
                    <li>• Session and cookie identifiers</li>
                    <li>• Notification preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Lawful Basis */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">4. Lawful Basis for Processing</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>We process your personal data under the following legal bases:</p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p><strong className="text-foreground">Consent (Art. 6(1)(a) GDPR):</strong> For sensitive personal data such as sexual orientation, gender identity, and health-related information. You may withdraw consent at any time through your privacy settings.</p>
                <p><strong className="text-foreground">Contractual Necessity (Art. 6(1)(b) GDPR):</strong> To provide the core dating service, deliver matches, facilitate conversations, and manage your account.</p>
                <p><strong className="text-foreground">Legitimate Interest (Art. 6(1)(f) GDPR):</strong> For platform safety, fraud prevention, abuse detection, and service improvement — balanced against your privacy rights.</p>
                <p><strong className="text-foreground">Legal Obligation (Art. 6(1)(c) GDPR):</strong> To comply with applicable laws, respond to lawful requests, and maintain required records.</p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <Lock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">5. Data Security Measures</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>MonArk implements appropriate technical and organizational measures to protect your personal data, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256).</li>
                <li><strong className="text-foreground">Access Controls:</strong> Role-based access with multi-factor authentication for all administrative access.</li>
                <li><strong className="text-foreground">Data Minimization:</strong> We collect only the data necessary to provide the service and delete data that is no longer required.</li>
                <li><strong className="text-foreground">Audit Logging:</strong> All access to personal data is logged and monitored for unauthorized activity.</li>
                <li><strong className="text-foreground">Incident Response:</strong> We maintain a data breach response plan and will notify affected users and authorities within 72 hours of discovering a breach, as required by GDPR.</li>
                <li><strong className="text-foreground">Regular Testing:</strong> Security assessments, penetration testing, and vulnerability scanning are conducted regularly.</li>
              </ul>
            </div>
          </section>

          {/* Sub-processors */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">6. Sub-processors</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>MonArk engages the following categories of sub-processors to deliver our service:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 pr-4 text-foreground font-semibold">Sub-processor</th>
                      <th className="text-left py-3 pr-4 text-foreground font-semibold">Purpose</th>
                      <th className="text-left py-3 text-foreground font-semibold">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 pr-4">Supabase</td>
                      <td className="py-3 pr-4">Database hosting, authentication, file storage</td>
                      <td className="py-3">United States</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">OpenAI</td>
                      <td className="py-3 pr-4">AI-powered matching insights and companion chat</td>
                      <td className="py-3">United States</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Google Maps</td>
                      <td className="py-3 pr-4">Location services and venue discovery</td>
                      <td className="py-3">United States</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Email Service Provider</td>
                      <td className="py-3 pr-4">Transactional emails and notifications</td>
                      <td className="py-3">United States</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-foreground/70">
                All sub-processors are bound by data processing agreements that require them to protect your data to the same standard as this DPA.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <Globe className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">7. International Data Transfers</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>
                Your personal data may be transferred to and processed in countries outside your country of residence. When we transfer data internationally, we ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Standard Contractual Clauses (SCCs):</strong> We use EU-approved SCCs for transfers from the EU/EEA to countries without an adequacy decision.</li>
                <li><strong className="text-foreground">EU-US Data Privacy Framework:</strong> Where applicable, we rely on the EU-US Data Privacy Framework for transfers to certified US entities.</li>
                <li><strong className="text-foreground">Supplementary Measures:</strong> Additional technical and organizational measures are implemented where required by transfer impact assessments.</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p><strong className="text-foreground">Active Account Data:</strong> Retained for the duration of your active account and deleted within 30 days of account deletion request.</p>
                <p><strong className="text-foreground">Conversation Data:</strong> Messages are retained for the duration of the match relationship. Upon unmatching, messages are permanently deleted within 14 days.</p>
                <p><strong className="text-foreground">Safety & Compliance Data:</strong> Reports, blocks, and safety-related records may be retained for up to 3 years as required for platform safety and legal compliance.</p>
                <p><strong className="text-foreground">Analytics Data:</strong> Aggregated, anonymized analytics data may be retained indefinitely as it cannot be linked to individual users.</p>
                <p><strong className="text-foreground">Backup Copies:</strong> Encrypted backups are purged on a rolling 90-day cycle.</p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">9. Your Data Rights</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>Depending on your jurisdiction, you have the following rights regarding your personal data:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right of Access</h4>
                  <p className="text-xs mt-1">Request a copy of all personal data we hold about you.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right to Rectification</h4>
                  <p className="text-xs mt-1">Correct inaccurate or incomplete personal data.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right to Erasure</h4>
                  <p className="text-xs mt-1">Request permanent deletion of your personal data.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right to Portability</h4>
                  <p className="text-xs mt-1">Receive your data in a machine-readable format.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right to Restrict Processing</h4>
                  <p className="text-xs mt-1">Limit how we use your data in certain circumstances.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right to Object</h4>
                  <p className="text-xs mt-1">Object to processing based on legitimate interests.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right to Withdraw Consent</h4>
                  <p className="text-xs mt-1">Withdraw consent at any time without affecting prior processing.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-foreground font-semibold text-sm">Right to Non-Discrimination</h4>
                  <p className="text-xs mt-1">Exercise your rights without facing service penalties (CCPA).</p>
                </div>
              </div>
              <p className="text-sm">
                To exercise any of these rights, visit the <a href="/privacy" className="text-primary font-semibold hover:underline">Data Management</a> section of your account or contact us at{' '}
                <a href="mailto:privacy@monark.com" className="text-primary font-semibold hover:underline">privacy@monark.com</a>.
              </p>
            </div>
          </section>

          {/* Washington My Health My Data */}
          <section className="bg-primary/10 border-2 border-primary/30 rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">10. Washington My Health My Data Act Compliance</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>
                Certain data collected by MonArk, including gender identity and sexual orientation, may be classified as "consumer health data" under Washington's My Health My Data Act. In compliance with this law:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We obtain your <strong className="text-foreground">affirmative consent</strong> before collecting or sharing any consumer health data.</li>
                <li>We do not sell consumer health data and will never do so.</li>
                <li>You have the right to <strong className="text-foreground">access and delete</strong> your consumer health data at any time.</li>
                <li>We maintain a separate internal policy governing the collection, use, and retention of consumer health data.</li>
                <li>Geofencing is not used to collect health data around healthcare facilities.</li>
              </ul>
            </div>
          </section>

          {/* CCPA/CPRA Specific */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">11. CCPA / CPRA Disclosures</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>For California residents, the following additional disclosures apply:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Sale of Personal Information:</strong> MonArk does not sell your personal information and has not done so in the preceding 12 months.</li>
                <li><strong className="text-foreground">Sharing for Cross-Context Behavioral Advertising:</strong> MonArk does not share your personal information for cross-context behavioral advertising.</li>
                <li><strong className="text-foreground">Sensitive Personal Information:</strong> We use sensitive personal information only for purposes permitted under CPRA, including providing the dating service you requested.</li>
                <li><strong className="text-foreground">Automated Decision-Making:</strong> Our matching algorithms use automated processing to suggest compatible matches. You may request information about this logic and opt out of profiling.</li>
                <li><strong className="text-foreground">Do Not Track:</strong> MonArk honors Do Not Track browser signals and Global Privacy Control (GPC) signals.</li>
              </ul>
            </div>
          </section>

          {/* Contact & Changes */}
          <section className="bg-card border-2 border-border rounded-xl p-6 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.1)]">
            <div className="flex items-start space-x-3 mb-4">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">12. Contact & Changes to This DPA</h2>
            </div>
            <div className="space-y-3 text-foreground/80 text-sm font-medium leading-relaxed">
              <p>
                We may update this DPA from time to time. Material changes will be communicated through the app or via email. Continued use of MonArk after changes constitutes acceptance of the updated DPA.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p><strong className="text-foreground">Data Protection Contact:</strong></p>
                <p>Email: <a href="mailto:privacy@monark.com" className="text-primary font-semibold hover:underline">privacy@monark.com</a></p>
                <p>MonArk, Inc.</p>
                <p>Seattle, Washington, United States</p>
              </div>
              <p className="text-xs text-foreground/70">
                If you are located in the EU/EEA, you also have the right to lodge a complaint with your local supervisory authority.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
