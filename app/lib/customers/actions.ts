// backend actions for customers
'use server'
//imports

//data validation
import {  z } from 'zod'
//query to db
import { sql } from '@vercel/postgres'
//clear chache and trigger a new request to server
import { revalidatePath } from 'next/cache'
// redirect users to selected page
import { redirect } from 'next/navigation'

import { randomUUID } from 'crypto'

//CUSTOMERS

//for customers only

export type CustomerState = {
  errors?: {
    name?: string[],
    email?: string[],
    image_url?: string[],
  }
  message?: string | null
}

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string({
    invalid_type_error: 'Invalid Email',
  }),
  image_url: z.string(),
})
const CreateCustomer = CustomerFormSchema.omit({id: true})

//CREATE CUSTOMERS

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

//UPDATE CUSTOMER

//DELETE CUSTOMER

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
