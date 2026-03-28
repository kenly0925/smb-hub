"use client";

import { useState } from "react";
import { usePrototype1Demo } from "@/components/prototype1/demo-provider";
import { Prototype1Shell } from "@/components/prototype1/shell";
import {
  Button,
  DataTable,
  PageTabs,
  SectionHeading,
  ShellCard,
} from "@/components/prototype1/ui";
import Link from "next/link";
import { MoreVertical, Plus } from "lucide-react";

const PLATFORM_TABS = [
  { label: "Windows", value: "Windows" },
  { label: "MacOS", value: "MacOS" },
  { label: "Linux", value: "Linux" },
];

export function Prototype1PoliciesListPage() {
  const {
    state: { policySummaries },
  } = usePrototype1Demo();
  const [platform, setPlatform] = useState("Windows");

  const rows = policySummaries.filter((policy) => policy.platform === platform);

  return (
    <Prototype1Shell>
      <SectionHeading
        title="Prevention policies"
        description="Manage prevention policy precedence, track where each policy is applied, and open policy settings for detailed configuration."
        action={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            Create new policy
          </Button>
        }
      />

      <ShellCard className="mt-6 p-5">
        <div className="mb-5">
          <PageTabs tabs={PLATFORM_TABS} active={platform} onChange={setPlatform} />
        </div>
        <DataTable
          headers={[
            "Precedence",
            "Status",
            "Name",
            "Created at",
            "Last modified",
            "Applied to",
            "Action",
          ]}
        >
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/8">
              <td className="px-4 py-4 text-[15px] text-[var(--p1-text-soft)]">
                {row.precedence}
              </td>
              <td className="px-4 py-4 text-[15px] text-[var(--p1-text-muted)]">
                {row.status}
              </td>
              <td className="px-4 py-4 text-[15px] font-semibold text-white">
                <Link href="/prototype-1/policies/phase-1">{row.name}</Link>
              </td>
              <td className="px-4 py-4 text-[15px] text-[var(--p1-text-soft)]">
                {row.createdAt}
              </td>
              <td className="px-4 py-4 text-[15px] text-[var(--p1-text-soft)]">
                {row.lastModified}
              </td>
              <td className="px-4 py-4 text-[15px] text-[var(--p1-text-soft)]">
                {row.appliedTo}
              </td>
              <td className="px-4 py-4 text-[15px] text-[var(--p1-text-soft)]">
                <div className="inline-flex items-center gap-4">
                  <Link
                    href="/prototype-1/policies/phase-1"
                    className="p1-link text-sm font-medium"
                  >
                    Open
                  </Link>
                  <Button
                    variant="secondary"
                    className="h-10 min-h-0 w-10 min-w-0 px-0 py-0"
                    aria-label={`Actions for ${row.name}`}
                  >
                    <MoreVertical className="h-5 w-5 text-[var(--p1-text-soft)]" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </ShellCard>
    </Prototype1Shell>
  );
}
