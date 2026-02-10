import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl opacity-90">Last Updated: November 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 lg:p-12 mb-8">
          {/* Section 1: Introduction */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              1. Introduction
            </h2>
            <p className="mb-4">
              Twenty Two Health LLC, doing business as 22 RPM ("22 RPM," "we,"
              "our," or "us"), owns and operates the website
              www.twentytwohealth.com ("the Site"). We also develop software
              platforms and mobile applications for remote patient monitoring.
              This Website Privacy Policy describes how we collect, use, share,
              and protect personal information collected through the website
              only.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 rounded">
              <p className="font-semibold text-blue-800 mb-2">
                Important Note:
              </p>
              <p>
                This policy applies only to visitors of our website. Any
                collection, use, or disclosure of Protected Health Information
                (PHI) related to remote patient monitoring is governed by our
                separate HIPAA Privacy Policy, which applies to RPM patients and
                clinic-directed users of our software.
              </p>
            </div>
            <p>
              By using this Site or providing information through the Site, you
              consent to the practices described in this Website Privacy Policy.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              2. Information We Collect Through the Website
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                A. Information You Provide Directly
              </h3>
              <p className="mb-4">
                When you interact with features on the Site—including "Learn
                More," contact forms, demo requests, or general inquiries—we may
                collect:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Clinic/organization name</li>
                <li>Job title</li>
                <li>Information you choose to provide in message fields</li>
              </ul>
              <p>
                This information is used to respond to your inquiries, schedule
                product demos, or communicate about 22 RPM services.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                B. Automatically Collected Information
              </h3>
              <p className="mb-4">
                When you visit the Site, we automatically collect certain
                information, including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  "IP address",
                  "Browser type and version",
                  "Operating system",
                  "Referring website",
                  "Pages viewed",
                  "DateTime of visit",
                  "Clickstream data",
                  "Device information",
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-white p-3 rounded border border-gray-200 text-center font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                C. Cookies and Web Tracking Technologies
              </h3>
              <p className="mb-4">
                We use cookies, web beacons, pixels, and similar tools to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Improve site functionality</li>
                <li>Understand how visitors interact with the Site</li>
                <li>Customize website experiences</li>
                <li>Monitor website performance</li>
                <li>Support analytics through Google Analytics</li>
              </ul>
              <p>
                You may disable cookies in your browser settings, but some
                features may not function properly.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                D. Analytics
              </h3>
              <p className="mb-4">
                We use Google Analytics to measure website traffic and visitor
                behavior. Google Analytics may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>IP address</li>
                <li>Device identifiers</li>
                <li>Browsing patterns</li>
                <li>Referring pages</li>
                <li>Interaction data</li>
              </ul>
              <p>
                Google may also set cookies to support these functions. We do
                not combine Google Analytics data with personally identifiable
                information collected from forms.
              </p>
            </div>
          </section>

          {/* Section 3: How We Use Information */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              3. How We Use Website Information
            </h2>
            <p className="mb-6">
              We use information collected through the Site to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { icon: "💬", text: "Respond to inquiries and demo requests" },
                {
                  icon: "📊",
                  text: "Provide information about our products and services",
                },
                { icon: "⚡", text: "Improve website performance and content" },
                { icon: "🔒", text: "Maintain website security" },
                { icon: "📈", text: "Analyze usage trends" },
                {
                  icon: "📧",
                  text: "Send non-PHI marketing communications (if you opt in)",
                },
                { icon: "🛡️", text: "Monitor and prevent fraud or misuse" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <p>
              We may send periodic updates, educational content, or product
              information to visitors who provide an email address. You may
              unsubscribe at any time.
            </p>
          </section>

          {/* Section 4: Information Sharing */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              4. Information Sharing and Disclosure
            </h2>
            <p className="mb-6">
              We may share website-related personal information with:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                A. Service Providers
              </h3>
              <p className="mb-4">Vendors who assist with:</p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Website hosting</li>
                <li>CRM platforms</li>
                <li>Email automation</li>
                <li>Analytics</li>
                <li>Security monitoring</li>
              </ul>
              <p>
                These third parties are contractually obligated to protect your
                information.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                B. Legal or Regulatory Requirements
              </h3>
              <p className="mb-4">We may disclose information:</p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>To comply with valid legal processes</li>
                <li>To respond to government or regulatory requests</li>
                <li>To enforce website terms of use</li>
                <li>To protect rights, privacy, safety, or property</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                C. Business Transfers
              </h3>
              <p>
                If 22 RPM is acquired, merges, or undergoes reorganization,
                website information may be transferred as part of that
                transition.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold text-green-800">
                We do not sell your personal information.
              </h3>
            </div>
          </section>

          {/* Section 5: Third-Party Links */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              5. Links to Third-Party Websites
            </h2>
            <p>
              The Site may contain links to third-party sites that are not owned
              or controlled by 22 RPM. We are not responsible for the privacy
              practices of external websites. We encourage you to review the
              privacy policies of any site you visit.
            </p>
          </section>

          {/* Section 6: Social Media */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              6. Social Media Features
            </h2>
            <p className="mb-4">
              Features such as LinkedIn, X (Twitter), Facebook, or other social
              widgets may appear on our Site. These features may collect:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Your IP address</li>
              <li>Pages visited</li>
              <li>Cookie data</li>
            </ul>
            <p>
              Your interactions with these features are governed by the privacy
              policies of the companies providing them.
            </p>
          </section>

          {/* Section 7: Security */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              7. Security
            </h2>
            <p className="mb-4">
              We implement reasonable administrative, technical, and
              organizational safeguards to protect personal information
              submitted through the Site. While we strive to protect your
              information, no method of electronic transmission is entirely
              secure.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="font-semibold text-blue-800">Note:</p>
              <p>We do not store PHI on the public-facing website.</p>
            </div>
          </section>

          {/* Section 8: Data Retention */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              8. Data Retention
            </h2>
            <p className="mb-4">
              We retain website-related information only as long as necessary
              to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Fulfill the purpose for which it was collected</li>
              <li>Maintain business records</li>
              <li>Comply with legal or regulatory obligations</li>
            </ul>
            <p>Marketing emails can be opted out of at any time.</p>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              9. Children's Privacy
            </h2>
            <p className="mb-4">
              The Site is intended for individuals{" "}
              <strong>18 years of age or older</strong>. We do not knowingly
              collect personal information from children.
            </p>
            <p>
              If you believe a child has provided information through the Site,
              please contact us at <strong>info@twentytwohealth.com</strong>.
            </p>
          </section>

          {/* Section 10: California Rights */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              10. California Privacy Rights
            </h2>
            <p className="mb-4">
              If you are a California resident, you may request:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>
                A list of the categories of personal information disclosed to
                third parties for direct marketing (we do not perform such
                disclosures)
              </li>
              <li>Deletion of certain personal information</li>
              <li>Details regarding specific data collected about you</li>
            </ul>
            <p className="mb-4">We do not respond to "Do Not Track" signals.</p>
            <p>
              To submit a request, email:{" "}
              <strong>info@twentytwohealth.com</strong>
            </p>
          </section>

          {/* Section 11: International Use */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              11. International Use
            </h2>
            <p>
              The Site is intended for U.S. visitors. If you access it from
              outside the U.S., your information may be transferred and
              processed in the United States.
            </p>
          </section>

          {/* Section 12: Updates */}
          <section className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              12. Updates to This Website Privacy Policy
            </h2>
            <p>
              We may update this policy periodically. Changes will be posted to
              this page with a revised "Last Updated" date. Continued use of the
              Site indicates acceptance of any changes.
            </p>
          </section>

          {/* Section 13: Contact */}
          <section className="bg-gray-50 p-8 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              13. Contact Us
            </h2>
            <p className="mb-6">
              For questions or concerns about this Website Privacy Policy:
            </p>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="font-semibold text-lg mb-2">
                Twenty Two Health LLC (22 RPM)
              </p>
              <p className="mb-1">25420 Pyramid Peak Dr</p>
              <p className="mb-1">Santa Clarita, CA 91350</p>
              <p className="font-semibold">Email: info@twentytwohealth.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
