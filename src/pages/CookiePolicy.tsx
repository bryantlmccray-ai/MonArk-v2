import React from 'react';
import { Cookie, ArrowLeft, Home, Shield, Eye, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-jet-black">
      <div className="container mx-auto px-4 py-8">
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
              <Cookie className="h-12 w-12 text-goldenrod" />
              <h1 className="text-4xl font-light text-white">Cookie Policy</h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Understanding how MonArk uses cookies and similar technologies to enhance your experience
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Cookie Policy Sections */}
          <div className="grid gap-6">
            {/* What Are Cookies */}
            <Card className="bg-charcoal-gray border-goldenrod/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Cookie className="h-6 w-6 text-goldenrod" />
                  What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Cookies are small text files that are stored on your device when you visit a website. 
                  They help websites remember your preferences, improve functionality, and provide a better user experience.
                </p>
                <p>
                  MonArk uses cookies and similar technologies (like local storage and session storage) to enhance 
                  your experience and provide personalized features that support emotional wellness and meaningful connections.
                </p>
              </CardContent>
            </Card>

            {/* Types of Cookies We Use */}
            <Card className="bg-charcoal-gray border-goldenrod/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Settings className="h-6 w-6 text-goldenrod" />
                  Types of Cookies We Use
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div className="space-y-4">
                  {/* Essential Cookies */}
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Essential Cookies (Required)
                    </h4>
                    <p className="text-green-200 text-sm mb-3">
                      These cookies are necessary for the platform to function and cannot be disabled.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-green-200 text-sm ml-4">
                      <li><strong>Authentication:</strong> Keep you logged in securely</li>
                      <li><strong>Security:</strong> Protect against fraud and abuse</li>
                      <li><strong>Session Management:</strong> Maintain your session across pages</li>
                      <li><strong>Cookie Preferences:</strong> Remember your cookie consent choices</li>
                    </ul>
                  </div>

                  {/* Functional Cookies */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Functional Cookies (Optional)
                    </h4>
                    <p className="text-blue-200 text-sm mb-3">
                      These cookies enhance functionality and remember your preferences.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm ml-4">
                      <li><strong>User Preferences:</strong> Remember your settings and display preferences</li>
                      <li><strong>Language Settings:</strong> Store your language and region preferences</li>
                      <li><strong>Accessibility:</strong> Remember accessibility settings you've chosen</li>
                      <li><strong>Theme Settings:</strong> Store your preferred app theme and layout</li>
                    </ul>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Analytics Cookies (Optional)
                    </h4>
                    <p className="text-purple-200 text-sm mb-3">
                      Help us understand how users interact with MonArk to improve our services.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-purple-200 text-sm ml-4">
                      <li><strong>Usage Analytics:</strong> Track which features are most helpful to users</li>
                      <li><strong>Performance Monitoring:</strong> Identify and fix technical issues</li>
                      <li><strong>Feature Optimization:</strong> Understand how to improve user experience</li>
                      <li><strong>Safety Analytics:</strong> Monitor for unusual activity or potential abuse</li>
                    </ul>
                  </div>

                  {/* Personalization Cookies */}
                  <div className="bg-goldenrod/20 border border-goldenrod rounded-lg p-4">
                    <h4 className="text-goldenrod font-medium mb-2">
                      Personalization Cookies (Optional)
                    </h4>
                    <p className="text-white text-sm mb-3">
                      Cookies that help us personalize your dating experience.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-white text-sm ml-4">
                      <li><strong>Preferences:</strong> Remember your dating style preferences</li>
                      <li><strong>Date Ideas:</strong> Store your preferred date types and availability</li>
                      <li><strong>Personalized Suggestions:</strong> Enable customized match recommendations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Cookies */}
            <Card className="bg-charcoal-gray border-goldenrod/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Eye className="h-6 w-6 text-goldenrod" />
                  Third-Party Services
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We work with trusted third-party services that may also set cookies. These services help us provide 
                  a better experience while maintaining your privacy and security.
                </p>
                
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Analytics Partners</h4>
                    <p className="text-sm text-gray-300">
                      We use privacy-focused analytics tools to understand user behavior without collecting personal information. 
                      All data is anonymized and aggregated.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Infrastructure Providers</h4>
                    <p className="text-sm text-gray-300">
                      Our hosting and content delivery partners may set cookies for security, performance, 
                      and fraud prevention purposes.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Support Services</h4>
                    <p className="text-sm text-gray-300">
                      Customer support and help desk tools may use cookies to provide better assistance 
                      and remember your support preferences.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Managing Your Cookie Preferences */}
            <Card className="bg-charcoal-gray border-goldenrod/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Settings className="h-6 w-6 text-goldenrod" />
                  Managing Your Cookie Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">On MonArk</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                      <li>Use the cookie consent banner that appears on your first visit</li>
                      <li>Access cookie settings through your account preferences</li>
                      <li>Clear your browser's data to reset all cookie preferences</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">In Your Browser</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                      <li><strong>Chrome:</strong> Settings {'>'} Privacy and security {'>'} Cookies and other site data</li>
                      <li><strong>Firefox:</strong> Options {'>'} Privacy {'&'} Security {'>'} Cookies and Site Data</li>
                      <li><strong>Safari:</strong> Preferences {'>'} Privacy {'>'} Manage Website Data</li>
                      <li><strong>Edge:</strong> Settings {'>'} Cookies and site permissions {'>'} Cookies and site data</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-medium mb-2">Important Note</h4>
                    <p className="text-yellow-200 text-sm">
                      Disabling certain cookies may limit your ability to use some features of MonArk. 
                      Essential cookies cannot be disabled as they are required for basic functionality and security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card className="bg-charcoal-gray border-goldenrod/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Trash2 className="h-6 w-6 text-goldenrod" />
                  Cookie Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Session Cookies</h4>
                    <p className="text-sm text-gray-300">
                      Deleted automatically when you close your browser or end your session.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Persistent Cookies</h4>
                    <p className="text-sm text-gray-300">
                      Remain on your device for a specified period (typically 1-12 months) or until you delete them. 
                      Used for remembering preferences and providing personalized experiences across visits.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-300">
                      Typically expire after 1-2 years. Data is anonymized and used only for improving our services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-white font-medium">Questions About Our Cookie Policy?</h3>
                <p className="text-blue-200 text-sm">
                  If you have questions about how we use cookies or want to learn more about our data practices, 
                  contact us at{' '}
                  <a href="mailto:privacy@monark.com" className="text-goldenrod hover:underline">
                    privacy@monark.com
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
                  <a href="/terms" className="text-goldenrod hover:underline flex items-center gap-2">
                    <Shield className="h-4 w-4" />
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
      </div>
    </div>
  );
}