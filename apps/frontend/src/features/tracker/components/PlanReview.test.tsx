import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PlanReview } from './PlanReview';

const mockPlan = {
  subreddits: ['programming', 'webdev'],
  queries: ['AI tools', 'developer experience'],
  timeRange: 'week' as const,
  rationale: 'Relevant subreddits for this topic',
};

describe('PlanReview', () => {
  const onAnalyze = vi.fn();
  const onBack = vi.fn();

  const defaultProps = {
    plan: mockPlan,
    prompt: 'What do developers think about AI?',
    onAnalyze,
    onBack,
    isLoading: false,
  };

  beforeEach(() => {
    onAnalyze.mockClear();
    onBack.mockClear();
  });

  it('renders subreddit badges from plan', () => {
    render(<PlanReview {...defaultProps} />);

    expect(screen.getByText('r/programming')).toBeInTheDocument();
    expect(screen.getByText('r/webdev')).toBeInTheDocument();
  });

  it('renders search queries from plan', () => {
    render(<PlanReview {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    const values = inputs.map((el) => (el as HTMLInputElement).value);

    expect(values).toContain('AI tools');
    expect(values).toContain('developer experience');
  });

  it('renders rationale', () => {
    render(<PlanReview {...defaultProps} />);

    expect(
      screen.getByText('Relevant subreddits for this topic'),
    ).toBeInTheDocument();
  });

  it('can remove a subreddit', () => {
    render(<PlanReview {...defaultProps} />);

    const removeButton = screen.getByRole('button', {
      name: 'Remove r/programming',
    });
    fireEvent.click(removeButton);

    expect(screen.queryByText('r/programming')).not.toBeInTheDocument();
  });

  it('can add a new subreddit', () => {
    render(<PlanReview {...defaultProps} />);

    const addInput = screen.getByPlaceholderText('Add subreddit');
    fireEvent.change(addInput, { target: { value: 'javascript' } });

    // The add button is the one adjacent to the add input — it's disabled unless input has value.
    // Find the + (Plus icon) button — it's the button that becomes enabled after typing.
    const addButton = addInput
      .closest('div')!
      .querySelector('button') as HTMLButtonElement;
    fireEvent.click(addButton);

    expect(screen.getByText('r/javascript')).toBeInTheDocument();
  });

  it('strips r/ prefix when adding subreddit', () => {
    render(<PlanReview {...defaultProps} />);

    const addInput = screen.getByPlaceholderText('Add subreddit');
    fireEvent.change(addInput, { target: { value: 'r/node' } });

    const addButton = addInput
      .closest('div')!
      .querySelector('button') as HTMLButtonElement;
    fireEvent.click(addButton);

    // The component strips r/ then renders as r/{sub}, so we see r/node
    expect(screen.getByText('r/node')).toBeInTheDocument();
  });

  it('does not add duplicate subreddit', () => {
    render(<PlanReview {...defaultProps} />);

    const addInput = screen.getByPlaceholderText('Add subreddit');
    fireEvent.change(addInput, { target: { value: 'programming' } });

    const addButton = addInput
      .closest('div')!
      .querySelector('button') as HTMLButtonElement;
    fireEvent.click(addButton);

    const badges = screen.getAllByText('r/programming');
    expect(badges).toHaveLength(1);
  });

  it('calls onBack when Back button clicked', () => {
    render(<PlanReview {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('calls onAnalyze with current plan data when Run analysis clicked', () => {
    render(<PlanReview {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /run analysis/i }));

    expect(onAnalyze).toHaveBeenCalledOnce();
    expect(onAnalyze).toHaveBeenCalledWith({
      prompt: defaultProps.prompt,
      subreddits: mockPlan.subreddits,
      queries: mockPlan.queries,
      timeRange: mockPlan.timeRange,
    });
  });

  it('Run analysis button is disabled when no subreddits remain', () => {
    render(<PlanReview {...defaultProps} />);

    // Remove both subreddits
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove r/programming' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove r/webdev' }));

    const runButton = screen.getByRole('button', { name: /run analysis/i });
    expect(runButton).toBeDisabled();
  });

  it('remove query button is disabled when only one query remains', () => {
    render(<PlanReview {...defaultProps} />);

    // Remove first query — leaves one remaining
    const removeButtons = screen.getAllByRole('button', { name: /remove query/i });
    fireEvent.click(removeButtons[0]);

    // Now only one query left — its remove button should be disabled
    const remainingRemoveButton = screen.getByRole('button', { name: /remove query/i });
    expect(remainingRemoveButton).toBeDisabled();
  });

  it('filters out whitespace-only queries when submitting', () => {
    render(<PlanReview {...defaultProps} />);

    // Set first query to whitespace
    const inputs = screen.getAllByRole('textbox');
    const firstQueryInput = inputs.find(
      (el) => (el as HTMLInputElement).value === 'AI tools',
    ) as HTMLInputElement;
    fireEvent.change(firstQueryInput, { target: { value: '   ' } });

    fireEvent.click(screen.getByRole('button', { name: /run analysis/i }));

    // Only the non-whitespace query should be passed
    expect(onAnalyze).toHaveBeenCalledWith(
      expect.objectContaining({ queries: ['developer experience'] }),
    );
  });

  it('clears the add subreddit input after a subreddit is added', () => {
    render(<PlanReview {...defaultProps} />);

    const addInput = screen.getByPlaceholderText('Add subreddit') as HTMLInputElement;
    fireEvent.change(addInput, { target: { value: 'typescript' } });

    const addButton = addInput.closest('div')!.querySelector('button') as HTMLButtonElement;
    fireEvent.click(addButton);

    expect(addInput.value).toBe('');
  });

  it('updates query text when the input is changed', () => {
    render(<PlanReview {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    const firstQueryInput = inputs.find(
      (el) => (el as HTMLInputElement).value === 'AI tools',
    ) as HTMLInputElement;

    fireEvent.change(firstQueryInput, { target: { value: 'Updated query text' } });

    expect(firstQueryInput.value).toBe('Updated query text');
  });

  it('does not add a duplicate subreddit when entering via Enter key', () => {
    render(<PlanReview {...defaultProps} />);

    const addInput = screen.getByPlaceholderText('Add subreddit');
    fireEvent.change(addInput, { target: { value: 'programming' } });
    fireEvent.keyDown(addInput, { key: 'Enter' });

    const badges = screen.getAllByText('r/programming');
    expect(badges).toHaveLength(1);
  });
});
