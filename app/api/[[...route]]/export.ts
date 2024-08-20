import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import { transactions, accounts, categories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

const app = new Hono()

app.get('/', async (c) => {
  const { userId } = auth()
  if (!userId) {
    return c.text('Unauthorized', 401)
  }

  try {
    const userTransactions = await db
    .select({
      id: transactions.id,
      date: transactions.date,
      amount: transactions.amount,
      payee: transactions.payee,
      notes: transactions.notes,
      account_name: accounts.name,
      category_name: categories.name
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.accountId, userId))
    .execute()

    console.log('Fetched transactions:', userTransactions)

    if (userTransactions.length === 0) {
      return c.text('No transactions found', 404)
    }

    const csv = generateCSV(userTransactions)
    
    c.header('Content-Type', 'text/csv; charset=utf-8')
    c.header('Content-Disposition', 'attachment; filename=transactions.csv')
    return c.body(csv)
  } catch (error) {
    console.error('Export error:', error)
    return c.json({ error: 'Failed to export transactions' }, 500)
  }
})

function generateCSV(data: { id: string; date: Date; amount: number; payee: string; notes: string | null; account_name: string | null; category_name: string | null }[]) {
  const headers = ['Date', 'Payee', 'Amount', 'Notes', 'Account', 'Category']
  const rows = data.map(t => [
    t.date.toISOString(),
    t.payee || '',
    (t.amount / 100).toFixed(2),
    t.notes || '',
    t.account_name || '',
    t.category_name || ''
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

export default app
