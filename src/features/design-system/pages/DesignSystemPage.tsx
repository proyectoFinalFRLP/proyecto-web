import AddIcon from '@mui/icons-material/Add'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Box, Button, Divider, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { PageWrapper, StatusBadge, StatusSelect, type StatusVariant } from 'shared/components'

import {
  badgeSamples,
  badgeSizes,
  buttonHierarchies,
  buttonIntents,
  dsCopy,
  elevationLevels,
  inputSamples,
  statusOptions,
  typeSpecs,
} from '../content'

const BADGE_ICONS: Record<StatusVariant, ReactElement> = {
  success: <CheckCircleOutlinedIcon />,
  info: <InfoOutlinedIcon />,
  warning: <WarningAmberOutlinedIcon />,
  error: <CancelOutlinedIcon />,
  neutral: <RemoveCircleOutlineIcon />,
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h2">{title}</Typography>
        {subtitle ? (
          <Typography variant="bodyMd" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Box>
  )
}

// Demo del componente reutilizable StatusSelect (badge clickeable + dropdown).
function StatusSelectDemo() {
  const [value, setValue] = useState<StatusVariant>('info')
  return <StatusSelect options={statusOptions} value={value} onChange={setValue} />
}

export function DesignSystemPage() {
  return (
    <PageWrapper>
      <Stack spacing={5}>
        <Box>
          <Typography variant="displaySm">{dsCopy.pageTitle}</Typography>
          <Typography variant="bodyLg" color="text.secondary">
            {dsCopy.pageSubtitle}
          </Typography>
        </Box>

        <Divider />

        <Section
          title={dsCopy.sections.typography.title}
          subtitle={dsCopy.sections.typography.subtitle}
        >
          <Stack spacing={1.5}>
            {typeSpecs.map((t) => (
              <Box
                key={t.note}
                sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}
              >
                <Typography variant="labelSm" color="text.secondary" sx={{ minWidth: 140 }}>
                  {t.note}
                </Typography>
                <Typography variant={t.variant}>{t.sample}</Typography>
              </Box>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section
          title={dsCopy.sections.elevation.title}
          subtitle={dsCopy.sections.elevation.subtitle}
        >
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            {elevationLevels.map(({ level, label }) => (
              <Box
                key={level}
                sx={(theme) => ({
                  width: 150,
                  height: 96,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                  border: theme.elevation[level].border,
                  boxShadow: theme.elevation[level].boxShadow,
                })}
              >
                <Typography variant="labelMd" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section title={dsCopy.sections.buttons.title} subtitle={dsCopy.sections.buttons.subtitle}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto repeat(3, 1fr)',
              gap: 2,
              alignItems: 'center',
              maxWidth: 640,
            }}
          >
            <Box />
            {buttonHierarchies.map((h) => (
              <Typography key={h.label} variant="labelMd" color="text.secondary">
                {h.label}
              </Typography>
            ))}

            {buttonIntents.map((intent) => (
              <Box key={intent.label} sx={{ display: 'contents' }}>
                <Typography variant="labelMd" color="text.secondary">
                  {intent.label}
                </Typography>
                {buttonHierarchies.map((h) => (
                  <Box key={h.label}>
                    <Button variant={h.variant} color={intent.color}>
                      {dsCopy.labels.action}
                    </Button>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Section>

        <Divider />

        <Section
          title={dsCopy.sections.buttonIcons.title}
          subtitle={dsCopy.sections.buttonIcons.subtitle}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button variant="contained" color="primary" startIcon={<AddIcon />}>
              {dsCopy.labels.newOrder}
            </Button>
            <Button variant="outlined" color="primary" startIcon={<FileDownloadOutlinedIcon />}>
              {dsCopy.labels.export}
            </Button>
            <Button variant="text" color="error" startIcon={<DeleteOutlineIcon />}>
              {dsCopy.labels.delete}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <IconButton color="primary" aria-label={dsCopy.labels.edit}>
              <EditOutlinedIcon />
            </IconButton>
            <IconButton color="error" aria-label={dsCopy.labels.delete}>
              <DeleteOutlineIcon />
            </IconButton>
            <IconButton aria-label={dsCopy.labels.viewDetails}>
              <VisibilityOutlinedIcon />
            </IconButton>
          </Stack>
        </Section>

        <Divider />

        <Section title={dsCopy.sections.sizes.title} subtitle={dsCopy.sections.sizes.subtitle}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />}>
              {dsCopy.labels.newOrder}
            </Button>
            <Button variant="contained" color="primary" size="medium" startIcon={<AddIcon />}>
              {dsCopy.labels.newOrder}
            </Button>
            <Button variant="contained" color="primary" size="large" startIcon={<AddIcon />}>
              {dsCopy.labels.newOrder}
            </Button>
            <Button variant="contained" color="primary" disabled>
              {dsCopy.labels.disabled}
            </Button>
            <Button variant="outlined" color="error" disabled>
              {dsCopy.labels.disabled}
            </Button>
          </Stack>
        </Section>

        <Divider />

        <Section title={dsCopy.sections.inputs.title} subtitle={dsCopy.sections.inputs.subtitle}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ maxWidth: 680 }}>
            {inputSamples.map((input) => (
              <Stack key={input.label} spacing={0.75} sx={{ minWidth: 200 }}>
                <Typography
                  variant="labelMd"
                  component="label"
                  color={
                    input.error ? 'error' : input.disabled ? 'text.disabled' : 'text.secondary'
                  }
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {input.label}
                </Typography>
                <TextField
                  placeholder={input.placeholder}
                  defaultValue={input.defaultValue}
                  helperText={input.helperText}
                  disabled={input.disabled}
                  error={input.error}
                  size="small"
                />
              </Stack>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section title={dsCopy.sections.badges.title} subtitle={dsCopy.sections.badges.subtitle}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="labelMd" color="text.secondary" gutterBottom>
                {dsCopy.badgeGroups.withoutIcon}
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {badgeSamples.map((b) => (
                  <StatusBadge key={b.status} status={b.status} label={b.label} />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="labelMd" color="text.secondary" gutterBottom>
                {dsCopy.badgeGroups.withIcon}
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {badgeSamples.map((b) => (
                  <StatusBadge
                    key={b.status}
                    status={b.status}
                    label={b.label}
                    icon={BADGE_ICONS[b.status]}
                  />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="labelMd" color="text.secondary" gutterBottom>
                {dsCopy.badgeGroups.sizes}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                {badgeSizes.map((size) => (
                  <StatusBadge
                    key={size}
                    size={size}
                    status={statusOptions[0].status}
                    label={statusOptions[0].label}
                    icon={BADGE_ICONS[statusOptions[0].status]}
                  />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="labelMd" color="text.secondary" gutterBottom>
                {dsCopy.badgeGroups.interactive}
              </Typography>
              <StatusSelectDemo />
            </Box>
          </Stack>
        </Section>
      </Stack>
    </PageWrapper>
  )
}
