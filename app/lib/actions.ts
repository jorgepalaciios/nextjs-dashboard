'use server'

//data validation
import { z } from 'zod'
//query to db
import { sql } from '@vercel/postgres'
//clear chache and trigger a new request to server
import { revalidatePath } from 'next/cache'
// redirect users to selected page
import { redirect } from 'next/navigation'


const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending','paid']),
  date: z.string(),
})

const CreateInvoice = FormSchema.omit({id: true, date: true})
const UpdateInvoice = FormSchema.omit({ id: true, date: true})

export async function createInvoice(formData: FormData) {
  const {customerId, amount, status} = CreateInvoice.parse( {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
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
  redirect('/dashboard/invoices')

  revalidatePath('/dashboard/invoices')

}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status} = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  const amountInCents = amount * 100

  try {
    await sql `
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
      `
      redirect('/dashboard/invoices')
  } catch (error) {
    return {
      message: 'Database Error: Failed to update invoice'
    }
  }
  revalidatePath('/dashboard/invoices')

}

export async function deleteInvoice(id: string) {
  // throw new Error('error')
  try {
    await sql `
      DELETE FROM invoices WHERE id = ${id}
    `
    revalidatePath('/dashboard/invoices')
  } catch (error) {
    return {
      message: 'Database Erro!: Failed to delete invoice'
  }}
}