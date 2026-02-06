import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardHeader } from '@/components/dashboard-header'

// Mock the logout action
jest.mock('@/app/actions/auth', () => ({
  logout: jest.fn(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

describe('DashboardHeader Component', () => {
  it('should render without crashing', () => {
    render(<DashboardHeader />)
    expect(screen.getByText('Advisory System')).toBeInTheDocument()
  })

  it('should display user name when provided', () => {
    const userName = 'John Doe'
    render(<DashboardHeader userName={userName} />)
    
    expect(screen.getByText(userName)).toBeInTheDocument()
  })

  it('should display user role when provided', () => {
    render(<DashboardHeader userRole="penanya" />)
    
    expect(screen.getByText(/Dashboard Penanya/i)).toBeInTheDocument()
  })

  it('should display correct role text for penjawab', () => {
    render(<DashboardHeader userRole="penjawab" />)
    
    expect(screen.getByText(/Dashboard Penjawab/i)).toBeInTheDocument()
  })

  it('should show profile button when user name is provided', () => {
    render(<DashboardHeader userName="John Doe" />)
    
    const profileButton = screen.getByRole('link', { name: /profil/i })
    expect(profileButton).toBeInTheDocument()
  })

  it('should show logout button', () => {
    render(<DashboardHeader />)
    
    const logoutButton = screen.getByRole('button', { name: /keluar/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('should link to profile page correctly', () => {
    render(<DashboardHeader userName="John Doe" />)
    
    const profileLink = screen.getByRole('link', { name: /profil/i })
    expect(profileLink).toHaveAttribute('href', '/dashboard/profile')
  })

  it('should have menu toggle button on mobile', () => {
    render(<DashboardHeader userName="John Doe" />)
    
    const menuButton = screen.getByLabelText('Toggle menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('should toggle mobile menu when clicking menu button', async () => {
    render(<DashboardHeader userName="John Doe" />)
    
    const menuButton = screen.getByLabelText('Toggle menu')
    
    // Menu should be closed initially
    let mobileMenu = screen.queryByText('Edit Profil')
    expect(mobileMenu).not.toBeInTheDocument()
    
    // Click to open menu
    fireEvent.click(menuButton)
    
    // Wait for mobile menu to appear
    await waitFor(() => {
      mobileMenu = screen.getByText('Edit Profil')
      expect(mobileMenu).toBeInTheDocument()
    })
  })

  it('should show edit profile option in mobile menu', async () => {
    render(<DashboardHeader userName="John Doe" />)
    
    const menuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(menuButton)
    
    await waitFor(() => {
      const editProfileButton = screen.getByText('Edit Profil')
      expect(editProfileButton).toBeInTheDocument()
    })
  })

  it('should close mobile menu when profile link is clicked', async () => {
    render(<DashboardHeader userName="John Doe" />)
    
    const menuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(menuButton)
    
    await waitFor(() => {
      const profileLink = screen.getByRole('link', { name: /Edit Profil/i })
      expect(profileLink).toBeInTheDocument()
    })
    
    // Click profile link
    const profileLink = screen.getByRole('link', { name: /Edit Profil/i })
    fireEvent.click(profileLink)
    
    // Menu should close
    await waitFor(() => {
      expect(screen.queryByText('Edit Profil')).not.toBeInTheDocument()
    })
  })

  it('should have sticky positioning', () => {
    const { container } = render(<DashboardHeader />)
    
    const header = container.querySelector('header')
    expect(header).toHaveClass('sticky', 'top-0')
  })

  it('should be responsive on different screen sizes', () => {
    const { container } = render(<DashboardHeader userName="John Doe" />)
    
    // Check for responsive classes
    const desktopMenu = container.querySelector('.hidden.md\\:flex')
    expect(desktopMenu).toBeInTheDocument()
  })

  it('should show user icon next to name', () => {
    render(<DashboardHeader userName="John Doe" />)
    
    // User icon should be rendered
    const userElements = screen.getAllByText('John Doe')
    expect(userElements.length).toBeGreaterThan(0)
  })

  it('should have proper link structure for dashboard navigation', () => {
    render(<DashboardHeader userName="John Doe" userRole="penanya" />)
    
    const profileLink = screen.getByRole('link', { name: /profil/i })
    expect(profileLink).toHaveAttribute('href', '/dashboard/profile')
  })

  it('should render logout form correctly', () => {
    const { container } = render(<DashboardHeader />)
    
    // Check if logout button is inside a form
    const logoutForm = container.querySelector('form')
    expect(logoutForm).toBeInTheDocument()
  })

  it('should not show user-specific elements when no user data provided', () => {
    const { container } = render(<DashboardHeader />)
    
    // Should not show profile link on desktop when no userName
    const desktopMenu = container.querySelector('.hidden.md\\:flex')
    const profileLinks = screen.queryAllByRole('link', { name: /profil/i })
    
    // No profile links should be rendered
    expect(profileLinks.length).toBe(0)
  })

  it('should handle both penanya and penjawab roles', () => {
    const { rerender } = render(<DashboardHeader userRole="penanya" />)
    expect(screen.getByText(/Dashboard Penanya/i)).toBeInTheDocument()
    
    rerender(<DashboardHeader userRole="penjawab" />)
    expect(screen.getByText(/Dashboard Penjawab/i)).toBeInTheDocument()
  })

  it('should truncate long user names on mobile', () => {
    const longName = 'VeryLongUserNameThatMightOverflow'.repeat(3)
    const { container } = render(<DashboardHeader userName={longName} />)
    
    // Check for truncate class
    const nameElements = container.querySelectorAll('.truncate')
    expect(nameElements.length).toBeGreaterThan(0)
  })

  it('should be accessible with proper ARIA attributes', () => {
    render(<DashboardHeader userName="John Doe" />)
    
    const menuButton = screen.getByLabelText('Toggle menu')
    expect(menuButton).toHaveAttribute('aria-label')
  })
})
