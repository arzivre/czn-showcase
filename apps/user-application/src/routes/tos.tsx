import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tos')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main className='mx-auto py-24 sm:py-32 prose prose-headings:text-primary prose-p:text-muted-foreground'>
            <h1>Terms of Service for czn-showcase.online</h1>
            <p> Last Updated:  17/1/2026</p>
            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing and using czn-showcase.online ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
            <h2>2. Accounts and Authentication</h2>
            <p>
                To post content, you must register for an account using our supported social login providers (Google or Discord) via Better Auth.
            </p>
            <ul>
                <li>Account Security: You are responsible for maintaining the security of your third-party accounts (Google/Discord). We are not liable for any loss or damage arising from your failure to protect your login credentials.</li>
                <li>Eligibility: You must be at least 13 years old to use this Service.</li>
                <li>Termination: We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.</li>
            </ul>
            <h2>3. User-Generated Content (UGC)</h2>
            <p>
                The core feature of czn-showcase.online allows users to upload screenshots of game builds.
            </p>

            <h3>A. Ownership</h3>
            <p>
                You retain full ownership rights to the content (screenshots and text) you upload. We do not claim ownership over your intellectual property.
            </p>
            <h3>B. License to Us</h3>
            <p>
                By uploading content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, host, store, reproduce, modify (e.g., resizing for thumbnails), and display your content solely for the purpose of operating and promoting the website.
            </p>
            <h3>
                C. Content Guidelines
            </h3>
            <p>
                You agree not to upload content that:
            </p>
            <ul>
                <li>Infringes on the copyright or intellectual property rights of others (e.g., do not post leaked assets you do not have permission to share).</li>
                <li>Contains hate speech, harassment, or explicit violence.</li>
                <li>Contains sexually explicit material or pornography.</li>
                <li>Contains malware, viruses, or malicious code.</li>
            </ul>
            <p>We reserve the right to remove any content that violates these guidelines without prior notice.</p>
            <h2>4. Copyright Complaints (DMCA)</h2>
            <p>
                We respect the intellectual property of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please contact us at <a href="mailto:contact@czn-showcase.online" className='text-primary'>contact@czn-showcase.online</a> with the subject line "Copyright Infringement."
            </p>
            <h2>5. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul>
                <li>Use the Service for any illegal purpose.</li>
                <li>Attempt to bypass the authentication measures (Better Auth) or security measures provided by our host (Cloudflare).</li>
                <li>Scrape or automatically collect data from the website without permission.</li>
                <li>Interfere with the proper working of the Service (e.g., DDoS attacks).</li>
            </ul>
            <h2>6. Disclaimers</h2>
            <ul>
                <li>"As Is" Basis: The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that the Service will be uninterrupted, secure, or error-free.</li>
                <li>Data Loss: While we use reliable hosting (Cloudflare), we are not responsible for the loss of any screenshots or data. Users should keep backups of their own work.</li>
            </ul>
            <h2>7. Limitation of Liability</h2>
            <p>
                To the fullest extent permitted by law, czn-showcase.online shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the Service.
            </p>
            <h2>8. Governing Law</h2>
            <p>
                The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the
                Service. Your use of the Application may also be subject to other local, state, national, or international laws.
            </p>
            <h2>9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify users of significant changes by posting a notice on the website. Your continued use of the Service after changes constitute acceptance of the new Terms.</p>
            <h2>10. Contact Information</h2>
            <p>
                If you have any questions about these Terms, please contact us at:
            </p>
            <ul>
                <li>
                    Email: <a href="mailto:contact@czn-showcase.online" className='text-primary'>contact@czn-showcase.online</a>
                </li>
            </ul>
        </main>
    )
}
