import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./InstallationPage.module.css";
import clsx from "clsx";

const GITHUB_OWNER = "jonjampen";
const GITHUB_REPO = "obsidian-xournalpp";

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function InstallationHeader() {
    return (
        <header className={styles.heroBanner}>
            <div className="container">
                <h1 className={styles.heroTitle}>Installation</h1>
                <p className={styles.heroSubtitle}>
                    Choose how you want to install and get started with the Obsidian Xournal++ Plugin
                </p>
            </div>
        </header>
    );
}

function CopyLinkButton({ url }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button className={styles.btnSecondary} onClick={handleCopy} type="button" style={{ cursor: "pointer" }}>
            {copied ? "Copied! ✅" : "Copy Plugin Link"}
        </button>
    );
}

export default function InstallationPage() {
    const [stable, setStable] = useState(null);
    const [beta, setBeta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReleases() {
            try {
                const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`);
                const releases = await res.json();

                if (Array.isArray(releases)) {
                    const latestStable = releases.find((r) => !r.prerelease);
                    setStable(latestStable);
                    const latestBeta = releases.find((r) => r.prerelease);
                    setBeta(latestBeta);
                }
            } catch (error) {
                console.error("Failed to fetch releases:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchReleases();
    }, []);

    return (
        <Layout title="Installation" description="Install the Obsidian Xournal++ Plugin">
            <InstallationHeader />
            <main>
                <div className={styles.container}>
                    {loading ? (
                        <div className={styles.loading}>Loading release information...</div>
                    ) : (
                        <div className={styles.installGrid}>
                            {/* Stable Release */}
                            {stable && (
                                <div className={styles.installCard}>
                                    <div className={styles.cardBody}>
                                        <div className={styles.releaseTitle}>
                                            Stable Release
                                            <span className={styles.badgeStable}>STABLE</span>
                                        </div>
                                        <div className={styles.versionNumber}>{stable.name || stable.tag_name}</div>
                                        <div className={styles.releaseDate}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            Released on {formatDate(stable.published_at)}
                                        </div>
                                        <div className={styles.releaseDescription}>
                                            The latest stable version. Recommended for daily production vaults and most
                                            users to ensure reliability and notes safety.
                                        </div>

                                        <div className={styles.buttonGroup}>
                                            <div className={styles.buttonRow}>
                                                <Link
                                                    className={styles.btnPrimary}
                                                    to="https://obsidian.md/plugins?id=xournalpp"
                                                >
                                                    Install Plugin
                                                </Link>
                                            </div>
                                            <Link className={styles.btnLink} to="/docs/Installation">
                                                Go to Installation Guide &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Beta Release */}
                            {beta && (
                                <div className={clsx(styles.installCard, styles.betaCard)}>
                                    <div className={styles.cardBody}>
                                        <div className={styles.releaseTitle}>
                                            Beta Release
                                            <span className={styles.badgeBeta}>BETA</span>
                                        </div>
                                        <div className={styles.versionNumber}>{beta.name || beta.tag_name}</div>
                                        <div className={styles.releaseDate}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            Released on {formatDate(beta.published_at)}
                                        </div>
                                        <div className={styles.releaseDescription}>
                                            Try bleeding-edge features and refactored components early. May contain
                                            bugs. Install using Obsidian BRAT.
                                        </div>

                                        <div className={styles.buttonGroup}>
                                            <div className={styles.buttonRow}>
                                                <Link
                                                    className={styles.btnPrimary}
                                                    to="https://obsidian.md/plugins?id=obsidian42-brat"
                                                >
                                                    Install BRAT
                                                </Link>
                                                <CopyLinkButton url="https://github.com/jonjampen/obsidian-xournalpp" />
                                            </div>
                                            <Link className={styles.btnLink} to="/docs/Beta-Testing">
                                                Go to Beta Testing Guide &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
