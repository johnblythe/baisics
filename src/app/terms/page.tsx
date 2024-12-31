import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="prose prose-slate prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h3:mt-6 prose-p:text-gray-600 prose-ul:text-gray-600 prose-li:marker:text-gray-400 max-w-none">
            <div className="mb-12">
              <h1 className="mb-3">Terms of Service</h1>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Baisics, you agree to be bound by these Terms of Service and all applicable 
              laws and regulations.
            </p>

            <h2>2. User Accounts</h2>
            
            <h3>2.1 Registration</h3>
            <p>You must:</p>
            <ul>
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your account information</li>
              <li>Be at least 18 years old to create an account</li>
              <li>Agree to our image storage policy: profile images are stored as base64 representations and are only accessible by the user who uploaded them</li>
            </ul>

            <h3>2.2 Account Types and Roles</h3>
            <ul>
              <li>Client accounts: For individuals seeking fitness guidance</li>
              <li>Coach accounts: For certified fitness professionals</li>
              <li>Admin accounts: For platform management</li>
            </ul>

            <h3>2.3 Account Termination</h3>
            <p>We reserve the right to suspend or terminate accounts that:</p>
            <ul>
              <li>Violate these terms</li>
              <li>Engage in fraudulent activity</li>
              <li>Misuse our services</li>
              <li>Harass other users</li>
            </ul>

            <h2>3. Services</h2>

            <h3>3.1 Fitness Programs</h3>
            <ul>
              <li>Programs are designed based on user-provided information</li>
              <li>Users must accurately report their fitness level and health conditions</li>
              <li>We do not guarantee specific fitness results</li>
            </ul>

            <h3>3.2 Health and Safety</h3>
            <ul>
              <li>Consult your physician before starting any exercise program</li>
              <li>Follow proper form and safety guidelines</li>
              <li>Report any injuries or adverse effects immediately</li>
              <li>We are not responsible for injuries resulting from program use</li>
            </ul>

            <h2>4. User Responsibilities</h2>

            <h3>4.1 Content Guidelines</h3>
            <p>Users must not:</p>
            <ul>
              <li>Share inappropriate or offensive content</li>
              <li>Upload false or misleading information</li>
              <li>Violate others&apos; intellectual property rights</li>
              <li>Share personal information of others without consent</li>
            </ul>

            <h3>4.2 Proper Use</h3>
            <p>Users agree to:</p>
            <ul>
              <li>Follow program instructions carefully</li>
              <li>Report technical issues promptly</li>
              <li>Maintain respectful communication</li>
              <li>Use the platform for intended fitness purposes only</li>
            </ul>

            <h2>5. Payment Terms</h2>

            <h3>5.1 Subscription and Fees</h3>
            <ul>
              <li>Subscription fee is $10 per month</li>
              <li>Payments are processed securely through Stripe</li>
              <li>All fees are non-refundable unless required by law</li>
              <li>We reserve the right to modify pricing with notice</li>
            </ul>

            <h3>5.2 Cancellation</h3>
            <ul>
              <li>Users may cancel their subscription at any time</li>
              <li>No refunds for partial billing periods</li>
              <li>Access continues until end of billing period</li>
            </ul>

            <h2>6. Intellectual Property</h2>

            <h3>6.1 Our Content</h3>
            <ul>
              <li>All content, features, and functionality are owned by Drippy LLC</li>
              <li>Users may not reproduce or distribute without permission</li>
              <li>Workout programs and materials are proprietary</li>
            </ul>

            <h3>6.2 Data Sharing</h3>
            <ul>
              <li>Users grant permission to share anonymized, generic fitness results</li>
              <li>Personal identifying information is never shared</li>
              <li>Aggregated statistics may be used for research and platform improvement</li>
            </ul>

            <h3>6.3 User Content</h3>
            <ul>
              <li>Users retain rights to their submitted content</li>
              <li>Users grant us license to use submitted content</li>
              <li>We may remove inappropriate content</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <ul>
              <li>We provide services &quot;as is&quot; without warranties</li>
              <li>Not liable for indirect or consequential damages</li>
              <li>Maximum liability limited to fees paid</li>
              <li>Not responsible for third-party content or services</li>
            </ul>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the application 
              constitutes acceptance of modified terms.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by Indiana state law. Any disputes shall be resolved in Indiana courts.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              Drippy LLC<br />
              Email: baisics.app@gmail.com<br />
              Website: baisics.app
            </p>
            <p>
              For support inquiries, please contact: baisics.app@gmail.com
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
} 