//UI
import CustomerForm from '@/app/ui/customers/create-form'
import Breadcrumbs from '@/app/ui/customers/breadcrumbs'

//DATA
// import { fetchCustomersData } from '@/app/lib/data'

//Metadata
import { Metadata } from 'next'

export const metadata:Metadata = {
  title: 'Create Customer'
}

export default async function Page () {
    return (
    <main>
      <Breadcrumbs 
        breadcrumbs={[
          {
            label: 'Customers', href: '/dashboard/customers'},
          {
            label: 'Create Customer',
            href: '/dashboard/customers/create',
            active: true,
          },
        ]}
      />
      <CustomerForm  />
    </main>
  )
}