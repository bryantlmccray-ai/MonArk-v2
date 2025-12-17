import React from 'react';
import { Shield, Eye, Lock, Users, FileText, AlertTriangle, ArrowLeft, Home, Cookie, Database, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PrivacyPolicyContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-goldenrod hover:bg-goldenrod/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <a href="/" className="text-goldenrod hover:underline flex items-center gap-2">
          <Home className="h-4 w-4" />
          Home
        </a>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-12 w-12 text-goldenrod" />
          <h1 className="text-4xl font-light text-white">Privacy Policy</h1>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Your privacy is fundamental to our mission of creating emotionally safe connections
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Privacy Sections */}
      <div className="grid gap-6">
        {/* Information We Collect */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Database className="h-6 w-6 text-goldenrod" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Profile Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Basic profile details (name, age, location, photos)</li>
                  <li>Relationship preferences and interests</li>
                  <li>Emotional readiness and relationship goals</li>
                  <li>Communication preferences and boundaries</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Usage Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>App usage patterns and feature interactions</li>
                  <li>Device information and technical data</li>
                  <li>Location data (only with your consent)</li>
                  <li>Communication metadata (not message content)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Emotional Wellness Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Dating style quiz responses</li>
                  <li>Emotional readiness assessments</li>
                  <li>Reflection prompts and journal entries</li>
                  <li>Relationship pattern insights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Eye className="h-6 w-6 text-goldenrod" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Core Services</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Matching you with compatible partners based on emotional readiness</li>
                  <li>Providing personalized relationship insights and recommendations</li>
                  <li>Facilitating safe communication and connection</li>
                  <li>Offering emotional wellness tools and resources</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Platform Improvement</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Analyzing usage patterns to improve our algorithms</li>
                  <li>Developing new features based on user needs</li>
                  <li>Ensuring platform safety and security</li>
                  <li>Conducting research on healthy relationship patterns</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Communication</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Sending important updates about your matches and connections</li>
                  <li>Providing safety alerts and wellness check-ins</li>
                  <li>Sharing platform updates and new features</li>
                  <li>Responding to your support requests</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Policy */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Cookie className="h-6 w-6 text-goldenrod" />
              Cookie Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              We use cookies and similar technologies to enhance your experience on MonArk. Here's how we use them:
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Essential Cookies</h4>
                <p className="text-sm text-gray-300">
                  Required for basic functionality including authentication, security, and core features. 
                  These cannot be disabled as they are necessary for the platform to function.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Analytics Cookies</h4>
                <p className="text-sm text-gray-300">
                  Help us understand how users interact with our platform to improve user experience. 
                  Data is anonymized and used solely for internal analysis.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Preference Cookies</h4>
                <p className="text-sm text-gray-300">
                  Remember your settings and preferences to provide a personalized experience 
                  across sessions and devices.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-400">
              You can manage your cookie preferences at any time through your browser settings or our cookie consent banner.
            </p>
          </CardContent>
        </Card>

        {/* Data Sharing and Disclosure */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Users className="h-6 w-6 text-goldenrod" />
              Data Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Our Commitment</h4>
              <p className="text-green-200 text-sm">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">When We May Share Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                  <li><strong>Service Providers:</strong> Trusted partners who help us operate the platform (hosting, analytics, support)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect user safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with user notification)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">How We Protect Your Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>All data is encrypted in transit and at rest</li>
                  <li>Access is limited to authorized personnel only</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Compliance with industry-standard security practices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights and Choices */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Lock className="h-6 w-6 text-goldenrod" />
              Your Rights and Choices
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              You have significant control over your personal information. Your rights include:
            </p>
            
            <div className="grid gap-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">Access and Portability</h4>
                <p className="text-blue-200 text-sm">
                  Request a copy of all personal data we have about you in a machine-readable format.
                </p>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2">Correction and Updates</h4>
                <p className="text-yellow-200 text-sm">
                  Update or correct any inaccurate information in your profile at any time.
                </p>
              </div>
              
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">Deletion</h4>
                <p className="text-red-200 text-sm">
                  Request complete deletion of your account and all associated data.
                </p>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-medium mb-2">Restrict Processing</h4>
                <p className="text-purple-200 text-sm">
                  Limit how we use your data while keeping your account active.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <h4 className="text-white font-medium mb-2">How to Exercise Your Rights</h4>
              <p className="text-sm text-gray-300">
                Contact us at <a href="mailto:privacy@monark.com" className="text-goldenrod hover:underline">privacy@monark.com</a> or 
                use the data management tools in your account settings. We'll respond within 30 days of your request.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Trash2 className="h-6 w-6 text-goldenrod" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Active Accounts</h4>
                <p className="text-sm">
                  We retain your data as long as your account is active and for legitimate business purposes, 
                  including providing services and complying with legal obligations.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Deleted Accounts</h4>
                <p className="text-sm">
                  When you delete your account, we immediately remove your profile from public view and 
                  permanently delete your data within 30 days, except where required by law.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Safety and Security</h4>
                <p className="text-sm">
                  Some data may be retained longer for safety purposes, such as reports of abuse or violations 
                  of our community guidelines, to protect other users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <FileText className="h-6 w-6 text-goldenrod" />
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              MonArk operates globally, and your data may be transferred to and processed in countries 
              other than your residence. We ensure adequate protection through:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions for transfers to countries with equivalent protection</li>
              <li>Additional safeguards and certifications where required</li>
              <li>Regular assessments of our international transfer mechanisms</li>
            </ul>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
              <p className="text-blue-200 text-sm">
                <strong>EU Users:</strong> Your data is protected under GDPR regardless of where it's processed. 
                You maintain all rights under European data protection law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to This Policy */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <AlertTriangle className="h-6 w-6 text-goldenrod" />
              Changes to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, 
              technology, legal requirements, or other factors.
            </p>
            
            <div className="space-y-3">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2">Notification Process</h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-200 text-sm ml-4">
                  <li>Material changes will be communicated via email and in-app notification</li>
                  <li>You'll have at least 30 days to review changes before they take effect</li>
                  <li>Continued use of the service constitutes acceptance of the updated policy</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-400">
                We encourage you to review this policy periodically to stay informed about how we protect your information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-white font-medium">Privacy Questions or Concerns?</h3>
            <div className="space-y-2">
              <p className="text-blue-200 text-sm">
                Email our Data Protection Officer at{' '}
                <a href="mailto:privacy@monark.com" className="text-goldenrod hover:underline">
                  privacy@monark.com
                </a>
              </p>
              <p className="text-blue-200 text-sm">
                For EU users: You can also contact your local data protection authority if you have concerns 
                about how we handle your personal information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Links */}
      <Card className="bg-charcoal-gray border-goldenrod/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-white font-medium">Related Documents</h3>
            <div className="flex items-center justify-center space-x-6">
              <a href="/terms" className="text-goldenrod hover:underline flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Terms of Service
              </a>
              <a href="/" className="text-goldenrod hover:underline flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to MonArk
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};