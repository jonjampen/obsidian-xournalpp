import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import styles from "./index.module.css";

const FEATURES = [
    {
        title: "Automated PDF Export",
        description:
            "Seamlessly converts xopp files to standard PDFs on save. Your vault PDF attachments and embedded views update in real-time.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
        ),
    },
    {
        title: "Template-Driven Creation",
        description:
            "Create blank or styled xopp documents (ruled, graph, dotted, custom background colors) from pre-configured sizes like A4 or Letter.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        ),
    },
    {
        title: "Fuzzy File Quick-Switch",
        description:
            "Quickly locate and jump to any handwritten xopp file or its PDF export in your vault using a keyboard-driven fuzzy matching modal.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
    },
    {
        title: "Bi-directional Navigation",
        description:
            "Jump straight from a PDF preview inside Obsidian into D-Bus/cli-linked Xournal++ editing with a single context click.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        ),
    },
];

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={styles.heroBanner}>
            <div className="container">
                <Heading as="h1" className={styles.heroTitle}>
                    {siteConfig.title}
                </Heading>
                <p className={styles.heroTagline}>{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link className={clsx("button button--lg", styles.primaryButton)} to="/installation">
                        Get Started
                    </Link>
                    <Link className={clsx("button button--lg", styles.secondaryButton)} to="/docs/Home">
                        Read Docs
                    </Link>
                </div>
            </div>
        </header>
    );
}

function HomepageFeatures() {
    return (
        <section className={styles.featuresSection}>
            <div className={styles.featuresGrid}>
                {FEATURES.map((feat, idx) => (
                    <div key={idx} className={styles.featureCard}>
                        <div className={styles.featureIconWrapper}>{feat.icon}</div>
                        <h3 className={styles.featureTitle}>{feat.title}</h3>
                        <p className={styles.featureDesc}>{feat.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={`${siteConfig.title}`} description="Seamless handwritten notes in your Obsidian vault.">
            <HomepageHeader />
            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
