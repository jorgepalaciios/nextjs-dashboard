'use client'
import { useFormState } from 'react-dom'
import { Customer } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createCustomer } from '@/app/lib/actions';

export default function CustomerForm ({customer}: {customer: Customer[]}) {
  const initialState = {message: null, errors: {} }
  const [state, dispatch] = useFormState(createCustomer, initialState)

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          {/* <div id='customer-error' aria-live='polite' aria-atomic='true'>
            {state.errors?.customerId &&
              state.errors.customerId.map((error:string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>{error}</p>
              ))
            }
          </div> */}
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Type your name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby='amount-error'
                // required
              />
            </div>
            <div id='amount-error' aria-live='polite' aria-atomic='true'>
            {state.errors?.name &&
              state.errors.name.map((error:string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>{error}</p>
              ))
            }
          </div>
          </div>
        </div>

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Customer</Button>
      </div>
    </form>
  )
}