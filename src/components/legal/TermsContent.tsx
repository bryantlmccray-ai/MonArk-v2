import React from 'react';
import { FileText, Shield, Users, Scale, AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const TermsContent: React.FC = () => {
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
          <FileText className="h-12 w-12 text-goldenrod" />
          <h1 className="text-4xl font-light text-white">Terms of Service</h1>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          These Terms of Service govern your use of the MonArk platform and services
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Terms Sections */}
      <div className="grid gap-6">
        {/* Account Responsibilities */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Users className="h-6 w-6 text-goldenrod" />
              Account Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information when creating your profile</li>
              <li>Keep your login credentials secure and not share them with others</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be at least 18 years old to use our services</li>
            </ul>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Shield className="h-6 w-6 text-goldenrod" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              MonArk is committed to being an emotionally safe space. The following behaviors are strictly prohibited:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Harassment, abuse, or threatening behavior toward other users</li>
              <li>Sharing inappropriate, offensive, or harmful content</li>
              <li>Impersonating others or creating fake profiles</li>
              <li>Soliciting money, services, or personal information from other users</li>
              <li>Attempting to circumvent our safety features or policies</li>
            </ul>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">Zero Tolerance Policy</span>
              </div>
              <p className="text-red-200 text-sm">
                Violations of our community guidelines may result in immediate account suspension or permanent banning from the platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <FileText className="h-6 w-6 text-goldenrod" />
              Service Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              We strive to maintain high service availability but cannot guarantee uninterrupted access to our platform. We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Perform scheduled maintenance that may temporarily limit access</li>
              <li>Modify or discontinue features with appropriate notice to users</li>
              <li>Suspend service for emergency security or technical issues</li>
              <li>Update these terms with reasonable advance notice</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data and Privacy */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Shield className="h-6 w-6 text-goldenrod" />
              Data and Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              Your privacy is fundamental to our service. By using MonArk, you agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We collect and process your data as described in our Privacy Policy</li>
              <li>You have the right to access, correct, or delete your personal information</li>
              <li>Emotional wellness data is treated as sensitive health information</li>
              <li>We implement privacy-by-design principles throughout our platform</li>
            </ul>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Scale className="h-6 w-6 text-goldenrod" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              Any disputes arising from your use of MonArk will be resolved through:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Good faith negotiation between you and MonArk</li>
              <li>Binding arbitration in accordance with the American Arbitration Association rules</li>
              <li>Jurisdiction in the state where MonArk is headquartered</li>
            </ul>
            <p className="text-sm text-gray-400 mt-4">
              By using our service, you waive your right to participate in class-action lawsuits against MonArk.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="bg-charcoal-gray border-goldenrod/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <AlertTriangle className="h-6 w-6 text-goldenrod" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              MonArk provides dating and emotional wellness services "as is" without warranties. We are not liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Actions or behavior of other users on the platform</li>
              <li>Outcomes of relationships or interactions formed through our service</li>
              <li>Technical issues, data loss, or service interruptions</li>
              <li>Third-party content or services integrated with our platform</li>
            </ul>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-200 text-sm">
                <strong>Important:</strong> Our liability is limited to the amount you have paid for our services in the 12 months prior to any claim.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-white font-medium">Questions About These Terms?</h3>
            <p className="text-blue-200 text-sm">
              If you have questions about these Terms of Service, please contact our legal team at{' '}
              <a href="mailto:legal@monark.com" className="text-goldenrod hover:underline">
                legal@monark.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Links */}
      <Card className="bg-charcoal-gray border-goldenrod/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-white font-medium">Related Documents</h3>
            <div className="flex items-center justify-center space-x-6">
              <a href="/privacy" className="text-goldenrod hover:underline flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy Policy
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