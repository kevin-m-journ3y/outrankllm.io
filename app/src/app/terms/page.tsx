import { Nav } from '@/components/nav/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Terms & Conditions | OutrankLLM',
  description: 'OutrankLLM trial and subscription terms and conditions.',
}

export default function TermsPage() {
  return (
    <>
      <div className="grid-bg" />
      <Nav />

      <main className="relative z-10 px-6" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
          <h1 className="text-4xl font-medium" style={{ marginBottom: '16px' }}>
            Terms & Conditions
          </h1>
          <p className="text-[var(--text-dim)] font-mono text-sm" style={{ marginBottom: '48px' }}>
            Last updated: January 2025
          </p>

          <div className="prose prose-invert" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <p className="text-[var(--text-mid)]">
              These Terms & Conditions (Terms) govern your access to and use of JOURN3Y&apos;s OUTRANK LLM products and services (collectively, OUTRANK LLM), including any free trial and any paid subscription.
            </p>
            <p className="text-[var(--text-mid)]">
              By starting an OUTRANK LLM trial, creating an account, or continuing to use OUTRANK LLM, you agree to these Terms. If you use OUTRANK LLM on behalf of a company or organisation, you confirm you are authorised to accept these Terms on its behalf.
            </p>
            <p className="text-[var(--text-mid)]">
              These Terms apply to customers in Australia and in all other countries, to the extent permitted by local law. If mandatory local law conflicts with these Terms, that law overrides these Terms only to the extent of the conflict.
            </p>

            <Section title="1. Who we are and what these Terms cover">
              <p><strong>1.1</strong> JOURN3Y means JOURN3Y Pty Ltd and its related entities that provide OUTRANK LLM.</p>
              <p><strong>1.2</strong> You means the individual or organisation that registers for an OUTRANK LLM trial or subscription.</p>
              <p><strong>1.3</strong> These Terms cover your access to:</p>
              <ul>
                <li>the OUTRANK LLM web-based applications, interfaces and APIs; and</li>
                <li>any related documentation, onboarding and support we provide for OUTRANK LLM.</li>
              </ul>
            </Section>

            <Section title="2. Trials and contact during the trial">
              <h4 className="font-medium text-[var(--text)]">2.1 Free trial</h4>
              <p>We may offer you a free trial of OUTRANK LLM for a stated period (for example, 7 days). Trial access is for evaluation only and may be limited in features, usage or capacity. We may end or change trial offers at any time.</p>

              <h4 className="font-medium text-[var(--text)]">2.2 Contact during and after the trial</h4>
              <p>By starting a trial, you agree that JOURN3Y may contact you (using the details you provide) during the trial and for a reasonable period afterwards to:</p>
              <ul>
                <li>help you set up and use OUTRANK LLM;</li>
                <li>share guidance and usage insights related to your trial; and</li>
                <li>discuss options to continue with a paid subscription.</li>
              </ul>
              <p>You can opt out of marketing emails at any time by using the unsubscribe link or contacting us. We may still send important service, legal or security notices.</p>

              <h4 className="font-medium text-[var(--text)]">2.3 Conversion from trial to paid</h4>
              <p>We will clearly state on the signup page whether your trial:</p>
              <ul>
                <li>ends automatically unless you choose a paid plan; or</li>
                <li>converts to a paid subscription unless you cancel before the end of the trial.</li>
              </ul>
              <p>We will not charge you for a paid subscription without first telling you the relevant plan, fees and billing terms.</p>
            </Section>

            <Section title="3. Your data and how we handle it">
              <h4 className="font-medium text-[var(--text)]">3.1 Your Data</h4>
              <p>For OUTRANK LLM, &quot;Your Data&quot; primarily consists of:</p>
              <ul>
                <li>contact details (such as name and email address);</li>
                <li>basic business information (such as company or organisation name and domain); and</li>
                <li>limited subscription information that we receive from our billing provider (such as product purchased, subscription status, billing currency, amount paid and renewal dates), which we may store in our customer relationship management (CRM) system.</li>
              </ul>
              <p>We do not ask you to upload production databases or sensitive personal data into OUTRANK LLM as part of the standard service, and we do not store full payment card numbers or card verification codes.</p>

              <h4 className="font-medium text-[var(--text)]">3.2 Ownership</h4>
              <p>You retain all rights, title and interest in and to Your Data. JOURN3Y does not claim ownership of Your Data.</p>

              <h4 className="font-medium text-[var(--text)]">3.3 How we use Your Data</h4>
              <p>We use Your Data only to:</p>
              <ul>
                <li>create and manage your OUTRANK LLM account and subscription (including storing subscription details in our CRM);</li>
                <li>run your trial and any paid subscription;</li>
                <li>communicate with you about your trial, usage and subscription options;</li>
                <li>operate, protect and improve OUTRANK LLM (for example, basic usage analytics and abuse prevention); and</li>
                <li>comply with our legal and regulatory obligations.</li>
              </ul>
              <p>We do not sell Your Data. We do not use Your Data to train general-purpose models for other customers in a way that would reveal your identity or confidential information.</p>
              <p>We may use aggregated and de-identified information derived from Your Data and your use of OUTRANK LLM (for example, high-level usage metrics) to analyse trends and improve our services, provided it does not identify you or your organisation.</p>

              <h4 className="font-medium text-[var(--text)]">3.4 Privacy and security</h4>
              <p>Because we mainly store contact, business details and subscription metadata, our security controls are proportionate to this limited risk profile. We apply reasonable technical and organisational measures designed to protect Your Data against unauthorised access, use or disclosure. Our handling of personal information is further described in our <a href="https://www.journ3y.com.au/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--green)] hover:underline">Privacy Policy</a>, which forms part of these Terms.</p>

              <h4 className="font-medium text-[var(--text)]">3.5 Data location and transfers</h4>
              <p>Your Data may be processed in data centres or by trusted subprocessors located in Australia or other countries, but only as needed to provide OUTRANK LLM and related services. Where required by law, we will ensure that any international transfers of personal information are subject to appropriate legal safeguards.</p>

              <h4 className="font-medium text-[var(--text)]">3.6 Your responsibilities for data</h4>
              <p>You are responsible for:</p>
              <ul>
                <li>ensuring that any contact, business and subscription information you provide is accurate; and</li>
                <li>not entering into OUTRANK LLM any data that you are prohibited from sharing under law, contract or internal policy. If you choose to input additional content (for example, sample customer information or internal text), you are responsible for ensuring that doing so is lawful and appropriate.</li>
              </ul>

              <h4 className="font-medium text-[var(--text)]">3.7 Payment information handled by Stripe</h4>
              <p>We use third-party payment processor(s), such as Stripe, to handle subscription billing and payments for OUTRANK LLM. JOURN3Y does not store or process your full payment card numbers or card verification values (CVV/CVC). These details are collected and processed directly by Stripe (or other payment processor) in accordance with their own terms and privacy policies.</p>
              <p>We may receive limited billing and subscription information from Stripe (for example, which product or plan you have purchased, billing currency, amount paid, payment status and renewal dates) so that we can manage your subscription, provide support and maintain accurate records in our CRM. You must not send payment card details to us by email, chat or any unsupported channel.</p>
            </Section>

            <Section title="4. Your use of OUTRANK LLM">
              <h4 className="font-medium text-[var(--text)]">4.1 Licence</h4>
              <p>Subject to these Terms, we grant you a limited, non-exclusive, non-transferable licence to access and use OUTRANK LLM for your internal business purposes during your trial and, if applicable, your paid subscription term.</p>

              <h4 className="font-medium text-[var(--text)]">4.2 Acceptable use</h4>
              <p>You must not:</p>
              <ul>
                <li>use OUTRANK LLM in any way that is unlawful, harmful, fraudulent, misleading or infringes the rights of others;</li>
                <li>attempt to gain unauthorised access to OUTRANK LLM or related systems;</li>
                <li>attempt to reverse engineer, decompile or otherwise derive the source code or underlying models (except where and to the minimum extent permitted by law);</li>
                <li>use OUTRANK LLM or its outputs to develop or train competing AI or large language models without our prior written consent;</li>
                <li>attempt to bypass usage limits, security or access controls; or</li>
                <li>interfere with or disrupt the integrity, availability or performance of OUTRANK LLM.</li>
              </ul>

              <h4 className="font-medium text-[var(--text)]">4.3 Accounts and access control</h4>
              <p>You are responsible for:</p>
              <ul>
                <li>keeping your account credentials secure;</li>
                <li>ensuring that only authorised users access OUTRANK LLM; and</li>
                <li>all activities that occur under your accounts.</li>
              </ul>
              <p>You must promptly notify us if you become aware of any unauthorised access to your accounts or to OUTRANK LLM.</p>
            </Section>

            <Section title="5. Fees, billing and taxes (paid subscriptions)">
              <h4 className="font-medium text-[var(--text)]">5.1 Trials</h4>
              <p>Free trials are provided at no charge for the stated trial period, subject to any usage or feature limits and these Terms.</p>

              <h4 className="font-medium text-[var(--text)]">5.2 Paid subscriptions</h4>
              <p>If you move to a paid subscription:</p>
              <ul>
                <li>fees, billing cycles, usage limits and payment terms will be stated at checkout or in an order form;</li>
                <li>unless stated otherwise, fees are billed in advance and are non-refundable, except where required by law;</li>
                <li>we may change our fees for future terms, with reasonable prior notice. Fee changes do not affect a current committed term unless you agree; and</li>
                <li>subscription payments are processed via third-party payment processors such as Stripe. Your use of those services may be subject to additional terms and privacy policies provided by the payment processor.</li>
              </ul>
              <p>We may store basic subscription details (such as plan, currency, amount paid and renewal dates) in our CRM for invoicing, customer support and analytics purposes.</p>

              <h4 className="font-medium text-[var(--text)]">5.3 Taxes</h4>
              <p>Fees are exclusive of any applicable taxes (including GST, VAT or sales tax). You are responsible for paying any such taxes, unless we state otherwise.</p>
            </Section>

            <Section title="6. Intellectual property and outputs">
              <h4 className="font-medium text-[var(--text)]">6.1 Our intellectual property</h4>
              <p>JOURN3Y and its licensors own all intellectual property rights in and to OUTRANK LLM, including the underlying software, models, algorithms, user interfaces, documentation and branding. Except for the limited rights expressly granted in these Terms, no rights are transferred to you.</p>

              <h4 className="font-medium text-[var(--text)]">6.2 Outputs and your use of them</h4>
              <p>Subject to these Terms and applicable law, you may use the responses and outputs generated by OUTRANK LLM for your internal business purposes. You are responsible for independently reviewing and validating outputs for accuracy, completeness, compliance and suitability before relying on them, sharing them, or using them to make decisions.</p>
            </Section>

            <Section title="7. Confidentiality">
              <h4 className="font-medium text-[var(--text)]">7.1 Our obligations</h4>
              <p>We will treat Your Data and any non-public information you provide to us as confidential and will not disclose it to third parties except:</p>
              <ul>
                <li>to our employees, contractors and subprocessors who need access to provide OUTRANK LLM and who are bound by confidentiality obligations;</li>
                <li>where you instruct or authorise us to do so; or</li>
                <li>where we are required to do so by law, regulation, court order or other government authority.</li>
              </ul>

              <h4 className="font-medium text-[var(--text)]">7.2 Your obligations</h4>
              <p>You agree to keep confidential any non-public information about OUTRANK LLM or JOURN3Y (including our systems, security, roadmaps and pricing) that we share with you, and to use it only for purposes related to your use of OUTRANK LLM.</p>
            </Section>

            <Section title="8. Service changes, availability and support">
              <h4 className="font-medium text-[var(--text)]">8.1 Changes to OUTRANK LLM</h4>
              <p>We may update or modify OUTRANK LLM from time to time, including by adding, changing or removing features, interfaces or integrations. For paid subscription terms, we will not intentionally make changes that remove core functionality you are already using in a way that materially and negatively affects you, unless required for security, legal or operational reasons.</p>

              <h4 className="font-medium text-[var(--text)]">8.2 Availability</h4>
              <p>We aim to provide a reliable service, but we do not promise that OUTRANK LLM will always be available or free from errors, interruptions or delays. Planned maintenance, third-party failures, network issues and other events may affect availability.</p>

              <h4 className="font-medium text-[var(--text)]">8.3 Support</h4>
              <p>We provide reasonable technical support for OUTRANK LLM in line with our then-current plans or any applicable order form. Support for trials may be limited and on a best-efforts basis.</p>
            </Section>

            <Section title="9. Suspension and termination">
              <h4 className="font-medium text-[var(--text)]">9.1 Suspension</h4>
              <p>We may suspend or restrict your access to OUTRANK LLM (in whole or in part) immediately if we reasonably believe that:</p>
              <ul>
                <li>you are breaching these Terms;</li>
                <li>your use creates a security, legal or operational risk; or</li>
                <li>we are required to do so by law or by a regulator.</li>
              </ul>
              <p>We will act reasonably and, where practical, notify you before or promptly after any suspension.</p>

              <h4 className="font-medium text-[var(--text)]">9.2 Termination by you</h4>
              <p>You may end your trial at any time by stopping use of OUTRANK LLM. For paid subscriptions, you may terminate in line with the cancellation or notice terms presented when you subscribed or agreed in an order form.</p>

              <h4 className="font-medium text-[var(--text)]">9.3 Termination by us</h4>
              <p>We may terminate your access to OUTRANK LLM (trial or paid) by written notice if:</p>
              <ul>
                <li>you materially breach these Terms and do not remedy that breach within a reasonable time after we notify you; or</li>
                <li>we decide to discontinue OUTRANK LLM generally.</li>
              </ul>

              <h4 className="font-medium text-[var(--text)]">9.4 Effect of termination</h4>
              <p>On termination or expiry:</p>
              <ul>
                <li>your right to access and use OUTRANK LLM ends; and</li>
                <li>we may delete or de-identify Your Data after a reasonable retention period, except where we are legally required to retain it.</li>
              </ul>
            </Section>

            <Section title="10. Disclaimers and limitation of liability">
              <h4 className="font-medium text-[var(--text)]">10.1 AI outputs and reliance</h4>
              <p>OUTRANK LLM uses probabilistic AI models. Outputs may occasionally be incomplete, inaccurate, misleading or inappropriate. OUTRANK LLM is not a substitute for your own professional judgement or independent verification. You are solely responsible for how you use and rely on any outputs.</p>

              <h4 className="font-medium text-[var(--text)]">10.2 No implied warranties (subject to mandatory law)</h4>
              <p>To the maximum extent permitted by law, OUTRANK LLM is provided &quot;as is&quot; and &quot;as available&quot;, and we exclude all warranties, representations and guarantees that are not expressly stated in these Terms, including any implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
              <p>Nothing in these Terms excludes, restricts or modifies any consumer guarantees, rights or remedies that cannot be excluded under the Australian Consumer Law or other mandatory local laws. Where such guarantees apply and can be limited, our liability is limited, at our option, to resupplying the services or paying the cost of having the services resupplied.</p>

              <h4 className="font-medium text-[var(--text)]">10.3 Limitation of liability</h4>
              <p>Given the limited nature of the data we store (primarily contact, business and subscription metadata), and to the maximum extent permitted by law, JOURN3Y&apos;s total aggregate liability arising out of or in connection with OUTRANK LLM and these Terms (whether in contract, tort, statute or otherwise) is limited to the greater of:</p>
              <ul>
                <li>the total amount of fees you paid for OUTRANK LLM in the 12 months immediately before the event giving rise to the claim; or</li>
                <li>AUD $500 for users who have only used a free trial and not paid fees.</li>
              </ul>

              <h4 className="font-medium text-[var(--text)]">10.4 Excluded types of loss</h4>
              <p>To the maximum extent permitted by law, JOURN3Y is not liable for any:</p>
              <ul>
                <li>loss of profits, revenue, goodwill, data (beyond the basic contact, business and subscription data we hold), or anticipated savings; or</li>
                <li>indirect, consequential, special, exemplary or punitive damages,</li>
              </ul>
              <p>arising out of or in connection with OUTRANK LLM or these Terms, even if we have been advised of the possibility of such loss.</p>
            </Section>

            <Section title="11. Governing law and disputes">
              <p><strong>11.1</strong> If you are located in Australia, these Terms are governed by the laws of New South Wales, Australia, and the parties submit to the exclusive jurisdiction of the courts of New South Wales and the Federal Court of Australia (Sydney Registry).</p>
              <p><strong>11.2</strong> If you are located outside Australia, these Terms are also governed by the laws of New South Wales, Australia, without regard to conflict-of-laws principles, unless mandatory local law requires a different law.</p>
              <p>The United Nations Convention on Contracts for the International Sale of Goods does not apply.</p>
            </Section>

            <Section title="12. Changes to these Terms">
              <p>We may update these Terms from time to time. If we make material changes, we will provide reasonable notice (for example by email, in-product notification or on our website) and indicate the date of the latest update. Your continued use of OUTRANK LLM after the updated Terms take effect constitutes your acceptance of them. If you do not agree to the updated Terms, you must stop using OUTRANK LLM.</p>
            </Section>

            <Section title="13. Contact">
              <p>If you have questions about these Terms, your trial or subscription, or how we handle your information, you can contact us at:</p>
              <p className="font-mono">
                JOURN3Y Pty Ltd<br />
                Email: <a href="mailto:info@journ3y.com.au" className="text-[var(--green)] hover:underline">info@journ3y.com.au</a>
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-medium text-[var(--text)]" style={{ marginBottom: '16px' }}>
        {title}
      </h2>
      <div className="terms-content text-[var(--text-mid)] text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </section>
  )
}
