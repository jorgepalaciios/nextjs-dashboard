'use server'

//data validation
import {  z } from 'zod'
//query to db
import { sql } from '@vercel/postgres'
//clear chache and trigger a new request to server
import { revalidatePath } from 'next/cache'
// redirect users to selected page
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { randomUUID } from 'crypto'


const FormSchema = z.object({
  //this is for invoices only
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.'
  }),
  amount: z.coerce.number().gt(0, {message: 'Please enter an amount greater than $0.'}),
  status: z.enum(['pending','paid'], {
    invalid_type_error: 'Please select an invoice status.'
  }),
  date: z.string(),
})

//for customers only
const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string({
    invalid_type_error: 'Invalid Email',
  }),
  image_url: z.string(),
})
const CreateInvoice = FormSchema.omit({id: true, date: true})
const UpdateInvoice = FormSchema.omit({ id: true, date: true})
const CreateCustomer = CustomerFormSchema.omit({id: true})

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[],
    amount?: string[],
    status?: string[],
  }
  message?: string | null
}

export type CustomerState = {
  errors?: {
    name?: string[],
    email?: string[],
    image_url?: string[],
  }
  message?: string | null
}

//CUSTOMERS


export async function createCustomer(formData: FormData) {
  const validateFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url')

  });
  
  if (!validateFields.success) {

    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing Fields, failed to create customer'
    }
  }

  const {name, email, image_url} = validateFields.data
  const id = randomUUID()

  const customer = {
    id: id,
    name: name,
    email: email,
    image_url: image_url
  }
  
  try {
    
    await sql`
    INSERT INTO customers (id, name, email, image_url)
    VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
    ON CONFLICT (id) DO NOTHING;
  `
  }
  
  catch (error) {
    return {
      message: 'Database Error: Failed to create customers'
      }
  }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/customers')
    redirect('/dashboard/customers')    

}

export async function deleteCustomer(id: string) {
  // throw new Error('error')
  try {
    await sql `
    DELETE FROM customers WHERE id = ${id}
    `
  } catch (error) {
    return {
      message: 'Database Error!: Failed to delete customer'
    }}
    // Revalidate the cache for the customers page and redirect the user.
    revalidatePath('/dashboard/customers')
  }

//INVOICES --->

export async function createInvoice(prevState: State, formData: FormData) {
  //parse was change to safeParse in order to validate data on the server side {customerId, amount, status}, now is validated using Zod
  const validateFields = CreateInvoice.safeParse( {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  //If form validation fails, return errors early. Otherwise continue.
  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing Fields, Failed to create invoice.'
    }
  }

// Prepare data for insertion into the database
  const {customerId, amount, status} = validateFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  
  try {
    await sql `
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `
} catch (error) {
    return {
    message: 'Database Error: Failed to create invoice'
    }
  }

    // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')

}

export async function updateInvoice( id: string, prevState: State, formData: FormData) {
  const validateFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  //If form validation fails, return errors early. Otherwise continue.
  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
        message: 'Missing Fields, Failed to update invoice.'
      }
    }

  const {customerId, amount, status} = validateFields.data
  const amountInCents = amount * 100

  try {
    await sql `
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `
  } catch (error) {
    return {
      message: 'Database Error: Failed to update invoice'
    }
  }
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
  
}

export async function deleteInvoice(id: string) {
  // throw new Error('error')
  try {
    await sql `
    DELETE FROM invoices WHERE id = ${id}
    `
  } catch (error) {
    return {
      message: 'Database Error!: Failed to delete invoice'
    }}
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices')
  }
  
  //Authentication
  
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
  ) {
    try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
          }
        }
        throw error;
      }
    }

