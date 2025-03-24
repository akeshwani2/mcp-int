"use client";

import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Categories } from '../components/marketplace/Categories'
import { MarketplaceHeader } from '../components/marketplace/MarketplaceHeader'
import { PopularMCPs } from '../components/marketplace/PopularMCPs'
import { ProductivityMCPs } from '../components/marketplace/ProductivityMCPs'
import { DeveloperToolsMCPs } from '../components/marketplace/DeveloperToolsMCPs'
import { MarketingSocialMCPs } from '../components/marketplace/MarketingSocialMCPs'
import { CollaborationCommunicationMCPs } from '../components/marketplace/CollaborationCommunicationMCPs'
import { AnalyticsDataMCPs } from '../components/marketplace/AnalyticsDataMCPs'
import { FinanceCryptoMCPs } from '../components/marketplace/FinanceCryptoMCPs'
import { CATEGORY_SECTIONS } from '../components/marketplace/mcp-data'

function Page() {
  const handleCategoryChange = (categoryId: string) => {
    const sectionId = CATEGORY_SECTIONS[categoryId as keyof typeof CATEGORY_SECTIONS]
    if (sectionId) {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
        <h1 className="text-xl font-medium tracking-tight text-white mb-6">Marketplace</h1>
        <MarketplaceHeader />
        
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="md:w-1/5 md:sticky md:top-8 self-start h-auto">
            <Categories onCategoryChange={handleCategoryChange} />
          </div>
          
          <div className="md:w-4/5 space-y-12">
            <PopularMCPs />
            <ProductivityMCPs />
            <DeveloperToolsMCPs />
            <MarketingSocialMCPs />
            <CollaborationCommunicationMCPs />
            <AnalyticsDataMCPs />
            <FinanceCryptoMCPs />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page