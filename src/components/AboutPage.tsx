import React from "react";
import { ArrowLeft, BookOpen, Brain, Eye, Zap, Users, Heart } from "lucide-react";

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const [activeSection, setActiveSection] = React.useState<"about" | "privacy" | "terms" | "cookies">("about");

  return (
    <div className="min-h-screen bg-[#F7F4EE] font-sans">
      {/* Header */}
      <div className="bg-white border-b border-[#DCD9D0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[#5B8FB9] hover:text-[#3A6F9A] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Incluread
          </button>
          <div className="flex gap-1 ml-auto">
            {(["about", "privacy", "terms", "cookies"] as const).map((s) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeSection === s ? "bg-[#5B8FB9] text-white" : "text-slate-500 hover:text-slate-800"}`}>
                {s === "about" ? "About" : s === "privacy" ? "Privacy" : s === "terms" ? "Terms" : "Cookies"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* ── ABOUT ── */}
        {activeSection === "about" && (
          <div className="space-y-16">
            {/* Hero */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EEF5FA] text-[#5B8FB9] text-xs font-black rounded-full uppercase tracking-widest">
                <Heart className="w-3.5 h-3.5" /> Accessible reading for every mind
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#111111] leading-tight">
                Reading should never<br />
                <span className="text-[#5B8FB9]">feel like a barrier.</span>
              </h1>
              <p className="text-lg text-[#444444] max-w-2xl mx-auto leading-relaxed">
                Incluread is an accessible reading platform designed to make digital content easier to read, understand, and retain for people with dyslexia, ADHD, visual stress, and other reading challenges.
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#DCD9D0] rounded-2xl p-8 space-y-3">
                <div className="w-10 h-10 bg-[#EEF5FA] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#5B8FB9]" />
                </div>
                <h2 className="text-xl font-black text-[#111111]">Our Mission</h2>
                <p className="text-sm text-[#444444] leading-relaxed">
                  To transform reading into a personalised experience that works with — not against — how each person's brain processes text. We believe reading access is a right, not a privilege.
                </p>
              </div>
              <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl p-8 space-y-3">
                <div className="w-10 h-10 bg-[#00A795]/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00A795]" />
                </div>
                <h2 className="text-xl font-black text-white">Our Vision</h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A world where every digital reader has instant access to tools that match their cognitive profile — without stigma, without friction, without compromise on content quality.
                </p>
              </div>
            </div>

            {/* How Incluread changes lives */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-[#111111]">How Incluread is changing lives</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: <Brain className="w-5 h-5 text-[#5B8FB9]" />, title: "Reduces cognitive load", body: "Syllable breaks, bionic reading anchors, and word spacing reduce the mental effort of decoding text — freeing the brain to focus on meaning rather than letter-by-letter recognition." },
                  { icon: <Eye className="w-5 h-5 text-[#5B8FB9]" />, title: "Eliminates visual stress", body: "Tinted backgrounds, adjustable letter spacing, and focus line overlays address the visual crowding and tracking difficulty that cause fatigue in 40–50% of people with dyslexia." },
                  { icon: <Users className="w-5 h-5 text-[#5B8FB9]" />, title: "Builds reading confidence", body: "AI-powered simplification, vocabulary assistance, and chapter summaries give readers the scaffolding to approach challenging texts without anxiety or avoidance." },
                ].map(({ icon, title, body }) => (
                  <div key={title} className="bg-white border border-[#DCD9D0] rounded-xl p-6 space-y-3">
                    <div className="w-9 h-9 bg-[#EEF5FA] rounded-lg flex items-center justify-center">{icon}</div>
                    <h3 className="text-sm font-black text-[#111111]">{title}</h3>
                    <p className="text-xs text-[#555555] leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Research foundation */}
            <div className="bg-white border border-[#DCD9D0] rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-black text-[#111111]">Built on research</h2>
              <p className="text-sm text-[#444444] leading-relaxed">
                Every feature in Incluread is grounded in peer-reviewed dyslexia and reading science. We don't ship features because they're trendy — we ship them because the evidence supports them.
              </p>
              <div className="space-y-4">
                {[
                  {
                    finding: "Increased letter and word spacing significantly improves reading speed and accuracy in dyslexic readers.",
                    citation: "Zorzi et al. (2012). Extra-large letter spacing improves reading in dyslexia. PNAS, 109(28), 11455–11459.",
                    feature: "Letter & Word Spacing controls"
                  },
                  {
                    finding: "Tinted overlays and coloured backgrounds reduce visual stress symptoms in 40% of people with dyslexia.",
                    citation: "Wilkins, A.J. (2003). Reading Through Colour. Wiley. / Singleton & Henderson (2007). Computerised screening for visual stress in reading.",
                    feature: "5 background colour themes"
                  },
                  {
                    finding: "Fonts designed for dyslexia (OpenDyslexic, Lexend, Atkinson) reduce letter confusion by increasing unique character shapes.",
                    citation: "Rello & Baeza-Yates (2013). Good fonts for dyslexia. ACM ASSETS. / Benton et al. (2004). Atkinson Hyperlegible design principles.",
                    feature: "Dyslexia-optimised font selection"
                  },
                  {
                    finding: "Simultaneous reading and listening (bimodal input) improves comprehension and word retention for poor readers.",
                    citation: "Rogowsky et al. (2016). Matching learning style to instructional method. J. of Educational Research, 109(1), 64–78.",
                    feature: "Read + Audio mode with sentence highlighting"
                  },
                  {
                    finding: "Breaking words into syllables at the point of reading supports phonological decoding — the core deficit in dyslexia.",
                    citation: "Shaywitz, S. (2003). Overcoming Dyslexia. Knopf. / Dehaene et al. (2010). How learning to read changes the cortical networks for vision and language. Science.",
                    feature: "Syllable breaking mode"
                  },
                  {
                    finding: "Line lengths of 45–75 characters reduce tracking errors and re-reading in readers with visual processing difficulties.",
                    citation: "British Dyslexia Association (2018). Dyslexia Style Guide. / Schneps et al. (2013). E-readers are more effective than paper for some with dyslexia. PLOS ONE.",
                    feature: "Max-width reading column (720px)"
                  },
                ].map(({ finding, citation, feature }) => (
                  <div key={feature} className="border-l-2 border-[#5B8FB9] pl-4 space-y-1">
                    <p className="text-xs font-bold text-[#111111]">{feature}</p>
                    <p className="text-xs text-[#444444] leading-relaxed">{finding}</p>
                    <p className="text-[10px] text-[#888888] italic">{citation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { stat: "1 in 5", label: "people have dyslexia globally" },
                { stat: "70%", label: "of dyslexic readers avoid reading for pleasure" },
                { stat: "6×", label: "reading speed improvement possible with proper font & spacing" },
                { stat: "40%", label: "reduction in visual stress with tinted backgrounds" },
              ].map(({ stat, label }) => (
                <div key={label} className="bg-white border border-[#DCD9D0] rounded-xl p-5 text-center">
                  <p className="text-2xl font-black text-[#5B8FB9]">{stat}</p>
                  <p className="text-[11px] text-[#555555] mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRIVACY POLICY ── */}
        {activeSection === "privacy" && (
          <div className="bg-white border border-[#DCD9D0] rounded-2xl p-8 space-y-6 text-sm text-[#333333] leading-relaxed">
            <div>
              <h1 className="text-2xl font-black text-[#111111] mb-1">Privacy Policy</h1>
              <p className="text-xs text-[#888888]">Last updated: June 2026</p>
            </div>
            {[
              { title: "1. Who we are", body: "Nara (\"we\", \"us\", \"our\") is an accessible reading platform available at nara.quest. For privacy enquiries, contact hello@nara.quest." },
              { title: "2. What data we collect", body: "Account data: email address when you sign in via magic link. Reading preferences: font, theme, text size, spacing — stored locally and optionally in your account. Reading progress: chapter position, bookmarks, reading time — stored per-account to sync across devices. We do not collect names, payment data, or sensitive personal information." },
              { title: "3. How we use your data", body: "Solely to provide and improve the reading experience: syncing your preferences, restoring reading position, and displaying personalised reading statistics. We never sell, rent, or share your data with third parties for commercial purposes." },
              { title: "4. Third-party services", body: "Firebase (Google): authentication and database. Anthropic Claude API: AI reading assistance — text you send for explanation or simplification is processed by Anthropic. Open Library (Internet Archive): public domain book catalogue. None of these services receive your email address or personal data beyond what is necessary for the specific function." },
              { title: "5. Data retention", body: "Your account data is retained as long as your account is active. You may delete your account and all associated data at any time by emailing hello@nara.quest. Reading statistics for guest users reset daily; registered users reset every 30 days." },
              { title: "6. Your rights (GDPR)", body: "If you are in the EU/EEA or UK, you have the right to access, correct, or erase your personal data. You may also object to processing or request data portability. Contact hello@nara.quest to exercise these rights." },
              { title: "7. Children", body: "Incluread is designed for users aged 6 and above. Children under 13 must use Incluread with parental consent. We do not knowingly collect data from children without parental permission." },
              { title: "8. Changes", body: "We will notify registered users of material changes to this policy by email. Continued use of Incluread after changes constitutes acceptance of the updated policy." },
            ].map(({ title, body }) => (
              <div key={title} className="space-y-1">
                <h2 className="font-bold text-[#111111]">{title}</h2>
                <p className="text-xs text-[#444444]">{body}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── TERMS OF USE ── */}
        {activeSection === "terms" && (
          <div className="bg-white border border-[#DCD9D0] rounded-2xl p-8 space-y-6 text-sm text-[#333333] leading-relaxed">
            <div>
              <h1 className="text-2xl font-black text-[#111111] mb-1">Terms of Use</h1>
              <p className="text-xs text-[#888888]">Last updated: June 2026</p>
            </div>
            {[
              { title: "1. Acceptance", body: "By accessing or using Incluread at nara.quest, you agree to these Terms of Use. If you do not agree, please do not use the service." },
              { title: "2. Description of service", body: "Incluread is a web-based accessible reading platform that provides reading aids, AI-powered text assistance, and access to public domain literature. The service is provided as-is." },
              { title: "3. User accounts", body: "You may use Incluread without an account. Creating an account (via email magic link) allows you to sync preferences across devices. You are responsible for maintaining the security of your account." },
              { title: "4. Acceptable use", body: "You agree not to: attempt to reverse engineer or scrape the platform; use the AI features to generate harmful, misleading, or illegal content; circumvent any access controls; or use the service in a way that disrupts other users." },
              { title: "5. Intellectual property", body: "Books available through the Open Library integration are public domain works. Incluread's interface, branding, and codebase are proprietary. You may not reproduce, distribute, or create derivative works without written permission." },
              { title: "6. AI-generated content", body: "Text simplifications, explanations, and summaries are generated by AI and may contain errors. They are provided as reading aids only, not as authoritative interpretations of the source text." },
              { title: "7. Disclaimer", body: "Incluread is provided without warranties of any kind. We do not guarantee uninterrupted access or that the service will meet all accessibility needs." },
              { title: "8. Limitation of liability", body: "To the fullest extent permitted by law, Incluread shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service." },
              { title: "9. Governing law", body: "These terms are governed by the laws of the European Union and, where applicable, Polish law, without regard to conflict of law provisions." },
              { title: "10. Contact", body: "For questions about these terms, contact hello@nara.quest." },
            ].map(({ title, body }) => (
              <div key={title} className="space-y-1">
                <h2 className="font-bold text-[#111111]">{title}</h2>
                <p className="text-xs text-[#444444]">{body}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── COOKIE POLICY ── */}
        {activeSection === "cookies" && (
          <div className="bg-white border border-[#DCD9D0] rounded-2xl p-8 space-y-6 text-sm text-[#333333] leading-relaxed">
            <div>
              <h1 className="text-2xl font-black text-[#111111] mb-1">Cookie Policy</h1>
              <p className="text-xs text-[#888888]">Last updated: June 2026</p>
            </div>
            <p className="text-xs text-[#444444]">Incluread uses minimal cookies and local storage to function. We do not use advertising cookies, tracking pixels, or third-party analytics.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F4EE]">
                    <th className="text-left p-3 border border-[#DCD9D0] font-bold">Name</th>
                    <th className="text-left p-3 border border-[#DCD9D0] font-bold">Type</th>
                    <th className="text-left p-3 border border-[#DCD9D0] font-bold">Purpose</th>
                    <th className="text-left p-3 border border-[#DCD9D0] font-bold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "nara_cookie_consent", type: "Essential", purpose: "Stores your cookie consent choice", duration: "1 year" },
                    { name: "lumina_preferences", type: "Functional", purpose: "Saves your reading preferences (font, theme, spacing)", duration: "Persistent" },
                    { name: "lumina_position", type: "Functional", purpose: "Saves your reading position in a book", duration: "Persistent" },
                    { name: "lumina_stats", type: "Functional", purpose: "Stores local reading statistics", duration: "Session / 30 days" },
                    { name: "lumina_saved_book_ids", type: "Functional", purpose: "Remembers books saved to your shelf", duration: "Persistent" },
                    { name: "emailForSignIn", type: "Essential", purpose: "Temporarily stores email for magic link sign-in", duration: "Session" },
                    { name: "Firebase Auth", type: "Essential", purpose: "Maintains your authentication session", duration: "Session" },
                  ].map(({ name, type, purpose, duration }) => (
                    <tr key={name} className="border-b border-[#DCD9D0]">
                      <td className="p-3 border border-[#DCD9D0] font-mono text-[10px]">{name}</td>
                      <td className="p-3 border border-[#DCD9D0]">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${type === "Essential" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{type}</span>
                      </td>
                      <td className="p-3 border border-[#DCD9D0]">{purpose}</td>
                      <td className="p-3 border border-[#DCD9D0]">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2">
              <h2 className="font-bold text-[#111111]">Managing cookies</h2>
              <p className="text-xs text-[#444444]">You can clear all Incluread cookies at any time by clearing your browser's local storage and cookies for nara.quest. Note that doing so will reset your reading preferences and sign you out. Incluread cannot function without essential cookies.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}