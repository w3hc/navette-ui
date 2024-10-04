import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Text,
  Link,
  Spinner,
  useColorModeValue,
  VStack,
  Badge,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

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

export default function Explorer() {
  const [swaps, setSwaps] = useState<SwapData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        const response = await fetch('/api/get-swaps')
        if (!response.ok) {
          throw new Error('Failed to fetch swaps')
        }
        const data: SwapData[] = await response.json()
        // Filter swaps to only include those with a sendTx
        const completedSwaps = data.filter((swap) => swap.sendTx)
        // Sort swaps in descending order by blockNumber
        const sortedSwaps = completedSwaps.sort((a, b) => b.blockNumber - a.blockNumber)
        setSwaps(sortedSwaps)
      } catch (err) {
        setError('Failed to load swaps. Please try again later.')
        console.error('Error fetching swaps:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSwaps()
  }, [])

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Text color="red.500" fontSize="xl">
          {error}
        </Text>
      </Box>
    )
  }

  return (
    <Box p={5} bg={bgColor} color={textColor}>
      <VStack spacing={5} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" mb={5}>
          Navette Swap explorer
        </Heading>
        {swaps.length === 0 ? (
          <Text textAlign="center">No completed swaps found.</Text>
        ) : (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Send Tx</Th>
                  <Th>User</Th>
                  <Th>Amount</Th>
                  <Th>Block Number</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {swaps.map((swap) => (
                  <Tr key={swap.sendTx}>
                    <Td>
                      <Link href={`https://sepolia-optimism.etherscan.io/tx/${swap.sendTx}`} isExternal color="blue.500">
                        {swap.sendTx.substring(0, 10)}...
                        <ExternalLinkIcon mx="2px" />
                      </Link>
                    </Td>
                    <Td>{swap.user.substring(0, 10)}...</Td>
                    <Td>{swap.amount}</Td>
                    <Td>{swap.blockNumber}</Td>
                    <Td>
                      <Badge colorScheme="green">Executed</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>
    </Box>
  )
}
