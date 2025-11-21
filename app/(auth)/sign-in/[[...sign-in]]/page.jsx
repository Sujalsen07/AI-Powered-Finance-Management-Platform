import { SignIn } from '@clerk/nextjs'
import React from 'react'

const Page = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn 
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl="/"
      />
    </div>
  )
}

export default Page;
