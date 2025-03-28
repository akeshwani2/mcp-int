import React from 'react'
import CalendarWidget from '../components/CalendarWidget'

const page = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <CalendarWidget variant="full" />
    </div>
  )
}

export default page