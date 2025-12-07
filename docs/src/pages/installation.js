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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function InstallationHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx("hero hero--primary", styles.heroBanner)}>
            <div className="container">
                <h1 className="hero__title">Installation</h1>
                <p className="hero__subtitle">Get started with the Obsidian Xournal++ Plugin</p>
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
        <button
            className="button button--secondary button--block"
            onClick={handleCopy}
            type="button"
            style={{ cursor: "pointer" }}>
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
                <div className={clsx("container", styles.container)}>
                    {loading ? (
                        <div className={styles.loading}>Loading release information...</div>
                    ) : (
                        <div className="row">
                            {/* Stable Release */}
                            <div className="col col--6">
                                {stable && (
                                    <div className={clsx("card", styles.installCard)}>
                                        <div className={clsx("card__body", styles.cardBody)}>
                                            <div className={styles.releaseTitle}>Stable Release</div>
                                            <div className={styles.versionNumber}>{stable.name}</div>
                                            <div className={styles.releaseDate}>
                                                Released on {formatDate(stable.published_at)}
                                            </div>
                                            <div className={styles.releaseDescription}>
                                                The latest stable version, recommended for most users.
                                            </div>
                                            
                                            <div className={styles.buttonGroup}>
                                                <div className={styles.buttonRow}>
                                                    <Link
                                                        className="button button--primary button--block"
                                                        to="https://obsidian.md/plugins?id=xournalpp">
                                                        Install Plugin
                                                    </Link>
                                                    {/* {stable.assets[0] && (
                                                        <Link
                                                            className="button button--secondary button--block"
                                                            to={stable.assets[0].browser_download_url}>
                                                            Download Plugin Folder
                                                        </Link>
                                                    )} */}
                                                </div>
                                                <Link
                                                    className="button button--link button--block"
                                                    to="/docs/Installation">
                                                    Installation Guide
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Beta Release */}
                            <div className="col col--6">
                                {beta && (
                                    <div className={clsx("card", styles.installCard, styles.betaCard)}>
                                        <div className={clsx("card__body", styles.cardBody)}>
                                            <div className={styles.releaseTitle}>
                                                Beta Release <span className="badge badge--warning" style={{verticalAlign: 'middle', marginLeft: '0.5rem'}}>BETA</span>
                                            </div>
                                            <div className={styles.versionNumber}>{beta.name}</div>
                                            <div className={styles.releaseDate}>
                                                Released on {formatDate(beta.published_at)}
                                            </div>
                                            <div className={styles.releaseDescription}>
                                                Contains the latest features and improvements, but may be unstable.
                                            </div>

                                            <div className={styles.buttonGroup}>
                                                <div className={styles.buttonRow}>
                                                    <Link
                                                        className="button button--primary button--block"
                                                        to="https://obsidian.md/plugins?id=obsidian42-brat">
                                                        Install BRAT
                                                    </Link>
                                                    {beta.assets[0] && (
                                                        <CopyLinkButton url="https://github.com/jonjampen/obsidian-xournalpp" />
                                                    )}
                                                </div>
                                                <Link
                                                    className="button button--link button--block"
                                                    to="/docs/Beta-Testing">
                                                    Beta Testing Guide
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
