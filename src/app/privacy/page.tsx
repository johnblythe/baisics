import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="prose prose-slate prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h3:mt-6 prose-p:text-gray-600 prose-ul:text-gray-600 prose-li:marker:text-gray-400 max-w-none">
            <div className="mb-12">
              <h1 className="mb-3">Privacy Policy</h1>
              <p className="text-gray-500 text-lg mt-0">Last Updated: December 30, 2024</p>
            </div>

            <h2>1. Introduction</h2>
            <p>
              Welcome to Baisics (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our fitness application and services.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <ul>
              <li>Account Information: email address, name, password</li>
              <li>Profile Information: height, weight, body fat percentage</li>
              <li>Fitness Data: workout programs, exercise records, training statistics</li>
              <li>Progress Tracking: performance metrics, body measurements</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <ul>
              <li>Device information</li>
              <li>Usage data and analytics</li>
              <li>Log data</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Create and manage your account</li>
              <li>Generate personalized workout programs</li>
              <li>Track your fitness progress</li>
              <li>Communicate with you about our services</li>
              <li>Improve our application and user experience</li>
              <li>Ensure the security of our services</li>
            </ul>

            <h2>4. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Your assigned fitness coach</li>
              <li>Service providers and partners who assist in operating our application</li>
              <li>Legal authorities when required by law</li>
              <li>Other users only with your explicit consent</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal 
              information, including:
            </p>
            <ul>
              <li>Encryption of sensitive data</li>
              <li>Regular security assessments</li>
              <li>Secure user authentication</li>
              <li>Regular backups</li>
              <li>Access controls</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply 
              with legal obligations. You may request deletion of your account at any time.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
} 