import { render, screen } from '@testing-library/react'
import Footer from '../footer'

describe('Footer Component', () => {
  it('renders footer with copyright text', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${currentYear} Colton Randall`))).toBeInTheDocument()
  })

  it('renders Next.js link', () => {
    render(<Footer />)
    const nextLink = screen.getByText('Next.js')
    expect(nextLink).toBeInTheDocument()
    expect(nextLink).toHaveAttribute('href', 'https://nextjs.org')
    expect(nextLink).toHaveAttribute('target', '_blank')
  })

  it('renders Vercel link', () => {
    render(<Footer />)
    const vercelLink = screen.getByText('Vercel')
    expect(vercelLink).toBeInTheDocument()
    expect(vercelLink).toHaveAttribute('href', 'https://vercel.com')
    expect(vercelLink).toHaveAttribute('target', '_blank')
  })

  it('renders OpenRouter link', () => {
    render(<Footer />)
    const openRouterLink = screen.getByText('OpenRouter')
    expect(openRouterLink).toBeInTheDocument()
    expect(openRouterLink).toHaveAttribute('href', 'https://openrouter.ai')
    expect(openRouterLink).toHaveAttribute('target', '_blank')
  })

  it('renders GitHub link', () => {
    render(<Footer />)
    const githubLink = screen.getByText('• Visit my GitHub')
    expect(githubLink).toBeInTheDocument()
    expect(githubLink).toHaveAttribute('href', 'https://github.com/ColtonRandall')
    expect(githubLink).toHaveAttribute('target', '_blank')
  })
})
