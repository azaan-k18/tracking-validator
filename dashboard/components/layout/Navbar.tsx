"use client";

import { useRouter } from "next/navigation";
import { useDomain } from "@/context/DomainContext";
import { DOMAIN_OPTIONS } from "@/utils/domains";

/**
 * Domain switch navigation bar.
 *
 * @returns {JSX.Element}
 */
export function Navbar(): JSX.Element {
    const router = useRouter();
    const { domain, setDomain } = useDomain();

    const handleDomainChange = (nextDomain: string) => {
        setDomain(nextDomain);
        router.push("/");
    };

    return (
        <nav className="domain-navbar" aria-label="Domain navigation">
            <div className="domain-navbar-inner">
                {DOMAIN_OPTIONS.map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        className={`domain-tab ${domain === option.key ? "domain-tab-active" : ""}`}
                        onClick={() => handleDomainChange(option.key)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
