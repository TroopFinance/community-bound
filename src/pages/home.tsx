import type { NextPage } from 'next'
import Head from 'next/head'

import Dashboard from '@/components/dashboard'
import { useEffect } from 'react'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Dashboard'}</title>
      </Head>

      <main>
        <Dashboard />
      </main>
    </>
  )
}

export default Home
