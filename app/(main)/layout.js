import React from 'react'
import ProtectedPage from '@/components/ProtectedPage'

const MainLayout = ({children}) => {
  return (
    <ProtectedPage>
      <div className='container mx-auto px-4'>{children}</div>
    </ProtectedPage>
  )
}

export default MainLayout