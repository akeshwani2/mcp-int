import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Categories } from '../components/marketplace/Categories'
import { MarketplaceHeader } from '../components/marketplace/MarketplaceHeader'
import { PopularMCPs } from '../components/marketplace/PopularMCPs'
import { ProductivityMCPs } from '../components/marketplace/ProductivityMCPs'

function Page() {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
        {/* <h1 className="text-xl font-medium tracking-tight text-white mb-6">Marketplace</h1>
        <MarketplaceHeader /> */}
        
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="md:w-1/5">
            <Categories />
          </div>
          
          <div className="md:w-4/5 space-y-4">
            <PopularMCPs />
            <ProductivityMCPs />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page