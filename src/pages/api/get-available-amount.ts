import type { NextApiRequest, NextApiResponse } from 'next'

interface AvailableBalanceResponse {
  currentBalance: number | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AvailableBalanceResponse | { message: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { network, ticker } = req.query

  if (!network || !ticker) {
    return res.status(400).json({ message: 'Network and ticker are required query parameters' })
  }

  try {
    const response = await fetch(`https://navette.jcloud.ik-server.com/swaps/available?network=${network}&ticker=${ticker}`, {
      // const response = await fetch(`http://localhost:3000/swaps/available?network=${network}&ticker=${ticker}`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: AvailableBalanceResponse = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching available balance:', error)
    res.status(500).json({ message: 'Failed to fetch available balance' })
  }
}
