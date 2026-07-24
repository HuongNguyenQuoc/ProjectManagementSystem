import { StatusDot, Tag } from '@/components/ui/Tag';
import { TableCard } from '@/components/ui/TableCard';
import { EmptyState } from '@/components/ui/States';
import { ISSUE_SEVERITY, ISSUE_STATUS } from '@/lib/constants';
import type { IssueListItem } from '@/types/api';

/** Issues tab table — Issue / Related task / Severity / Status / Reporter / Assignee. */
export function IssuesTable({ issues }: { issues: IssueListItem[] }) {
  if (!issues.length) {
    return <EmptyState title="No issues reported" description="Anything blocking the team will show up here." />;
  }

  return (
    <TableCard>
      <table className="table">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Related task</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Reporter</th>
            <th>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => {
            const severity = ISSUE_SEVERITY[issue.severity];
            const status = ISSUE_STATUS[issue.status];
            return (
              <tr key={issue.id}>
                <td>
                  <div style={{ fontFamily: 'var(--font-heading)' }}>{issue.title}</div>
                  <div
                    className="ph-truncate"
                    style={{ fontSize: 11, color: 'var(--color-neutral-500)', maxWidth: 280 }}
                  >
                    {issue.description}
                  </div>
                </td>
                <td style={{ color: 'var(--color-neutral-400)' }}>{issue.taskTitle ?? '—'}</td>
                <td>
                  <Tag style={severity.tag}>{severity.label}</Tag>
                </td>
                <td>
                  <StatusDot color={status.color} label={status.label} />
                </td>
                <td>{issue.reporterName}</td>
                <td style={{ color: 'var(--color-neutral-400)' }}>{issue.assigneeName ?? 'Unassigned'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableCard>
  );
}
