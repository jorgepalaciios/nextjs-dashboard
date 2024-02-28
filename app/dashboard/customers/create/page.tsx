//UI
import CustomerForm from '@/app/ui/customers/create-form'
import Breadcrumbs from '@/app/ui/customers/breadcrumbs'

//DATA
import { fetchCustomers } from '@/app/lib/data'

//Metadata
import { Metadata } from 'next'

export const metadata:Metadata = {
  title: 'Create Customer'
}

export default async function Page () {
  // const customers = await fetchCustomers()

  return (
    <main>
      <h1>Let&#39;s do it right</h1>
            <Breadcrumbs 
        breadcrumbs={[
          {
            label: 'Invoices', href: '/dashboard/customers'},
          {
            label: 'Create Customer',
            href: '/dashboard/customers/create',
            active: true,
          },
        ]}
      />
      <CustomerForm customer={[]}  />
    </main>
  )
}