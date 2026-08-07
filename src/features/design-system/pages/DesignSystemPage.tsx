import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import AddIcon from '@mui/icons-material/Add'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Box, Button, Divider, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import {
  CompactStatCard,
  PageWrapper,
  ProgressIndicator,
  ProgressSkeleton,
  StatCard,
  StatusBadge,
  StatusSelect,
  StepsProgress,
  TopNavBar,
  type StatusVariant,
  type TopNavThemeMode,
} from 'shared/components'

import { FulfillmentPanel } from '../components/FulfillmentPanel'
import { OperationalStatusCard } from '../components/OperationalStatusCard'
import {
  badgeSamples,
  badgeSizes,
  buttonHierarchies,
  buttonIntents,
  compactStatSamples,
  dsCopy,
  elevationLevels,
  inputSamples,
  progressSamples,
  progressVariants,
  statCardSamples,
  statusOptions,
  stepsSample,
  topNavDemoNotifications,
  topNavDemoUser,
  typeSpecs,
} from '../content'
import type { CompactSampleKey, StatSampleKey } from '../content'

// Grillas del catálogo: colapsan a una columna en mobile para que las tarjetas
// no se compriman.
//
// `minmax(0, 1fr)` y no `1fr`: `1fr` equivale a `minmax(auto, 1fr)`, y ese
// `auto` impide que la columna baje del min-content de su contenido. Con un
// valor largo adentro la grilla se ensancha más que el contenedor y la página
// desborda a lo ancho, cortando el final de cada fila.
const STAT_COLUMNS = {
  xs: 'minmax(0, 1fr)',
  sm: 'repeat(2, minmax(0, 1fr))',
  lg: 'repeat(4, minmax(0, 1fr))',
}
const COMPACT_COLUMNS = { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' }
const PAIR_COLUMNS = { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }
const PANEL_COLUMNS = { xs: 'minmax(0, 1fr)', md: 'minmax(0, 2fr) minmax(0, 1fr)' }

// Epígrafe de cada variante del catálogo (uppercase atenuado, como el spec).
const VARIANT_CAPTION = {
  display: 'block',
  mb: 1,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
} as const

const STAT_ICONS: Record<StatSampleKey, ReactElement | undefined> = {
  shipments: <LocalShippingOutlinedIcon />,
  speed: <SpeedOutlinedIcon />,
  damaged: <ReportProblemOutlinedIcon />,
  // La tarjeta comparativa no lleva ícono: el foco es el contraste de cifras.
  fleet: undefined,
}

const COMPACT_ICONS: Record<CompactSampleKey, ReactElement> = {
  onTime: <AccessTimeOutlinedIcon />,
  distance: <RouteOutlinedIcon />,
  carbon: <ParkOutlinedIcon />,
}

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
  // Demo autocontenido: estado local, no toca el uiStore real. Un catálogo
  // debe ser inerte — antes clickear la hamburguesa del ejemplo colapsaba el
  // Sidebar real que estaba detrás (review PR #19). Por eso tampoco se pasa
  // `onToggleSidebar`: sin sidebar en el preview, el botón no se renderiza.
  const [demoThemeMode, setDemoThemeMode] = useState<TopNavThemeMode>('dark')

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

        <Section title={dsCopy.sections.topNav.title} subtitle={dsCopy.sections.topNav.subtitle}>
          <Box
            sx={(theme) => ({
              position: 'relative',
              // Altura explícita: el AppBar interno es `position: fixed`
              // (intrínseco al componente vía el tema) y queda fuera del
              // flujo, así que no empuja la altura de este contenedor.
              height: theme.mixins.toolbar.minHeight,
              // Crea un containing block propio para que ese `fixed` quede
              // acotado a este preview en vez de cubrir la página.
              transform: 'translateZ(0)',
              overflow: 'hidden',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            })}
          >
            <TopNavBar
              brandTo="/"
              themeMode={demoThemeMode}
              onToggleTheme={() =>
                setDemoThemeMode((mode) => (mode === 'light' ? 'dark' : 'light'))
              }
              notificationsCount={topNavDemoNotifications}
              user={topNavDemoUser}
            />
          </Box>
        </Section>

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

        <Divider />

        <Section title={dsCopy.sections.stats.title} subtitle={dsCopy.sections.stats.subtitle}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: STAT_COLUMNS }}>
              {statCardSamples.map((stat) => (
                <StatCard
                  key={stat.key}
                  label={stat.label}
                  value={stat.value}
                  tone={stat.tone}
                  tag={stat.tag}
                  trend={stat.trend}
                  comparison={stat.comparison}
                  icon={STAT_ICONS[stat.key]}
                />
              ))}
            </Box>
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: COMPACT_COLUMNS }}>
              {compactStatSamples.map((stat) => (
                <CompactStatCard
                  key={stat.key}
                  label={stat.label}
                  value={stat.value}
                  tone={stat.tone}
                  icon={COMPACT_ICONS[stat.key]}
                />
              ))}
            </Box>
          </Stack>
        </Section>

        <Divider />

        <Section
          title={dsCopy.sections.progress.title}
          subtitle={dsCopy.sections.progress.subtitle}
        >
          <Stack spacing={4}>
            <Box>
              <Typography variant="labelMd" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                {dsCopy.progressGroups.semantic}
              </Typography>
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: PAIR_COLUMNS }}>
                {progressSamples.map((bar) => (
                  <ProgressIndicator
                    key={bar.label}
                    label={bar.label}
                    value={bar.value}
                    tone={bar.tone}
                    showValue
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="labelMd" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                {dsCopy.progressGroups.variants}
              </Typography>
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: PAIR_COLUMNS }}>
                {/* Los rótulos de las variantes son epígrafes del catálogo, no
                    labels de la métrica: van atenuados como en el spec, para no
                    competir con el nombre del grupo. */}
                <Box>
                  <Typography variant="labelSm" color="text.secondary" sx={VARIANT_CAPTION}>
                    {progressVariants.thin}
                  </Typography>
                  <ProgressIndicator
                    value={60}
                    size="thin"
                    tone="info"
                    ariaLabel={progressVariants.thin}
                  />
                </Box>
                <Box>
                  <Typography variant="labelSm" color="text.secondary" sx={VARIANT_CAPTION}>
                    {progressVariants.indeterminate}
                  </Typography>
                  <ProgressIndicator
                    indeterminate
                    tone="info"
                    ariaLabel={progressVariants.indeterminate}
                  />
                </Box>
                <Box>
                  <Typography variant="labelSm" color="text.secondary" sx={VARIANT_CAPTION}>
                    {progressVariants.steps}
                  </Typography>
                  <StepsProgress
                    tone="info"
                    ariaLabel={progressVariants.steps}
                    total={stepsSample.total}
                    completed={stepsSample.completed}
                    caption={stepsSample.caption}
                  />
                </Box>
                <Box>
                  <Typography variant="labelSm" color="text.secondary" sx={VARIANT_CAPTION}>
                    {progressVariants.skeleton}
                  </Typography>
                  <ProgressSkeleton />
                </Box>
              </Box>
            </Box>
          </Stack>
        </Section>

        <Divider />

        <Section
          title={dsCopy.sections.dataPanels.title}
          subtitle={dsCopy.sections.dataPanels.subtitle}
        >
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: PANEL_COLUMNS }}>
            <FulfillmentPanel />
            <OperationalStatusCard />
          </Box>
        </Section>
      </Stack>
    </PageWrapper>
  )
}
