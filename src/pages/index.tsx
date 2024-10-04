import * as React from 'react'
import {
  Text,
  Button,
  useToast,
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { BrowserProvider, Contract, Eip1193Provider, parseEther } from 'ethers'
import { useWeb3ModalProvider, useWeb3ModalAccount, useWalletInfo } from '@web3modal/ethers/react'
import { ERC20_CONTRACT_ADDRESS, ERC20_CONTRACT_ABI } from '../utils/erc20'
import { LinkComponent } from '../components/layout/LinkComponent'
import { ethers } from 'ethers'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingSwap, setIsLoadingSwap] = useState<boolean>(false)
  const [swapAmount, setSwapAmount] = useState<string>('8')

  const [txLink, setTxLink] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [balance, setBalance] = useState<string>('0')
  const [network, setNetwork] = useState<string>('Unknown')
  const [loginType, setLoginType] = useState<string>('Not connected')

  const { address, isConnected, chainId } = useWeb3ModalAccount()

  const { walletProvider } = useWeb3ModalProvider()
  const provider = walletProvider
  const toast = useToast()
  const { walletInfo } = useWalletInfo()

  const getBal = async () => {
    if (isConnected && provider) {
      const ethersProvider = new BrowserProvider(provider as any)
      const balance = await ethersProvider.getBalance(address as any)

      const ethBalance = ethers.formatEther(balance)
      console.log('bal:', Number(parseFloat(ethBalance).toFixed(5)))
      setBalance(parseFloat(ethBalance).toFixed(5))
      if (ethBalance !== '0') {
        return Number(ethBalance)
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  const getNetwork = async () => {
    if (provider) {
      const ethersProvider = new BrowserProvider(provider as any)
      const network = await ethersProvider.getNetwork()
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
      setNetwork(capitalize(network.name))
    }
  }

  const updateLoginType = async () => {
    try {
      if (walletInfo != undefined) {
        setLoginType(walletInfo.name ? walletInfo.name : 'Unknown')
      }
    } catch (error) {
      console.error('Error getting login type:', error)
      setLoginType('Unknown')
    }
  }

  const openEtherscan = () => {
    if (address) {
      const baseUrl = chainId === 11155111 ? 'https://sepolia.etherscan.io/address/' : 'https://etherscan.io/address/'
      window.open(baseUrl + address, '_blank')
    }
  }

  const faucetTx = async () => {
    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Faucet request failed')
      }
      return data.txHash
    } catch (error) {
      console.error('Faucet error:', error)
      throw error
    }
  }

  const doSomething = async () => {
    setTxHash(undefined)
    try {
      if (!isConnected) {
        toast({
          title: 'Not connected yet',
          description: 'Please connect your wallet, my friend.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
        return
      }
      if (provider) {
        setIsLoading(true)
        setTxHash('')
        setTxLink('')
        const ethersProvider = new BrowserProvider(provider as Eip1193Provider)
        const signer = await ethersProvider.getSigner()

        const erc20 = new Contract(ERC20_CONTRACT_ADDRESS, ERC20_CONTRACT_ABI, signer)

        ///// Send ETH if needed /////
        const bal = await getBal()
        console.log('bal:', bal)
        if (bal < 0.025) {
          const faucetTxHash = await faucetTx()
          console.log('faucet tx:', faucetTxHash)
          const bal = await getBal()
          console.log('bal:', bal)
        }
        ///// Call /////
        const call = await erc20.mint(parseEther('10000'))

        let receipt: ethers.ContractTransactionReceipt | null = null
        try {
          receipt = await call.wait()
        } catch (error) {
          console.error('Error waiting for transaction:', error)
          throw new Error('Transaction failed or was reverted')
        }

        if (receipt === null) {
          throw new Error('Transaction receipt is null')
        }

        console.log('tx:', receipt)
        setTxHash(receipt.hash)
        setTxLink('https://sepolia.etherscan.io/tx/' + receipt.hash)
        setIsLoading(false)
        toast({
          title: 'Successful tx',
          description: 'Well done! 🎉',
          status: 'success',
          position: 'bottom',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })
        await getBal()
      }
    } catch (e) {
      setIsLoading(false)
      console.error('Error in doSomething:', e)
      toast({
        title: 'Woops',
        description: e instanceof Error ? e.message : 'Something went wrong...',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }
  const swap = async () => {
    setTxHash(undefined)
    try {
      if (!isConnected) {
        toast({
          title: 'Not connected yet',
          description: 'Please connect your wallet, my friend.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
        return
      }
      if (provider) {
        setIsLoadingSwap(true)
        setTxHash('')
        setTxLink('')
        const ethersProvider = new BrowserProvider(provider as Eip1193Provider)
        const signer = await ethersProvider.getSigner()

        const erc20 = new Contract(ERC20_CONTRACT_ADDRESS, ERC20_CONTRACT_ABI, signer)

        ///// Send ETH if needed /////
        const bal = await getBal()
        console.log('bal:', bal)
        if (bal < 0.025) {
          const faucetTxHash = await faucetTx()
          console.log('faucet tx:', faucetTxHash)
          const bal = await getBal()
          console.log('bal:', bal)
        }
        ///// Call /////
        const call = await erc20.transfer('0xd6B159d56749BeE815dF460FB373B2A1EC1517A8', parseEther(swapAmount))

        let receipt: ethers.ContractTransactionReceipt | null = null
        try {
          receipt = await call.wait()

          if (receipt === null) {
            throw new Error('Transaction receipt is null')
          }

          // Call the swap API route
          const swapResponse = await fetch('/api/swap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txHash: receipt.hash }),
          })

          if (!swapResponse.ok) {
            throw new Error('Failed to execute swap')
          }

          const swapData = await swapResponse.json()
          console.log('Swap response:', swapData)

          if (swapData.swapData && swapData.swapData.sendTx) {
            setTxHash(swapData.swapData.sendTx)
            setTxLink('https://sepolia-optimism.etherscan.io/tx/' + swapData.swapData.sendTx)
            toast({
              title: 'Successful swap',
              description: `Well done! 🎉 Your tokens have been swapped. Amount: ${swapData.swapData.amount} tokens`,
              status: 'success',
              position: 'bottom',
              variant: 'subtle',
              duration: 20000,
              isClosable: true,
            })
          } else {
            throw new Error('Swap response is missing required data')
          }
        } catch (error) {
          console.error('Error executing swap:', error)
          throw error
        }

        setIsLoadingSwap(false)
        await getBal()
      }
    } catch (e) {
      setIsLoadingSwap(false)
      console.error('Error in swap:', e)
      toast({
        title: 'Pending',
        description: "Your swap is being processed, but we can't display the tx hash on OP Sepolia",
        status: 'info',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Head title={SITE_NAME} description={SITE_DESCRIPTION} />
      <main>
        {!isConnected ? (
          <>
            <Text>You can login with your email, Google, Farcaster, or with one of the 400+ wallets suported by this app.</Text>
            <br />
          </>
        ) : (
          <Box
            p={4}
            borderWidth={1}
            borderRadius="lg"
            my={2}
            mb={8}
            onClick={openEtherscan}
            cursor="pointer"
            _hover={{ borderColor: 'blue.500', boxShadow: 'md' }}>
            <Text>
              Network: <strong>{network}</strong>
            </Text>
            <Text>
              Login type: <strong>{loginType}</strong>
            </Text>
            <Text>
              Balance: <strong>{balance} ETH</strong>
            </Text>
            <Text>
              Address: <strong>{address || 'Not connected'}</strong>
            </Text>
          </Box>
        )}
        <Text>
          If you don&apos;t have BASIC tokens on your wallet yet, you can click on the <strong>Mint</strong> button.
        </Text>
        <br />
        <Button
          colorScheme="blue"
          variant="outline"
          type="submit"
          onClick={doSomething}
          isLoading={isLoading}
          loadingText="Minting..."
          spinnerPlacement="end">
          Mint
        </Button>
        <br />
        <Box mt={4} mb={4}>
          <Text mb={2}>You can go ahead and click on Swap to send BASIC tokens from Sepolia to OP Sepolia.</Text>
          <NumberInput value={swapAmount} onChange={(valueString) => setSwapAmount(valueString)} min={1} max={10000} step={1}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        <Button
          colorScheme="green"
          variant="outline"
          type="submit"
          onClick={swap}
          isLoading={isLoadingSwap}
          loadingText="Swapping..."
          spinnerPlacement="end">
          Swap
        </Button>
        {txHash && isConnected && (
          <>
            <Text py={4} fontSize="14px" color="#45a2f8">
              <LinkComponent href={txLink ? txLink : ''}>{txHash}</LinkComponent>
            </Text>
            <Text fontSize="14px">
              You can also check your swap on the <LinkComponent href={'/explorer'}>Navette Explorer</LinkComponent>.
            </Text>
          </>
        )}
      </main>
    </>
  )
}
