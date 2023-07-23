import { useState, type ReactElement } from 'react'
import { Grid } from '@mui/material'
import PendingTxsList from '@/components/dashboard/PendingTxs/PendingTxsList'
import Overview from '@/components/dashboard/Overview/Overview'
import ConfettiExplosion from 'react-confetti-explosion'

import { FeaturedApps } from '@/components/dashboard/FeaturedApps/FeaturedApps'
import GovernanceSection from '@/components/dashboard/GovernanceSection/GovernanceSection'
import CreationDialog from '@/components/dashboard/CreationDialog'
import { useRouter } from 'next/router'
import Relaying from '@/components/dashboard/Relaying'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { CREATION_MODAL_QUERY_PARM } from '../new-safe/create/logic'
import ChatFeed from '../chat'

const Dashboard = (): ReactElement => {
  const router = useRouter()
  const supportsRelaying = useHasFeature(FEATURES.RELAYING)
  const { [CREATION_MODAL_QUERY_PARM]: showCreationModal = '' } = router.query
  const [isExploding, setIsExploding] = useState(false)

  // Check if the URL contains the string "chapeau"
  const containsChapeau = router.asPath.includes('chapeau')

  // Function to start the explosion
  const startExplosion = () => {
    setIsExploding(true)
    setTimeout(() => setIsExploding(false), 2000) // Reset the explosion after 2 seconds
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Overview />
        </Grid>

        <Grid item xs={12} lg={6}>
          <PendingTxsList size={4} />
        </Grid>

        <Grid item xs={12} lg={supportsRelaying ? 6 : undefined}>
          <FeaturedApps stackedLayout={!!supportsRelaying} />
        </Grid>
        {containsChapeau && (
          <ConfettiExplosion
            duration={2000}
            style={{ position: 'absolute', bottom: '50%', right: '50%' }}
            force={0.8}
            onComplete={() => setIsExploding(false)}
          />
        )}
        {supportsRelaying ? (
          <Grid item xs={12} lg={6}>
            <Relaying />
          </Grid>
        ) : null}

        <Grid item xs={12}>
          <GovernanceSection />
        </Grid>

        <Grid item xs={12}>
          <ChatFeed />
        </Grid>
      </Grid>
      {showCreationModal ? <CreationDialog /> : null}
    </>
  )
}

export default Dashboard
