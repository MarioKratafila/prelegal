import { render, screen } from '@testing-library/react'
import NdaPreview from '../NdaPreview'
import { NdaFormData } from '@/lib/types'

const base: NdaFormData = {
  purpose: 'Exploring a strategic partnership',
  effectiveDate: '2026-03-01',
  mndaTermType: 'expires',
  mndaTermYears: 2,
  confidentialityTermType: 'years',
  confidentialityTermYears: 3,
  governingLaw: 'California',
  jurisdiction: 'San Francisco, CA',
  modifications: '',
  party1: { printName: 'Jane Doe', title: 'CEO', company: 'TechCo', noticeAddress: 'jane@techco.com' },
  party2: { printName: 'John Smith', title: 'CFO', company: 'FinCo', noticeAddress: 'john@finco.com' },
}

describe('NdaPreview', () => {
  describe('document title and subtitle', () => {
    it('renders the NDA title', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument()
    })

    it('renders the Common Paper subtitle', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText(/Common Paper Standard Terms Version 1\.0/)).toBeInTheDocument()
    })
  })

  describe('Field component', () => {
    it('renders a filled value in indigo style', () => {
      render(<NdaPreview data={base} />)
      // party names appear only in the signing table, not in repeated standard terms
      const el = screen.getByText('Jane Doe')
      expect(el).toHaveClass('text-indigo-700')
    })

    it('renders placeholder in italic style when value is empty', () => {
      render(<NdaPreview data={{ ...base, party1: { ...base.party1, printName: '' } }} />)
      const el = screen.getByText('—')
      expect(el).toHaveClass('italic')
    })

    it('renders placeholder when value is whitespace only', () => {
      render(<NdaPreview data={{ ...base, jurisdiction: '   ' }} />)
      expect(screen.getByText('City/county and state')).toBeInTheDocument()
    })
  })

  describe('section headers', () => {
    it('renders Purpose section', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Purpose')).toBeInTheDocument()
    })

    it('renders Effective Date section', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Effective Date')).toBeInTheDocument()
    })

    it('renders MNDA Term section', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('MNDA Term')).toBeInTheDocument()
    })

    it('renders Term of Confidentiality section', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Term of Confidentiality')).toBeInTheDocument()
    })

    it('renders Governing Law & Jurisdiction section', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Governing Law & Jurisdiction')).toBeInTheDocument()
    })

    it('renders Standard Terms section heading', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Standard Terms')).toBeInTheDocument()
    })
  })

  describe('purpose', () => {
    it('shows the purpose text', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getAllByText(base.purpose).length).toBeGreaterThanOrEqual(1)
    })

    it('shows placeholder when purpose is empty', () => {
      render(<NdaPreview data={{ ...base, purpose: '' }} />)
      expect(screen.getAllByText('How Confidential Information may be used').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('effective date', () => {
    it('shows the effective date', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getAllByText('2026-03-01').length).toBeGreaterThanOrEqual(1)
    })

    it('shows "Not set" placeholder when date is empty', () => {
      render(<NdaPreview data={{ ...base, effectiveDate: '' }} />)
      expect(screen.getAllByText('Not set').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('MNDA term', () => {
    it('shows expires text with correct year count', () => {
      render(<NdaPreview data={base} />)
      const matches = screen.getAllByText('Expires 2 year(s) from Effective Date.')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    it('reflects different mndaTermYears value', () => {
      render(<NdaPreview data={{ ...base, mndaTermYears: 5 }} />)
      expect(screen.getAllByText('Expires 5 year(s) from Effective Date.').length).toBeGreaterThanOrEqual(1)
    })

    it('shows until-terminated text when selected', () => {
      render(<NdaPreview data={{ ...base, mndaTermType: 'until-terminated' }} />)
      expect(
        screen.getAllByText('Continues until terminated in accordance with the terms of the MNDA.').length
      ).toBeGreaterThanOrEqual(1)
    })

    it('does not show expires text when until-terminated is selected', () => {
      render(<NdaPreview data={{ ...base, mndaTermType: 'until-terminated' }} />)
      expect(screen.queryByText(/Expires \d+ year/)).not.toBeInTheDocument()
    })
  })

  describe('confidentiality term', () => {
    it('shows years-based term with correct count', () => {
      render(<NdaPreview data={base} />)
      expect(
        screen.getAllByText(/3 year\(s\) from Effective Date/).length
      ).toBeGreaterThanOrEqual(1)
    })

    it('includes trade secret language for years type', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getAllByText(/trade secrets/).length).toBeGreaterThanOrEqual(1)
    })

    it('shows "In perpetuity." when perpetuity is selected', () => {
      render(<NdaPreview data={{ ...base, confidentialityTermType: 'perpetuity' }} />)
      expect(screen.getAllByText('In perpetuity.').length).toBeGreaterThanOrEqual(1)
    })

    it('does not show years text when perpetuity is selected', () => {
      // also set until-terminated so the MNDA term section doesn't contribute "year(s)" text
      render(<NdaPreview data={{ ...base, mndaTermType: 'until-terminated', confidentialityTermType: 'perpetuity' }} />)
      expect(screen.queryByText(/year\(s\) from Effective Date/)).not.toBeInTheDocument()
    })
  })

  describe('governing law and jurisdiction', () => {
    it('shows governing law value', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getAllByText('California').length).toBeGreaterThanOrEqual(1)
    })

    it('shows jurisdiction value', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getAllByText('San Francisco, CA').length).toBeGreaterThanOrEqual(1)
    })

    it('shows placeholder for empty governing law', () => {
      render(<NdaPreview data={{ ...base, governingLaw: '' }} />)
      expect(screen.getByText('State')).toBeInTheDocument()
    })

    it('shows placeholder for empty jurisdiction', () => {
      render(<NdaPreview data={{ ...base, jurisdiction: '' }} />)
      expect(screen.getByText('City/county and state')).toBeInTheDocument()
    })
  })

  describe('modifications section', () => {
    it('does not render modifications heading when empty', () => {
      render(<NdaPreview data={base} />)
      expect(screen.queryByText('MNDA Modifications')).not.toBeInTheDocument()
    })

    it('does not render modifications heading when only whitespace', () => {
      render(<NdaPreview data={{ ...base, modifications: '   ' }} />)
      expect(screen.queryByText('MNDA Modifications')).not.toBeInTheDocument()
    })

    it('renders modifications heading and content when text is provided', () => {
      render(<NdaPreview data={{ ...base, modifications: 'Clause 3 is amended.' }} />)
      expect(screen.getByText('MNDA Modifications')).toBeInTheDocument()
      expect(screen.getByText('Clause 3 is amended.')).toBeInTheDocument()
    })

    it('renders modification text with whitespace-pre-wrap class for newline preservation', () => {
      render(<NdaPreview data={{ ...base, modifications: 'Clause A and Clause B' }} />)
      const el = screen.getByText('Clause A and Clause B')
      expect(el).toHaveClass('whitespace-pre-wrap')
    })
  })

  describe('signing table', () => {
    it('has Party 1 and Party 2 column headers', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Party 1')).toBeInTheDocument()
      expect(screen.getByText('Party 2')).toBeInTheDocument()
    })

    it('has Signature row', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Signature')).toBeInTheDocument()
    })

    it('has Print Name row label', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Print Name')).toBeInTheDocument()
    })

    it('has Title row label', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('has Company row label', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Company')).toBeInTheDocument()
    })

    it('has Notice Address row label', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Notice Address')).toBeInTheDocument()
    })

    it('has Date row', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Date')).toBeInTheDocument()
    })

    it('shows party 1 print name', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('shows party 2 print name', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    it('shows party 1 title', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('CEO')).toBeInTheDocument()
    })

    it('shows party 2 title', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('CFO')).toBeInTheDocument()
    })

    it('shows party 1 company', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('TechCo')).toBeInTheDocument()
    })

    it('shows party 2 company', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('FinCo')).toBeInTheDocument()
    })

    it('shows party 1 notice address', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('jane@techco.com')).toBeInTheDocument()
    })

    it('shows party 2 notice address', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('john@finco.com')).toBeInTheDocument()
    })

    it('shows dash placeholder for empty party field', () => {
      render(<NdaPreview data={{ ...base, party1: { ...base.party1, printName: '' } }} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('renders signing instruction', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText(/By signing this Cover Page/)).toBeInTheDocument()
    })
  })

  describe('standard terms', () => {
    it('renders all 11 numbered terms', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('1. Introduction.')).toBeInTheDocument()
      expect(screen.getByText('2. Use and Protection.')).toBeInTheDocument()
      expect(screen.getByText('3. Exceptions.')).toBeInTheDocument()
      expect(screen.getByText('4. Disclosures Required by Law.')).toBeInTheDocument()
      expect(screen.getByText('5. Term and Termination.')).toBeInTheDocument()
      expect(screen.getByText('6. Return or Destruction.')).toBeInTheDocument()
      expect(screen.getByText('7. Proprietary Rights.')).toBeInTheDocument()
      expect(screen.getByText('8. Disclaimer.')).toBeInTheDocument()
      expect(screen.getByText('9. Governing Law and Jurisdiction.')).toBeInTheDocument()
      expect(screen.getByText('10. Equitable Relief.')).toBeInTheDocument()
      expect(screen.getByText('11. General.')).toBeInTheDocument()
    })

    it('term 1 paragraph includes the purpose', () => {
      render(<NdaPreview data={base} />)
      const term = screen.getByText('1. Introduction.').closest('p')
      expect(term).toHaveTextContent(base.purpose)
    })

    it('term 2 paragraph includes the purpose', () => {
      render(<NdaPreview data={base} />)
      const term = screen.getByText('2. Use and Protection.').closest('p')
      expect(term).toHaveTextContent(base.purpose)
    })

    it('term 9 paragraph includes governing law', () => {
      render(<NdaPreview data={base} />)
      const term = screen.getByText('9. Governing Law and Jurisdiction.').closest('p')
      expect(term).toHaveTextContent('California')
    })

    it('term 9 paragraph includes jurisdiction', () => {
      render(<NdaPreview data={base} />)
      const term = screen.getByText('9. Governing Law and Jurisdiction.').closest('p')
      expect(term).toHaveTextContent('San Francisco, CA')
    })

    it('term 5 paragraph includes effective date', () => {
      render(<NdaPreview data={base} />)
      const term = screen.getByText('5. Term and Termination.').closest('p')
      expect(term).toHaveTextContent('2026-03-01')
    })
  })

  describe('footer', () => {
    it('renders Common Paper attribution', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText(/Common Paper Mutual Non-Disclosure Agreement/)).toBeInTheDocument()
    })

    it('renders Version 1.0 link', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('Version 1.0')).toBeInTheDocument()
    })

    it('renders CC BY 4.0 link', () => {
      render(<NdaPreview data={base} />)
      expect(screen.getByText('CC BY 4.0')).toBeInTheDocument()
    })
  })
})
