import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy-policy')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main className='mx-auto py-24 sm:py-32 prose prose-headings:text-primary prose-p:text-muted-foreground'>
            <h1>Privacy Policy for czn-showcase.online</h1>
            <p>Last Updated: 17/1/2026</p>
            <h2>1. Introduction</h2>
            <p>
                Welcome to czn-showcase.online ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal information you share with us.
            </p>
            <p>
                This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our services to view or post screenshots of game builds.
            </p>
            <h2>
                2. Information We Collect
            </h2>
            <p>
                We collect information to provide a seamless authentication experience and to host your content securely.
            </p>
            <h3>
                A. Information You Provide via Social Login
            </h3>
            <p>
                We use Better Auth to manage authentication. When you choose to log in using third-party services (Google or Discord), we collect specific information provided by those services. This typically includes:
            </p>
            <ul>
                <li>Account Info: Your name, email address, and verified account status.</li>
                <li>Profile Data: Your public profile name and unique User ID (e.g., Discord ID).</li>
                <li>Note: We do not collect or store your passwords for these third-party accounts.</li>
            </ul>
            <h3>B. User-Generated Content</h3>
            <p>When you post a screenshot of a game build, we collect and store:</p>
            <ul>
                <li>The image file you upload.</li>
                <li>The metadata associated with the post (e.g., title, description, timestamp).</li>
                <li>This content is displayed publicly on the website.</li>
            </ul>
            <h3>C. Automatically Collected Information</h3>
            <p>
                We utilize <strong>Cloudflare</strong> for hosting and security. When you access our site, certain technical data is automatically logged, including:
            </p>
            <ul>
                <li>Log Data: Internet Protocol (IP) address, browser type, operating system, and the pages you visit.</li>
                <li>Performance Data: Information regarding site performance and error logs.</li>
            </ul>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
                <li>Authentication: To create your account and verify your identity via Google or Discord.</li>
                <li>Service Provision: To display your uploaded screenshots and associate them with your user profile.</li>
                <li>Security: To protect the website from abuse, DDoS attacks, and unauthorized access (via Cloudflare's security features).</li>
                <li>Communication: To contact you regarding your account or updates to our policies (using the email provided via social login).</li>
            </ul>
            <h3>4. Third-Party Services</h3>
            <p>
                We utilize the following third-party service providers to operate our website. These providers have access to your information only to perform specific tasks on our behalf.
            </p>
            <ul>
                <li>
                    Cloudflare: We use Cloudflare for hosting, Content Delivery Network (CDN) services, and security. Cloudflare may process log data to detect threats. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Read Cloudflare's Privacy Policy.</a>
                </li>
                <li>
                    Better Auth: We use the Better Auth library to handle the complexity of social logins securely.
                </li>
                <li>
                    Google & Discord: Used for authentication ("OAuth"). Your interaction with these login buttons is governed by the privacy policy of the respective company.
                </li>
            </ul>
            <h2>
                5. Cookies and Local Storage
            </h2>
            <p>We use cookies and local storage (small data files stored on your device) primarily for essential functions:</p>
            <ul>
                <li>Session Management: To keep you logged in as you navigate the site (managed via Better Auth).</li>
                <li>Security: To prevent Cross-Site Request Forgery (CSRF) and other attacks.</li>
            </ul>
            <p>We do not use cookies for third-party advertising tracking.</p>
            <h2>6. Data Retention</h2>
            <p>We retain your personal information and uploaded content only for as long as necessary to fulfill the purposes outlined in this policy.</p>
            <ul>
                <li>
                    Account Data: Retained as long as your account is active.
                </li>
                <li>
                    Screenshots: Retained until you delete them or request your account to be deleted.
                </li>
            </ul>
            <h2>
                7. Your Rights
            </h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
                <li>
                    Access: Request a copy of the personal data we hold about you.
                </li>
                <li>
                    Correction: Request that we correct inaccurate data.
                </li>
                <li>
                    Deletion: Request that we delete your account and associated data (screenshots and profile info).
                </li>
            </ul>
            <p>To exercise these rights, please contact us at the email listed below.</p>
            <h2>8. Children's Privacy</h2>
            <p>
                Our service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
            </p>
            <h2>9. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
                <li>
                    Email: <a href="mailto:contact@czn-showcase.online" className='text-primary'>contact@czn-showcase.online</a>
                </li>
                <li>
                    Website: czn-showcase.online
                </li>
            </ul>
        </main>
    )
}
