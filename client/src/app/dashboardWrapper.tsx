"use client";

import React, { useEffect } from 'react'
import Navbar from './(components)/navbar/index'
import StorProvider,{ useAppSelector } from './redux'
import Sidebar from "./(components)/sidebar/index"
const DashboardLayout = ({children} : {children : React.ReactNode}) => {

  const isSidebarCollapsed=useAppSelector((state)=>state.global.isSidebarCollapsed);
  const isDarkMode=useAppSelector((state)=>state.global.isDarkMode);

  useEffect(()=>{
    if (isDarkMode){
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }else{
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  },[isDarkMode])
  return(
    <div dir='rtl' className='flex bg-gray-50 text-gray-900 w-full min-h-screen'>
    {/*sidebar */}
    <Sidebar/>
    <main className={`flex flex-col py-10 px-9 w-full bg-gray-50 mb-5  ${isSidebarCollapsed ? `md:pr-24`: `md:pr-72`}`}>
        {/*navbar */}
        <Navbar/>
        {children}
    </main>
</div>
  )
 
};



const dashboardWrapper = ({children} : {children : React.ReactNode}) => {
  return (
   <StorProvider>
    <DashboardLayout>{children}</DashboardLayout>
   </StorProvider>
  )
};

export default dashboardWrapper