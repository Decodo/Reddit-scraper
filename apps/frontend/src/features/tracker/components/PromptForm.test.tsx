import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PromptForm } from './PromptForm';

describe('PromptForm', () => {
  const onSubmit = vi.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it('renders textarea and submit button', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /analyze reddit/i }),
    ).toBeInTheDocument();
  });

  it('submit button is disabled when prompt is empty', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: /analyze reddit/i });
    expect(submitButton).toBeDisabled();
  });

  it('submit button is disabled while loading', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={true} />);

    // When loading the button text changes to 'Generating plan…'
    const submitButton = screen.getByRole('button', { name: /generating plan/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls onSubmit with trimmed prompt', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '  hello world  ' } });

    const form = textarea.closest('form')!;
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith('hello world', expect.anything());
  });

  it('does not call onSubmit when prompt is only whitespace', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '   ' } });

    const form = textarea.closest('form')!;
    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('parses subreddits from comma-separated input (removes r/ prefix, lowercases)', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    // Open advanced options
    fireEvent.click(screen.getByRole('button', { name: /advanced options/i }));

    // Fill in subreddits
    const subredditsInput = screen.getByPlaceholderText(
      /programming, machineLearning, webdev/i,
    );
    fireEvent.change(subredditsInput, {
      target: { value: 'r/Programming, WebDev' },
    });

    // Fill the prompt and submit
    const textarea = screen.getByRole('textbox', {
      name: (_, el) => el.tagName === 'TEXTAREA',
    });
    fireEvent.change(textarea, { target: { value: 'test prompt' } });

    const form = textarea.closest('form')!;
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(
      'test prompt',
      expect.objectContaining({ subreddits: ['programming', 'webdev'] }),
    );
  });

  it('advanced options are hidden by default', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    expect(
      screen.queryByPlaceholderText(/programming, machineLearning, webdev/i),
    ).not.toBeInTheDocument();
  });

  it('closes advanced options when toggle is clicked a second time', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    const toggle = screen.getByRole('button', { name: /advanced options/i });
    fireEvent.click(toggle); // open
    fireEvent.click(toggle); // close

    expect(
      screen.queryByPlaceholderText(/programming, machineLearning, webdev/i),
    ).not.toBeInTheDocument();
  });

  it('parses a single subreddit (no comma) correctly', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    fireEvent.click(screen.getByRole('button', { name: /advanced options/i }));

    const subredditsInput = screen.getByPlaceholderText(
      /programming, machineLearning, webdev/i,
    );
    fireEvent.change(subredditsInput, { target: { value: 'javascript' } });

    const textarea = screen.getByRole('textbox', {
      name: (_, el) => el.tagName === 'TEXTAREA',
    });
    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    fireEvent.submit(textarea.closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith(
      'test prompt',
      expect.objectContaining({ subreddits: ['javascript'] }),
    );
  });

  it('filters empty entries from comma-separated subreddits input', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    fireEvent.click(screen.getByRole('button', { name: /advanced options/i }));

    const subredditsInput = screen.getByPlaceholderText(
      /programming, machineLearning, webdev/i,
    );
    fireEvent.change(subredditsInput, { target: { value: ' ,programming, , webdev, ' } });

    const textarea = screen.getByRole('textbox', {
      name: (_, el) => el.tagName === 'TEXTAREA',
    });
    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    fireEvent.submit(textarea.closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith(
      'test prompt',
      expect.objectContaining({ subreddits: ['programming', 'webdev'] }),
    );
  });

  it('textarea is disabled when isLoading is true', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={true} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('passes subreddits as undefined when no subreddits are entered', () => {
    render(<PromptForm onSubmit={onSubmit} isLoading={false} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    fireEvent.submit(textarea.closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith(
      'test prompt',
      expect.objectContaining({ subreddits: undefined }),
    );
  });
});
