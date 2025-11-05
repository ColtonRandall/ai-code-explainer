import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../page'

// Mock fetch globally
global.fetch = jest.fn()

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('renders the main heading', () => {
    render(<HomePage />)
    expect(screen.getByText('AI Code Explainer')).toBeInTheDocument()
  })

  it('renders textarea with placeholder', () => {
    render(<HomePage />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Paste code here... ')
  })

  it('renders explain button', () => {
    render(<HomePage />)
    expect(screen.getByRole('button', { name: /Explain Code/i })).toBeInTheDocument()
  })

  it('disables button when textarea is empty', () => {
    render(<HomePage />)
    const button = screen.getByRole('button', { name: /Explain Code/i })
    expect(button).toBeDisabled()
  })

  it('enables button when textarea has content', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /Explain Code/i })
    
    await user.type(textarea, 'console.log("test")')
    
    expect(button).not.toBeDisabled()
  })

  it('updates textarea value on input', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'test code')
    
    expect(textarea.value).toBe('test code')
  })

  it('shows loading state when button is clicked', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ explanation: 'Test explanation' })
      }), 100))
    )
    
    render(<HomePage />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'test code')
    
    const button = screen.getByRole('button', { name: /Explain Code/i })
    await user.click(button)
    
    expect(screen.getByText(/Analysing code.../i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('displays explanation after successful API call', async () => {
    const user = userEvent.setup()
    const mockExplanation = 'This code prints a message to the console'
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ explanation: mockExplanation })
    })
    
    render(<HomePage />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'console.log("hello")')
    
    const button = screen.getByRole('button', { name: /Explain Code/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Explanation:')).toBeInTheDocument()
    })
    
    expect(screen.getByText(mockExplanation)).toBeInTheDocument()
  })

  it('calls API with correct parameters', async () => {
    const user = userEvent.setup()
    const testCode = 'const x = 5;'
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ explanation: 'Test explanation' })
    })
    
    render(<HomePage />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, testCode)
    
    const button = screen.getByRole('button', { name: /Explain Code/i })
    await user.click(button)
    
    expect(global.fetch).toHaveBeenCalledWith('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: testCode })
    })
  })

  it('displays "No explanation" when API returns no explanation', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({})
    })
    
    render(<HomePage />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'test')
    
    const button = screen.getByRole('button', { name: /Explain Code/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('No explanation')).toBeInTheDocument()
    })
  })
})
