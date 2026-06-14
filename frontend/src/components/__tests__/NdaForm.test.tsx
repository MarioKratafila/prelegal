import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import NdaForm from '../NdaForm'
import { NdaFormData } from '@/lib/types'

const emptyParty = { printName: '', title: '', company: '', noticeAddress: '' }

const base: NdaFormData = {
  purpose: 'Evaluating a potential partnership',
  effectiveDate: '2026-01-01',
  mndaTermType: 'expires',
  mndaTermYears: 1,
  confidentialityTermType: 'years',
  confidentialityTermYears: 1,
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  party1: emptyParty,
  party2: emptyParty,
}

function Wrapper({ initial = base }: { initial?: NdaFormData }) {
  const [data, setData] = useState(initial)
  return <NdaForm data={data} onChange={setData} />
}

describe('NdaForm', () => {
  describe('initial render', () => {
    it('renders the purpose textarea with its current value', () => {
      render(<Wrapper />)
      expect(screen.getByDisplayValue(base.purpose)).toBeInTheDocument()
    })

    it('renders the effective date input', () => {
      render(<Wrapper />)
      expect(screen.getByDisplayValue('2026-01-01')).toBeInTheDocument()
    })

    it('renders the "expires" radio checked by default', () => {
      render(<Wrapper />)
      expect(screen.getByDisplayValue('expires')).toBeChecked()
    })

    it('renders the "until-terminated" radio unchecked by default', () => {
      render(<Wrapper />)
      expect(screen.getByDisplayValue('until-terminated')).not.toBeChecked()
    })

    it('renders the "years" confidentiality radio checked by default', () => {
      render(<Wrapper />)
      expect(screen.getByDisplayValue('years')).toBeChecked()
    })

    it('renders the "perpetuity" radio unchecked by default', () => {
      render(<Wrapper />)
      expect(screen.getByDisplayValue('perpetuity')).not.toBeChecked()
    })

    it('renders the governing law input', () => {
      render(<Wrapper />)
      expect(screen.getByPlaceholderText('e.g. Delaware')).toBeInTheDocument()
    })

    it('renders the jurisdiction input', () => {
      render(<Wrapper />)
      expect(screen.getByPlaceholderText('e.g. New Castle, DE')).toBeInTheDocument()
    })

    it('renders the modifications textarea', () => {
      render(<Wrapper />)
      expect(screen.getByPlaceholderText('List any modifications to the standard terms')).toBeInTheDocument()
    })

    it('renders two Print Name inputs (one per party)', () => {
      render(<Wrapper />)
      expect(screen.getAllByPlaceholderText('Full name')).toHaveLength(2)
    })

    it('renders two Title inputs (one per party)', () => {
      render(<Wrapper />)
      expect(screen.getAllByPlaceholderText('e.g. CEO')).toHaveLength(2)
    })

    it('renders two Company inputs (one per party)', () => {
      render(<Wrapper />)
      expect(screen.getAllByPlaceholderText('Company name')).toHaveLength(2)
    })

    it('renders two Notice Address inputs (one per party)', () => {
      render(<Wrapper />)
      expect(screen.getAllByPlaceholderText('Email or postal address')).toHaveLength(2)
    })

    it('renders Party 1 label', () => {
      render(<Wrapper />)
      expect(screen.getByText('Party 1')).toBeInTheDocument()
    })

    it('renders Party 2 label', () => {
      render(<Wrapper />)
      expect(screen.getByText('Party 2')).toBeInTheDocument()
    })
  })

  describe('purpose textarea', () => {
    it('updates purpose when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      // base.purpose is unique among all input values, so this uniquely identifies the textarea
      const textarea = screen.getByDisplayValue(base.purpose)
      await user.clear(textarea)
      await user.type(textarea, 'New purpose')
      expect(textarea).toHaveValue('New purpose')
    })
  })

  describe('effective date input', () => {
    it('updates effective date when changed', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const input = screen.getByDisplayValue('2026-01-01')
      await user.clear(input)
      await user.type(input, '2027-12-31')
      expect(input).toHaveValue('2027-12-31')
    })
  })

  describe('MNDA term radio buttons', () => {
    it('switches to until-terminated when that radio is clicked', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const untilTerminated = screen.getByDisplayValue('until-terminated')
      await user.click(untilTerminated)
      expect(untilTerminated).toBeChecked()
      expect(screen.getByDisplayValue('expires')).not.toBeChecked()
    })

    it('switches back to expires when expires radio is clicked', async () => {
      const user = userEvent.setup()
      render(<Wrapper initial={{ ...base, mndaTermType: 'until-terminated' }} />)
      const expiresRadio = screen.getByDisplayValue('expires')
      await user.click(expiresRadio)
      expect(expiresRadio).toBeChecked()
    })
  })

  describe('MNDA term years input', () => {
    it('updates mndaTermYears when number is changed', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const spinbuttons = screen.getAllByRole('spinbutton')
      const mndaYearsInput = spinbuttons[0]
      await user.clear(mndaYearsInput)
      await user.type(mndaYearsInput, '3')
      expect(mndaYearsInput).toHaveValue(3)
    })
  })

  describe('confidentiality term radio buttons', () => {
    it('switches to perpetuity when that radio is clicked', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const perpetuity = screen.getByDisplayValue('perpetuity')
      await user.click(perpetuity)
      expect(perpetuity).toBeChecked()
      expect(screen.getByDisplayValue('years')).not.toBeChecked()
    })

    it('switches back to years when years radio is clicked', async () => {
      const user = userEvent.setup()
      render(<Wrapper initial={{ ...base, confidentialityTermType: 'perpetuity' }} />)
      const yearsRadio = screen.getByDisplayValue('years')
      await user.click(yearsRadio)
      expect(yearsRadio).toBeChecked()
    })
  })

  describe('confidentiality term years input', () => {
    it('updates confidentialityTermYears when number is changed', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const spinbuttons = screen.getAllByRole('spinbutton')
      const confYearsInput = spinbuttons[1]
      await user.clear(confYearsInput)
      await user.type(confYearsInput, '5')
      expect(confYearsInput).toHaveValue(5)
    })
  })

  describe('governing law input', () => {
    it('updates governing law when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const input = screen.getByPlaceholderText('e.g. Delaware')
      await user.type(input, 'New York')
      expect(input).toHaveValue('New York')
    })
  })

  describe('jurisdiction input', () => {
    it('updates jurisdiction when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const input = screen.getByPlaceholderText('e.g. New Castle, DE')
      await user.type(input, 'New York, NY')
      expect(input).toHaveValue('New York, NY')
    })
  })

  describe('modifications textarea', () => {
    it('updates modifications when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const textarea = screen.getByPlaceholderText('List any modifications to the standard terms')
      await user.type(textarea, 'Custom clause added.')
      expect(textarea).toHaveValue('Custom clause added.')
    })
  })

  describe('Party 1 fields', () => {
    it('updates party 1 print name when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const input = screen.getAllByPlaceholderText('Full name')[0]
      await user.type(input, 'Alice Smith')
      expect(input).toHaveValue('Alice Smith')
    })

    it('updates party 1 title when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const input = screen.getAllByPlaceholderText('e.g. CEO')[0]
      await user.type(input, 'CEO')
      expect(input).toHaveValue('CEO')
    })

    it('updates party 1 company when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const input = screen.getAllByPlaceholderText('Company name')[0]
      await user.type(input, 'Acme Corp')
      expect(input).toHaveValue('Acme Corp')
    })

    it('updates party 1 notice address when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const input = screen.getAllByPlaceholderText('Email or postal address')[0]
      await user.type(input, 'alice@acme.com')
      expect(input).toHaveValue('alice@acme.com')
    })
  })

  describe('Party 2 fields', () => {
    it('updates party 2 print name independently of party 1', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const [p1Input, p2Input] = screen.getAllByPlaceholderText('Full name')
      await user.type(p1Input, 'Alice')
      await user.type(p2Input, 'Bob')
      expect(p1Input).toHaveValue('Alice')
      expect(p2Input).toHaveValue('Bob')
    })

    it('updates party 2 company independently of party 1', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const [, p2Input] = screen.getAllByPlaceholderText('Company name')
      await user.type(p2Input, 'Widget Inc')
      expect(p2Input).toHaveValue('Widget Inc')
    })

    it('updates party 2 notice address when user types', async () => {
      const user = userEvent.setup()
      render(<Wrapper />)
      const [, p2Input] = screen.getAllByPlaceholderText('Email or postal address')
      await user.type(p2Input, 'bob@widget.com')
      expect(p2Input).toHaveValue('bob@widget.com')
    })
  })

  describe('onChange callback', () => {
    it('calls onChange with updated governing law', () => {
      const onChange = jest.fn()
      render(<NdaForm data={base} onChange={onChange} />)
      const input = screen.getByPlaceholderText('e.g. Delaware')
      // fireEvent.change sets the full value atomically — avoids per-keystroke controlled-input
      // resets that occur when no stateful wrapper feeds prop updates back to the component.
      fireEvent.change(input, { target: { value: 'Texas' } })
      expect(onChange).toHaveBeenCalled()
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(lastCall.governingLaw).toBe('Texas')
    })

    it('calls onChange with updated mndaTermType when radio is clicked', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<NdaForm data={base} onChange={onChange} />)
      await user.click(screen.getByDisplayValue('until-terminated'))
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ mndaTermType: 'until-terminated' })
      )
    })

    it('calls onChange with updated confidentialityTermType when radio is clicked', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<NdaForm data={base} onChange={onChange} />)
      await user.click(screen.getByDisplayValue('perpetuity'))
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ confidentialityTermType: 'perpetuity' })
      )
    })

    it('calls onChange with updated party1 when party 1 print name changes', () => {
      const onChange = jest.fn()
      render(<NdaForm data={base} onChange={onChange} />)
      fireEvent.change(screen.getAllByPlaceholderText('Full name')[0], { target: { value: 'Jane' } })
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(lastCall.party1.printName).toBe('Jane')
    })

    it('preserves other party data when only one party field changes', () => {
      const onChange = jest.fn()
      const initial = { ...base, party2: { printName: 'Bob', title: 'CTO', company: 'B Corp', noticeAddress: 'bob@b.com' } }
      render(<NdaForm data={initial} onChange={onChange} />)
      fireEvent.change(screen.getAllByPlaceholderText('Full name')[0], { target: { value: 'Alice' } })
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(lastCall.party2.printName).toBe('Bob')
    })
  })
})
