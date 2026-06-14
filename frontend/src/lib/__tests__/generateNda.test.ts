import { generateNdaMarkdown } from '../generateNda'
import { NdaFormData } from '../types'

const base: NdaFormData = {
  purpose: 'Evaluating a potential business partnership',
  effectiveDate: '2026-01-15',
  mndaTermType: 'expires',
  mndaTermYears: 1,
  confidentialityTermType: 'years',
  confidentialityTermYears: 2,
  governingLaw: 'Delaware',
  jurisdiction: 'New Castle, DE',
  modifications: '',
  party1: { printName: 'Alice Smith', title: 'CEO', company: 'Acme Corp', noticeAddress: 'alice@acme.com' },
  party2: { printName: 'Bob Jones', title: 'CTO', company: 'Widget Inc', noticeAddress: 'bob@widget.com' },
}

describe('generateNdaMarkdown', () => {
  describe('return type', () => {
    it('returns a non-empty string', () => {
      const result = generateNdaMarkdown(base)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('document structure', () => {
    it('includes the main title', () => {
      expect(generateNdaMarkdown(base)).toContain('# Mutual Non-Disclosure Agreement')
    })

    it('includes the Cover Page section', () => {
      expect(generateNdaMarkdown(base)).toContain('## Cover Page')
    })

    it('includes the Standard Terms section', () => {
      expect(generateNdaMarkdown(base)).toContain('## Standard Terms')
    })

    it('references Common Paper standard', () => {
      expect(generateNdaMarkdown(base)).toContain('commonpaper.com')
    })
  })

  describe('purpose field', () => {
    it('includes purpose in the Cover Page', () => {
      expect(generateNdaMarkdown(base)).toContain(base.purpose)
    })

    it('includes purpose multiple times (intro + use/protection)', () => {
      const result = generateNdaMarkdown(base)
      const occurrences = result.split(base.purpose).length - 1
      expect(occurrences).toBeGreaterThanOrEqual(2)
    })

    it('reflects a changed purpose', () => {
      const data = { ...base, purpose: 'Exploring a joint venture' }
      expect(generateNdaMarkdown(data)).toContain('Exploring a joint venture')
    })
  })

  describe('effective date', () => {
    it('includes the effective date', () => {
      expect(generateNdaMarkdown(base)).toContain('2026-01-15')
    })

    it('reflects a changed effective date', () => {
      const data = { ...base, effectiveDate: '2027-06-30' }
      expect(generateNdaMarkdown(data)).toContain('2027-06-30')
    })
  })

  describe('MNDA term — expires', () => {
    it('generates expires text with correct year count', () => {
      expect(generateNdaMarkdown(base)).toContain('Expires 1 year(s) from Effective Date.')
    })

    it('uses the provided mndaTermYears value', () => {
      const data = { ...base, mndaTermYears: 3 }
      expect(generateNdaMarkdown(data)).toContain('Expires 3 year(s) from Effective Date.')
    })

    it('does not include until-terminated text when expires is selected', () => {
      expect(generateNdaMarkdown(base)).not.toContain('until terminated')
    })
  })

  describe('MNDA term — until-terminated', () => {
    it('generates until-terminated text', () => {
      const data = { ...base, mndaTermType: 'until-terminated' as const }
      expect(generateNdaMarkdown(data)).toContain(
        'Continues until terminated in accordance with the terms of the MNDA.'
      )
    })

    it('does not include expires text when until-terminated is selected', () => {
      const data = { ...base, mndaTermType: 'until-terminated' as const }
      expect(generateNdaMarkdown(data)).not.toContain('Expires')
    })
  })

  describe('confidentiality term — years', () => {
    it('generates years-based term with correct count', () => {
      expect(generateNdaMarkdown(base)).toContain('2 year(s) from Effective Date')
    })

    it('uses the provided confidentialityTermYears value', () => {
      const data = { ...base, confidentialityTermYears: 5 }
      expect(generateNdaMarkdown(data)).toContain('5 year(s) from Effective Date')
    })

    it('includes trade secret carve-out for years type', () => {
      expect(generateNdaMarkdown(base)).toContain('trade secrets')
    })

    it('does not include "In perpetuity" when years is selected', () => {
      expect(generateNdaMarkdown(base)).not.toContain('In perpetuity.')
    })
  })

  describe('confidentiality term — perpetuity', () => {
    it('generates perpetuity text', () => {
      const data = { ...base, confidentialityTermType: 'perpetuity' as const }
      expect(generateNdaMarkdown(data)).toContain('In perpetuity.')
    })

    it('does not include years-based text when perpetuity is selected', () => {
      // also set until-terminated so the MNDA term doesn't contribute "year(s)" text
      const data = { ...base, mndaTermType: 'until-terminated' as const, confidentialityTermType: 'perpetuity' as const }
      expect(generateNdaMarkdown(data)).not.toContain('year(s) from Effective Date')
    })
  })

  describe('governing law and jurisdiction', () => {
    it('includes governing law', () => {
      expect(generateNdaMarkdown(base)).toContain('Delaware')
    })

    it('includes jurisdiction', () => {
      expect(generateNdaMarkdown(base)).toContain('New Castle, DE')
    })

    it('reflects changed governing law', () => {
      const data = { ...base, governingLaw: 'California' }
      expect(generateNdaMarkdown(data)).toContain('California')
    })
  })

  describe('modifications', () => {
    it('shows _None_ when modifications is empty', () => {
      expect(generateNdaMarkdown(base)).toContain('_None_')
    })

    it('shows _None_ when modifications is only whitespace', () => {
      const data = { ...base, modifications: '   \n  ' }
      expect(generateNdaMarkdown(data)).toContain('_None_')
    })

    it('includes modifications text when provided', () => {
      const data = { ...base, modifications: 'Section 3 is amended.' }
      expect(generateNdaMarkdown(data)).toContain('Section 3 is amended.')
    })

    it('does not show _None_ when modifications is provided', () => {
      const data = { ...base, modifications: 'Section 3 is amended.' }
      expect(generateNdaMarkdown(data)).not.toContain('_None_')
    })

    it('trims leading and trailing whitespace from modifications', () => {
      const data = { ...base, modifications: '  Some custom clause.  ' }
      expect(generateNdaMarkdown(data)).toContain('Some custom clause.')
    })
  })

  describe('party information', () => {
    it('includes party 1 print name', () => {
      expect(generateNdaMarkdown(base)).toContain('Alice Smith')
    })

    it('includes party 1 title', () => {
      expect(generateNdaMarkdown(base)).toContain('CEO')
    })

    it('includes party 1 company', () => {
      expect(generateNdaMarkdown(base)).toContain('Acme Corp')
    })

    it('includes party 1 notice address', () => {
      expect(generateNdaMarkdown(base)).toContain('alice@acme.com')
    })

    it('includes party 2 print name', () => {
      expect(generateNdaMarkdown(base)).toContain('Bob Jones')
    })

    it('includes party 2 title', () => {
      expect(generateNdaMarkdown(base)).toContain('CTO')
    })

    it('includes party 2 company', () => {
      expect(generateNdaMarkdown(base)).toContain('Widget Inc')
    })

    it('includes party 2 notice address', () => {
      expect(generateNdaMarkdown(base)).toContain('bob@widget.com')
    })
  })
})
