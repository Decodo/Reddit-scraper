import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReportView } from './ReportView';
import type { RedditReport } from '../tracker.types';

const mockReport: RedditReport = {
  executiveSummary: 'Developers have mixed feelings about AI tools.',
  themes: [
    {
      title: 'Productivity Boost',
      description: 'Many developers report faster coding.',
    },
    {
      title: 'Code Quality Concerns',
      description: 'Some worry about technical debt.',
    },
  ],
  sentiment: { overall: 'mixed' as const, rationale: 'Opinions vary widely.' },
  notableQuotes: [
    {
      text: 'AI tools are amazing',
      subreddit: 'programming',
      url: 'https://reddit.com/r/programming/1',
    },
  ],
  topPosts: [
    {
      title: 'Top AI Tools for 2024',
      subreddit: 'webdev',
      upvotes: 1234,
      commentCount: 89,
      url: 'https://reddit.com/r/webdev/post1',
    },
  ],
};

describe('ReportView', () => {
  const onExportMarkdown = vi.fn();
  const onExportJson = vi.fn();

  const defaultProps = {
    prompt: 'AI tools research',
    report: mockReport,
    onExportMarkdown,
    onExportJson,
  };

  beforeEach(() => {
    onExportMarkdown.mockClear();
    onExportJson.mockClear();
  });

  it('renders the research prompt', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText('AI tools research')).toBeInTheDocument();
  });

  it('renders executive summary', () => {
    render(<ReportView {...defaultProps} />);

    expect(
      screen.getByText('Developers have mixed feelings about AI tools.'),
    ).toBeInTheDocument();
  });

  it('renders all themes', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText('Productivity Boost')).toBeInTheDocument();
    expect(screen.getByText('Code Quality Concerns')).toBeInTheDocument();
  });

  it('renders sentiment badge', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText('mixed')).toBeInTheDocument();
  });

  it('renders notable quotes', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText(/"AI tools are amazing"/)).toBeInTheDocument();
  });

  it('renders top posts', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText('Top AI Tools for 2024')).toBeInTheDocument();
  });

  it('calls onExportMarkdown when Markdown button clicked', () => {
    render(<ReportView {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /markdown/i }));

    expect(onExportMarkdown).toHaveBeenCalledOnce();
  });

  it('calls onExportJson when JSON button clicked', () => {
    render(<ReportView {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /json/i }));

    expect(onExportJson).toHaveBeenCalledOnce();
  });

  it('does not render themes section when themes array is empty', () => {
    render(
      <ReportView
        {...defaultProps}
        report={{ ...mockReport, themes: [] }}
      />,
    );

    expect(screen.queryByText('Key Themes')).not.toBeInTheDocument();
  });

  it('does not render quotes section when notableQuotes is empty', () => {
    render(
      <ReportView
        {...defaultProps}
        report={{ ...mockReport, notableQuotes: [] }}
      />,
    );

    expect(screen.queryByText('Notable Quotes')).not.toBeInTheDocument();
  });

  it('renders theme descriptions', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText('Many developers report faster coding.')).toBeInTheDocument();
    expect(screen.getByText('Some worry about technical debt.')).toBeInTheDocument();
  });

  it('renders the subreddit attribution for notable quotes', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText('r/programming')).toBeInTheDocument();
  });

  it('renders the sentiment rationale', () => {
    render(<ReportView {...defaultProps} />);

    expect(screen.getByText('Opinions vary widely.')).toBeInTheDocument();
  });

  it('does not render the Top Posts section when topPosts is empty', () => {
    render(
      <ReportView
        {...defaultProps}
        report={{ ...mockReport, topPosts: [] }}
      />,
    );

    expect(screen.queryByText('Top Posts')).not.toBeInTheDocument();
  });

  it('formats upvote count with locale separators', () => {
    render(<ReportView {...defaultProps} />);

    // 1234 should be formatted as "1,234 upvotes"
    expect(screen.getByText(/1,234 upvotes/)).toBeInTheDocument();
  });

  it('renders positive sentiment badge text', () => {
    render(
      <ReportView
        {...defaultProps}
        report={{
          ...mockReport,
          sentiment: { overall: 'positive' as const, rationale: 'Mostly good.' },
        }}
      />,
    );

    expect(screen.getByText('positive')).toBeInTheDocument();
  });

  it('renders negative sentiment badge text', () => {
    render(
      <ReportView
        {...defaultProps}
        report={{
          ...mockReport,
          sentiment: { overall: 'negative' as const, rationale: 'Mostly bad.' },
        }}
      />,
    );

    expect(screen.getByText('negative')).toBeInTheDocument();
  });
});
