import { Typography } from '@mui/material'

import {
  Entry,
  EntryBar,
  EntryBody,
  EntryList,
  EntryMeta,
  FeedLabel,
  FeedRoot,
} from './StatusFeed.styles'
import type { StatusFeedProps } from './StatusFeed.types'

/**
 * Bitácora de eventos del sistema, de más reciente a más antiguo.
 *
 * Alta densidad a propósito: tipografía chica, interlineado corto y una barra
 * fina como eje temporal a la izquierda de cada entrada. El metadato va en la
 * monoespaciada del design system, la misma que el resto de la app usa para
 * datos técnicos (ids, timestamps).
 *
 * La lista se marca como `<ol>`: es una secuencia cronológica, y el orden es
 * información, no presentación. `as` y no `component`, porque `styled()` no
 * expone `component` (component-structure.md §3.2).
 */
export function StatusFeed({ label, entries, emptyMessage }: StatusFeedProps) {
  const hasEntries = entries.length > 0

  if (!hasEntries && !emptyMessage) return null

  return (
    <FeedRoot>
      {label ? (
        <FeedLabel variant="labelSm" color="text.secondary">
          {label}
        </FeedLabel>
      ) : null}

      {hasEntries ? (
        <EntryList as="ol">
          {entries.map((entry) => (
            <Entry key={entry.id} as="li" current={Boolean(entry.current)}>
              {/* Decorativa: el estado ya lo comunican el orden y el metadato. */}
              <EntryBar current={Boolean(entry.current)} aria-hidden />
              <EntryBody>
                <Typography variant="bodyMd">{entry.title}</Typography>
                {entry.meta ? (
                  <EntryMeta variant="dataMono" color="text.secondary">
                    {entry.meta}
                  </EntryMeta>
                ) : null}
              </EntryBody>
            </Entry>
          ))}
        </EntryList>
      ) : (
        <Typography variant="bodyMd" color="text.secondary">
          {emptyMessage}
        </Typography>
      )}
    </FeedRoot>
  )
}
