import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'

let printSpy: jest.SpyInstance

beforeEach(() => {
  printSpy = jest.spyOn(window, 'print').mockImplementation(jest.fn())
})

afterEach(() => {
  printSpy.mockRestore()
})

describe('Home page', () => {
  describe('header', () => {
    it('renders the brand name', () => {
      render(<Home />)
      expect(screen.getByText('Prelegal')).toBeInTheDocument()
    })

    it('renders the page title', () => {
      render(<Home />)
      expect(screen.getByText('Mutual NDA Creator')).toBeInTheDocument()
    })

    it('renders the Download PDF button', () => {
      render(<Home />)
      expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument()
    })
  })

  describe('Download PDF button', () => {
    it('calls window.print() when clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)
      await user.click(screen.getByRole('button', { name: 'Download PDF' }))
      expect(printSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('layout', () => {
    it('renders the form panel', () => {
      render(<Home />)
      expect(screen.getByPlaceholderText('e.g. Delaware')).toBeInTheDocument()
    })

    it('renders the preview panel', () => {
      render(<Home />)
      expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument()
    })
  })

  describe('default form values', () => {
    it('populates effective date with today', () => {
      render(<Home />)
      const today = new Date().toISOString().split('T')[0]
      expect(screen.getByDisplayValue(today)).toBeInTheDocument()
    })

    it('defaults mndaTermType to expires', () => {
      render(<Home />)
      expect(screen.getByDisplayValue('expires')).toBeChecked()
    })

    it('defaults confidentialityTermType to years', () => {
      render(<Home />)
      expect(screen.getByDisplayValue('years')).toBeChecked()
    })

    it('pre-fills the purpose with a default value', () => {
      render(<Home />)
      expect(
        screen.getByDisplayValue('Evaluating whether to enter into a business relationship with the other party.')
      ).toBeInTheDocument()
    })
  })

  describe('form-to-preview reactivity', () => {
    it('updates preview when governing law is typed', async () => {
      const user = userEvent.setup()
      render(<Home />)
      const input = screen.getByPlaceholderText('e.g. Delaware')
      await user.type(input, 'Texas')
      expect(screen.getAllByText('Texas').length).toBeGreaterThanOrEqual(1)
    })

    it('updates preview when party 1 name is typed', async () => {
      const user = userEvent.setup()
      render(<Home />)
      const nameInput = screen.getAllByPlaceholderText('Full name')[0]
      await user.type(nameInput, 'Alice')
      expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
    })

    it('updates preview MNDA term text when radio is switched', async () => {
      const user = userEvent.setup()
      render(<Home />)
      await user.click(screen.getByDisplayValue('until-terminated'))
      expect(
        screen.getAllByText('Continues until terminated in accordance with the terms of the MNDA.').length
      ).toBeGreaterThanOrEqual(1)
    })

    it('shows modifications section in preview when text is entered', async () => {
      const user = userEvent.setup()
      render(<Home />)
      const textarea = screen.getByPlaceholderText('List any modifications to the standard terms')
      await user.type(textarea, 'Special clause')
      // use heading role to target the preview <h2>, not the form <label> text node
      expect(screen.getByRole('heading', { name: 'MNDA Modifications' })).toBeInTheDocument()
    })

    it('hides modifications section in preview when field is cleared', async () => {
      const user = userEvent.setup()
      render(<Home />)
      const textarea = screen.getByPlaceholderText('List any modifications to the standard terms')
      await user.type(textarea, 'Some text')
      expect(screen.getByRole('heading', { name: 'MNDA Modifications' })).toBeInTheDocument()
      await user.clear(textarea)
      expect(screen.queryByRole('heading', { name: 'MNDA Modifications' })).not.toBeInTheDocument()
    })
  })
})
