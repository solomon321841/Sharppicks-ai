import { LegalPageLayout } from "@/components/landing/LegalPageLayout"

export default function PrivacyPage() {
    return (
        <LegalPageLayout
            title="Privacy Policy"
            subtitle="Your data security is our priority."
        >
            <section>
                <h2>1. Information We Collect</h2>
                <p>
                    We collect information you provide directly to us when you create an account, such as your name, email address, and payment information. We also collect usage data to improve our AI models and user experience.
                </p>
            </section>

            <section>
                <h2>2. How We Use Data</h2>
                <p>
                    Your data is used to:
                </p>
                <ul>
                    <li>Personalize your analytics dashboard.</li>
                    <li>Process subscription payments via our secure partners.</li>
                    <li>Improve our proprietary AI algorithms.</li>
                    <li>Send relevant service updates and informational content.</li>
                </ul>
            </section>

            <section>
                <h2>3. Data Security</h2>
                <p>
                    We implement industry-standard security measures to protect your personal information. We do not sell your personal data to third parties. Our payment processing is handled by Stripe, ensuring your financial details are never stored on our servers.
                </p>
            </section>

            <section>
                <h2>4. Cookies and Tracking</h2>
                <p>
                    ProfitPicks AI uses cookies and similar technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies, though some parts of the service may not function correctly.
                </p>
            </section>

            <section>
                <h2>5. Updates to This Policy</h2>
                <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
            </section>
        </LegalPageLayout>
    )
}
