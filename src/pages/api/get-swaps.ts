import type { NextApiRequest, NextApiResponse } from 'next'

interface SwapData {
  hash: string
  executed: boolean
  user: string
  operator: string
  blockNumber: number
  isERC20: boolean
  tokenAddressOnSepolia: string
  tokenAddressOnOPSepolia: string
  amount: number
  sendTx: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const response = await fetch('https://navette.jcloud.ik-server.com/swaps', {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        message: 'Failed to fetch swaps',
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
    }

    const data: SwapData[] = await response.json()
    res.status(200).json(data)
  } catch (error: any) {
    console.error('Error fetching swaps:', error)
    res.status(500).json({ message: 'Internal server error', error: error.toString() })
  }
}
