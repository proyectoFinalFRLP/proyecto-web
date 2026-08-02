import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { IconButton, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'

import { topNavContent } from './content'
import { SearchInput, SearchRoot } from './TopNavBar.styles'

// Autocontenida: mantiene su propio valor y el toggle de colapso en mobile.
// Sin `onSearch` — la card solo pide capturar el input; la búsqueda global
// real se cablea cuando exista la feature correspondiente.
export function NavSearch() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [value, setValue] = useState('')

  if (isMobile && !mobileOpen) {
    return (
      <IconButton
        aria-label={topNavContent.openSearchAriaLabel}
        onClick={() => setMobileOpen(true)}
        sx={{ color: 'text.secondary' }}
      >
        <SearchIcon fontSize="small" />
      </IconButton>
    )
  }

  return (
    <SearchRoot expanded={isMobile}>
      <SearchIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <SearchInput
        autoFocus={isMobile}
        placeholder={topNavContent.searchPlaceholder}
        inputProps={{ 'aria-label': topNavContent.searchAriaLabel }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {isMobile ? (
        <IconButton
          size="small"
          aria-label={topNavContent.closeSearchAriaLabel}
          onClick={() => {
            setMobileOpen(false)
            setValue('')
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      ) : null}
    </SearchRoot>
  )
}
