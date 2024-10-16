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
  sendTx: string // This is now required
}

interface SwapResponse {
  message: string
  swapData: SwapData
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { txHash } = req.body

  if (!txHash) {
    return res.status(400).json({ message: 'Transaction hash is required' })
  }

  try {
    const response = await fetch('https://navette.jcloud.ik-server.com/swaps', {
      // const response = await fetch('http://localhost:3000/swaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hash: txHash }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        message: 'Failed to execute swap',
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
    }

    const data = await response.json()

    if (data.status !== 'success' || !data.swapData || !data.swapData.sendTx) {
      return res.status(500).json({ message: 'Swap execution failed or incomplete' })
    }

    res.status(200).json(data)
  } catch (error: any) {
    console.error('Swap error:', error)
    res.status(500).json({ message: 'Internal server error', error: error.toString() })
  }
}
